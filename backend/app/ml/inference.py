"""ChatPipeline — loads both trained models and runs the full chat flow.

Usage:
    from app.ml.inference import ChatPipeline
    pipe = ChatPipeline()
    result = pipe.chat("What is the status of BIL-2045?")
"""
from __future__ import annotations

import os
import re
import logging
from typing import Optional

import torch
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    GPT2TokenizerFast,
    GPT2LMHeadModel,
)

from app.ml.intents import (
    ID_TO_LABEL,
    INTENT_LABELS,
    INTENT_SUGGESTIONS,
    INTENT_DESCRIPTIONS,
    Intent,
)

logger = logging.getLogger("dealflow.chat")

_BASE = os.path.dirname(__file__)
_INTENT_MODEL_DIR = os.path.join(_BASE, "models", "intent_classifier")
_RESPONSE_MODEL_DIR = os.path.join(_BASE, "models", "response_generator")

# Entity extraction patterns
_ENTITY_PATTERNS = {
    "billing_id": re.compile(r"\bBIL-\d{4}\b", re.IGNORECASE),
    "quote_id": re.compile(r"\bQT-\d{4}-\d{4}\b", re.IGNORECASE),
    "subscription_id": re.compile(r"\bSUB-\d{4}\b", re.IGNORECASE),
    "customer_id": re.compile(r"\bCUST-\d{4}\b", re.IGNORECASE),
    "invoice_id": re.compile(r"\bINV-\d{4}\b", re.IGNORECASE),
}

# Fallback template responses when the generator model is unavailable
_FALLBACK_RESPONSES: dict[str, str] = {
    Intent.CHECK_BILLING: "I can look up billing information for you. Could you provide a billing ID (e.g. BIL-2045)?",
    Intent.DEAL_STATUS: "I can check on your deals. Please share a quotation ID (e.g. QT-2026-0184) or ask about the overall pipeline.",
    Intent.UPSELL: "I can suggest cross-sell and upsell opportunities based on purchase patterns. What products are in the current order?",
    Intent.SUBSCRIPTION_QUERY: "I can help with subscription queries. Would you like to see active subscriptions, billing schedules, or plan details?",
    Intent.ANOMALY_ALERT: "I can run anomaly detection on pricing and discounts. Shall I check the current quotes for unusual patterns?",
    Intent.APPROVAL_STATUS: "I can check the approval queue. Would you like to see pending approvals or the approval chain for a specific quote?",
    Intent.CUSTOMER_INFO: "I can look up customer details. Please share a customer name or ID (e.g. CUST-0012).",
    Intent.GENERAL: "Hi! 👋 I'm the DealFlow360 AI Assistant. I can help with billing, deal tracking, upsell recommendations, subscriptions, anomaly alerts, and approval workflows. What would you like to know?",
}

# Context-aware responses for known entities
_BILLING_CONTEXT = {
    "BIL-2045": {
        "id": "BIL-2045",
        "customer": "ABC Industries Ltd.",
        "status": "PARTIALLY_PAID",
        "total": 142500,
        "paid": 60000,
        "outstanding": 82500,
        "currency": "USD",
    },
}


class ChatPipeline:
    """Two-model pipeline: intent classifier → response generator."""

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._intent_model = None
        self._intent_tokenizer = None
        self._gen_model = None
        self._gen_tokenizer = None
        self._load_models()

    # ------------------------------------------------------------------
    # Model loading
    # ------------------------------------------------------------------
    def _load_models(self):
        # Intent classifier
        if os.path.isdir(_INTENT_MODEL_DIR) and os.listdir(_INTENT_MODEL_DIR):
            try:
                self._intent_tokenizer = DistilBertTokenizerFast.from_pretrained(_INTENT_MODEL_DIR)
                self._intent_model = DistilBertForSequenceClassification.from_pretrained(_INTENT_MODEL_DIR)
                self._intent_model.to(self.device)
                self._intent_model.eval()
                logger.info("Intent classifier loaded from %s", _INTENT_MODEL_DIR)
            except Exception as e:
                logger.warning("Failed to load intent classifier: %s", e)
        else:
            logger.warning("Intent classifier model not found at %s — using keyword fallback", _INTENT_MODEL_DIR)

        # Response generator
        if os.path.isdir(_RESPONSE_MODEL_DIR) and os.listdir(_RESPONSE_MODEL_DIR):
            try:
                self._gen_tokenizer = GPT2TokenizerFast.from_pretrained(_RESPONSE_MODEL_DIR)
                self._gen_model = GPT2LMHeadModel.from_pretrained(_RESPONSE_MODEL_DIR)
                self._gen_model.to(self.device)
                self._gen_model.eval()
                logger.info("Response generator loaded from %s", _RESPONSE_MODEL_DIR)
            except Exception as e:
                logger.warning("Failed to load response generator: %s", e)
        else:
            logger.warning("Response generator model not found at %s — using template fallback", _RESPONSE_MODEL_DIR)

    # ------------------------------------------------------------------
    # Intent classification
    # ------------------------------------------------------------------
    def classify_intent(self, text: str) -> tuple[str, float]:
        """Return (intent_label, confidence)."""
        if self._intent_model is not None:
            inputs = self._intent_tokenizer(
                text, truncation=True, max_length=64,
                padding="max_length", return_tensors="pt",
            ).to(self.device)
            with torch.no_grad():
                logits = self._intent_model(**inputs).logits
            probs = torch.softmax(logits, dim=-1)
            confidence, pred_id = torch.max(probs, dim=-1)
            return ID_TO_LABEL[pred_id.item()], round(confidence.item(), 4)

        # Keyword fallback when model is not loaded
        return self._keyword_classify(text)

    def _keyword_classify(self, text: str) -> tuple[str, float]:
        """Simple keyword-based intent detection as fallback."""
        text_lower = text.lower()
        keyword_map = {
            Intent.CHECK_BILLING: ["billing", "invoice", "payment", "paid", "outstanding", "balance", "bil-"],
            Intent.DEAL_STATUS: ["deal", "quote", "quotation", "pipeline", "margin", "qt-", "stage"],
            Intent.UPSELL: ["upsell", "cross-sell", "recommend", "bundle", "add-on", "attach"],
            Intent.SUBSCRIPTION_QUERY: ["subscription", "recurring", "mrr", "churn", "renew", "sub-", "plan"],
            Intent.ANOMALY_ALERT: ["anomaly", "anomalies", "unusual", "suspicious", "risk", "z-score", "flag"],
            Intent.APPROVAL_STATUS: ["approval", "approve", "pending", "reject", "escalat"],
            Intent.CUSTOMER_INFO: ["customer", "client", "cust-", "contact", "account"],
        }
        for intent, keywords in keyword_map.items():
            if any(kw in text_lower for kw in keywords):
                return intent, 0.75
        return Intent.GENERAL, 0.60

    # ------------------------------------------------------------------
    # Entity extraction
    # ------------------------------------------------------------------
    def extract_entities(self, text: str) -> dict[str, str]:
        """Extract known entity IDs from the user message."""
        entities = {}
        for entity_type, pattern in _ENTITY_PATTERNS.items():
            match = pattern.search(text)
            if match:
                entities[entity_type] = match.group(0).upper()
        return entities

    # ------------------------------------------------------------------
    # Context retrieval
    # ------------------------------------------------------------------
    def get_context(self, intent: str, entities: dict) -> str:
        """Build a context string from known data. In production this queries the DB."""
        if intent == Intent.CHECK_BILLING and "billing_id" in entities:
            bil = _BILLING_CONTEXT.get(entities["billing_id"])
            if bil:
                return (
                    f"Billing ID: {bil['id']}, Status: {bil['status']}, "
                    f"Total: ${bil['total']:,.0f}, Paid: ${bil['paid']:,.0f}, "
                    f"Outstanding: ${bil['outstanding']:,.0f}, "
                    f"Customer: {bil['customer']}"
                )
        return ""

    # ------------------------------------------------------------------
    # Response generation
    # ------------------------------------------------------------------
    def generate_response(self, intent: str, context: str, user_message: str) -> str:
        """Generate a natural language response."""
        if self._gen_model is not None:
            prompt = f"[INTENT] {intent}\n[CONTEXT] {context}\n[USER] {user_message}\n[RESPONSE]"
            inputs = self._gen_tokenizer(prompt, return_tensors="pt", truncation=True, max_length=180).to(self.device)
            with torch.no_grad():
                output = self._gen_model.generate(
                    **inputs,
                    max_new_tokens=120,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    pad_token_id=self._gen_tokenizer.pad_token_id,
                    repetition_penalty=1.2,
                )
            generated = self._gen_tokenizer.decode(output[0], skip_special_tokens=False)
            if "[RESPONSE]" in generated:
                response = generated.split("[RESPONSE]")[-1].strip()
                response = response.split("<|endoftext|>")[0].strip()
                response = response.split("<|pad|>")[0].strip()
                if len(response) > 20:
                    return response

        # Fallback to template
        return self._template_response(intent, context, user_message)

    def _template_response(self, intent: str, context: str, user_message: str) -> str:
        """Deterministic template fallback."""
        if intent == Intent.CHECK_BILLING and context:
            return f"Here's what I found:\n\n{context}\n\nWould you like to download the invoice or send a payment reminder?"
        if intent == Intent.GENERAL:
            lower = user_message.lower().strip()
            if lower in ("hello", "hi", "hey", "hi there", "good morning", "good afternoon"):
                return _FALLBACK_RESPONSES[Intent.GENERAL]
            if "thank" in lower:
                return "You're welcome! 😊 Let me know if you need anything else."
            if "what can you do" in lower or "help" in lower:
                return _FALLBACK_RESPONSES[Intent.GENERAL]
        return _FALLBACK_RESPONSES.get(intent, _FALLBACK_RESPONSES[Intent.GENERAL])

    # ------------------------------------------------------------------
    # Main chat method
    # ------------------------------------------------------------------
    def chat(self, message: str, context_override: Optional[str] = None) -> dict:
        """Full pipeline: classify → extract entities → get context → generate response."""
        intent, confidence = self.classify_intent(message)
        entities = self.extract_entities(message)
        context = context_override or self.get_context(intent, entities)
        reply = self.generate_response(intent, context, message)
        suggestions = INTENT_SUGGESTIONS.get(intent, INTENT_SUGGESTIONS[Intent.GENERAL])

        return {
            "reply": reply,
            "intent": intent,
            "confidence": confidence,
            "entities": entities,
            "suggestions": suggestions,
            "model_used": {
                "classifier": self._intent_model is not None,
                "generator": self._gen_model is not None,
            },
        }

    @property
    def is_loaded(self) -> bool:
        return self._intent_model is not None


# Singleton instance — initialised lazily
_pipeline: Optional[ChatPipeline] = None


def get_pipeline() -> ChatPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = ChatPipeline()
    return _pipeline
