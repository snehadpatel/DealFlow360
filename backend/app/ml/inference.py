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
        """Return (intent_label, confidence) using fine-tuned model + domain heuristics."""
        text_lower = text.lower().strip()

        # Domain heuristic overrides for explicit phrases
        if any(p in text_lower for p in ["best quote", "best quotation", "top quote", "top deal", "highest margin", "which quote", "which quotation"]):
            return Intent.DEAL_STATUS.value, 0.98

        if self._intent_model is not None:
            inputs = self._intent_tokenizer(
                text, truncation=True, max_length=64,
                padding="max_length", return_tensors="pt",
            ).to(self.device)
            with torch.no_grad():
                logits = self._intent_model(**inputs).logits
            probs = torch.softmax(logits, dim=-1)
            confidence, pred_id = torch.max(probs, dim=-1)
            predicted_label = ID_TO_LABEL[pred_id.item()]
            conf = round(confidence.item(), 4)

            # If neural model is borderline (<0.75), apply domain keyword verification
            if conf < 0.75:
                keyword_intent, kw_conf = self._keyword_classify(text)
                if keyword_intent != Intent.GENERAL.value:
                    return keyword_intent, max(conf, kw_conf)

            return predicted_label, conf

        # Keyword fallback when model is not loaded
        return self._keyword_classify(text)

    def _keyword_classify(self, text: str) -> tuple[str, float]:
        """Simple keyword-based intent detection as fallback."""
        text_lower = text.lower()
        keyword_map = {
            Intent.APPROVAL_STATUS: ["approval queue", "pending approval", "approve quote", "approver", "manager approval", "finance approval"],
            Intent.CHECK_BILLING: ["billing", "invoice", "payment", "paid", "outstanding", "balance", "bil-", "inv-"],
            Intent.DEAL_STATUS: ["deal", "quote", "quotation", "pipeline", "margin", "qt-", "best quotation", "top deal"],
            Intent.UPSELL: ["upsell", "cross-sell", "recommend", "bundle", "add-on", "attach"],
            Intent.SUBSCRIPTION_QUERY: ["subscription", "recurring", "mrr", "churn", "renew", "sub-", "plan"],
            Intent.ANOMALY_ALERT: ["anomaly", "anomalies", "unusual", "suspicious", "risk score", "z-score", "flagged"],
            Intent.CUSTOMER_INFO: ["customer", "client", "cust-", "contact", "tier", "credit limit"],
        }
        for intent, keywords in keyword_map.items():
            if any(kw in text_lower for kw in keywords):
                return intent.value, 0.85
        return Intent.GENERAL.value, 0.60

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
    # Context retrieval from live database
    # ------------------------------------------------------------------
    def get_context(self, intent: str, entities: dict) -> str:
        """Build a factual context string from the live database."""
        try:
            from sqlmodel import Session, select
            from app.db import engine
            from app.models.customer import Customer
            from app.models.quotation import Quotation
            from app.models.invoice import Invoice
            from app.models.subscription import CustomerSubscription, SubscriptionPlan
            from app.models.approval import ApprovalRequest, ApprovalStatus
            from app.models.discount_rule import UpsellRule
            from app.models.product import Product

            with Session(engine) as session:
                if intent == Intent.SUBSCRIPTION_QUERY:
                    subs = session.exec(select(CustomerSubscription)).all()
                    plans = session.exec(select(SubscriptionPlan)).all()
                    plan_map = {p.id: p for p in plans}
                    cust_map = {c.id: c.name for c in session.exec(select(Customer)).all()}
                    
                    lines = []
                    lines.append(f"📊 **Active Subscriptions ({len(subs)} Total):**")
                    for s in subs:
                        plan = plan_map.get(s.plan_id)
                        cname = cust_map.get(s.customer_id, "Enterprise Account")
                        plan_name = plan.name if plan else "Cloud Plan"
                        price = f"₹{plan.price:,.0f}" if plan else "Standard"
                        cycle = plan.billing_cycle.value if plan else "Annual"
                        lines.append(
                            f"• **{cname}**: {plan_name} ({price}/{cycle}) — Status: `{s.status.value}`, "
                            f"Next Billing: **{s.next_billing_date}** (Qty: {s.quantity})"
                        )
                    if plans:
                        lines.append("\n💡 **Available Plans in Catalog:**")
                        for p in plans:
                            lines.append(f"• **{p.name}** ({p.billing_cycle.value}): ₹{p.price:,.0f} — {p.description}")
                    return "\n".join(lines)

                elif intent == Intent.CHECK_BILLING:
                    inv_id = entities.get("invoice_id") or entities.get("billing_id")
                    invoices = session.exec(select(Invoice)).all()
                    cust_map = {c.id: c.name for c in session.exec(select(Customer)).all()}
                    
                    if inv_id:
                        matched = [i for i in invoices if inv_id.lower() in (i.invoice_number or "").lower()]
                        if matched:
                            inv = matched[0]
                            cname = cust_map.get(inv.customer_id, "Customer")
                            return (
                                f"🧾 **Invoice {inv.invoice_number} Details:**\n"
                                f"• **Customer:** {cname}\n"
                                f"• **Status:** `{inv.status.value}`\n"
                                f"• **Total Amount:** ₹{inv.amount:,.2f}\n"
                                f"• **Amount Paid:** ₹{inv.amount_paid:,.2f}\n"
                                f"• **Outstanding Balance:** **₹{inv.outstanding_amount:,.2f}**\n"
                                f"• **Due Date:** {inv.due_date}"
                            )

                    lines = [f"🧾 **Recent Invoices Summary ({len(invoices)} Total):**"]
                    for inv in invoices[:5]:
                        cname = cust_map.get(inv.customer_id, "Customer")
                        lines.append(
                            f"• **{inv.invoice_number}** ({cname}): ₹{inv.amount:,.0f} | "
                            f"Outstanding: **₹{inv.outstanding_amount:,.0f}** | Status: `{inv.status.value}` (Due: {inv.due_date})"
                        )
                    return "\n".join(lines)

                elif intent == Intent.DEAL_STATUS:
                    quotes = session.exec(select(Quotation)).all()
                    cust_map = {c.id: c.name for c in session.exec(select(Customer)).all()}
                    
                    if not quotes:
                        return "💼 **Quotations & Deals:** No active quotations found in the pipeline."

                    # Determine best deals
                    best_revenue = max(quotes, key=lambda q: q.total or 0)
                    best_margin = max(quotes, key=lambda q: q.margin_percent or 0)
                    total_pipeline = sum(q.total or 0 for q in quotes)
                    c_rev = cust_map.get(best_revenue.customer_id, "Customer")
                    c_mgn = cust_map.get(best_margin.customer_id, "Customer")

                    lines = []
                    lines.append(f"💼 **Pipeline Overview ({len(quotes)} Deals | Total: ₹{total_pipeline:,.0f}):**")
                    lines.append(
                        f"🏆 **Highest Value Deal:** Quote #{str(best_revenue.id)[:8]} ({c_rev}) — "
                        f"**₹{best_revenue.total:,.0f}** (Margin: **{best_revenue.margin_percent:.1f}%**, Status: `{best_revenue.status.value}`)"
                    )
                    if best_margin.id != best_revenue.id:
                        lines.append(
                            f"⭐ **Highest Margin Deal:** Quote #{str(best_margin.id)[:8]} ({c_mgn}) — "
                            f"**{best_margin.margin_percent:.1f}% Margin** (Total: ₹{best_margin.total:,.0f}, Status: `{best_margin.status.value}`)"
                        )
                    
                    lines.append("\n📋 **All Quotations Breakdown:**")
                    for q in quotes:
                        cname = cust_map.get(q.customer_id, "Customer")
                        risk_tag = f"⚠️ Risk: {q.blended_risk:.0f}%" if q.blended_risk and q.blended_risk > 50 else f"✅ Risk: {q.blended_risk:.0f}%"
                        lines.append(
                            f"• **Quote #{str(q.id)[:8]}** ({cname}): ₹{q.total:,.0f} | "
                            f"Margin: **{q.margin_percent:.1f}%** | Status: `{q.status.value}` | {risk_tag}"
                        )
                    return "\n".join(lines)

                elif intent == Intent.APPROVAL_STATUS:
                    approvals = session.exec(select(ApprovalRequest).where(ApprovalRequest.status == ApprovalStatus.PENDING)).all()
                    lines = [f"🛡️ **Pending Approval Queue ({len(approvals)} Action Items):**"]
                    if not approvals:
                        lines.append("• No pending approvals at this time. All quotes are clear!")
                    for a in approvals:
                        lines.append(
                            f"• **Level {a.approval_level} ({a.approver_role})**: Quote #{str(a.quotation_id)[:8]} — "
                            f"Status: `{a.status.value}` (Quote Version: v{a.quote_version})"
                        )
                    return "\n".join(lines)

                elif intent == Intent.ANOMALY_ALERT:
                    quotes = session.exec(select(Quotation)).all()
                    cust_map = {c.id: c.name for c in session.exec(select(Customer)).all()}
                    high_risk = [q for q in quotes if q.blended_risk and q.blended_risk >= 50.0]
                    lines = [f"🚨 **Risk & Anomaly Governance Alerts ({len(high_risk)} Flagged Deals):**"]
                    if not high_risk:
                        lines.append("• No high-risk pricing anomalies detected. Margin ceilings within safe thresholds.")
                    for q in high_risk:
                        cname = cust_map.get(q.customer_id, "Customer")
                        lines.append(
                            f"• **Quote #{str(q.id)[:8]}** ({cname}): Blended Risk **{q.blended_risk:.1f}%** ({q.risk_level}) — "
                            f"Discount: ₹{q.discount_total:,.0f} | Margin: {q.margin_percent:.1f}% | Status: `{q.status.value}`"
                        )
                    return "\n".join(lines)

                elif intent == Intent.CUSTOMER_INFO:
                    customers = session.exec(select(Customer)).all()
                    lines = [f"🏢 **Customer Directory ({len(customers)} Accounts):**"]
                    for c in customers:
                        lines.append(
                            f"• **{c.name}** ({c.tier.value} Tier): Credit Limit **₹{c.credit_limit:,.0f}** | "
                            f"Terms: `{c.payment_terms}` | Email: {c.email}"
                        )
                    return "\n".join(lines)

                elif intent == Intent.UPSELL:
                    rules = session.exec(select(UpsellRule)).all()
                    prod_map = {p.id: p.name for p in session.exec(select(Product)).all()}
                    lines = ["🎯 **Active Upsell & Cross-Sell Rules:**"]
                    for r in rules:
                        base = prod_map.get(r.product_id, "Base Product")
                        rec = prod_map.get(r.recommended_product_id, "Recommended Item")
                        lines.append(f"• **When ordering {base}** ➔ Recommend **{rec}** ({r.promotion}, +{r.min_margin_impact}% margin impact)")
                    return "\n".join(lines)

        except Exception as e:
            logger.warning("Database context lookup error: %s", e)

        # Fallback static context
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
        """Generate a natural language response grounded in context."""
        if context:
            return context

        if self._gen_model is not None:
            try:
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
                    if len(response) > 25 and not response.endswith(":"):
                        return response
            except Exception as e:
                logger.warning("Generation error: %s", e)

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
