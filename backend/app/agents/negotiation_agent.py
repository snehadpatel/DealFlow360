"""Negotiation Copilot agent.

The financial decision (ACCEPT / COUNTER / ESCALATE, the recommended counter,
the margin, the approval chain) is computed by ``pricing_policy.evaluate_counter``
and passed in. The LLM only drafts the customer-facing reply and an internal
nudge — it never picks the number. Deterministic templates cover the LLM-down
path with the identical recommended terms.
"""
from __future__ import annotations

from typing import Optional

from app.schemas.ai_schemas import NegotiationResponse, NegotiationNarration
from app.services.pricing_policy import CounterDecision
from app.agents.llm_runtime import run_structured, llm_available

_SYSTEM = ("You are a B2B sales negotiation assistant. Write in a polite, firm, "
           "professional tone. You MUST propose exactly the recommended discount "
           "given; never invent a different number or promise anything beyond it.")

_HUMAN = ("Product: {product}. Customer tier: {tier}. Customer said: \"{note}\".\n"
          "Policy decision: {decision}. Recommended discount to offer: {recommended}% "
          "(customer asked for {counter}%). Projected margin at recommended: {rec_margin}%. "
          "{approval_clause}\n"
          "Write: (1) a reply to the customer proposing the recommended discount, "
          "(2) a one-line internal nudge telling the rep what to do and why.")


def _template_reply(d: CounterDecision, product: str) -> str:
    if d.decision == "ACCEPT":
        return (f"Thank you for your proposal. We're glad to confirm a {d.counter_discount:.1f}% "
                f"discount on the {product}. We'll update your quote accordingly and proceed.")
    if d.decision == "COUNTER":
        return (f"Thank you for your interest in the {product}. To keep the pricing sustainable "
                f"we can offer {d.recommended_counter_discount:.1f}%, which is the strongest "
                f"discount we can extend at this volume. We'd be glad to move forward on that basis.")
    return (f"Thank you for the counter-offer on the {product}. A {d.counter_discount:.1f}% discount "
            f"needs additional internal approval, so I don't want to hold you up: we can apply "
            f"{d.recommended_counter_discount:.1f}% immediately, and I'll pursue the larger figure in "
            f"parallel and follow up.")


def _template_nudge(d: CounterDecision) -> str:
    chain = " then ".join(d.approval_chain) if d.approval_chain else "no sign-off needed"
    return (f"{d.decision}: offer {d.recommended_counter_discount:.1f}% (customer asked "
            f"{d.counter_discount:.1f}%). Margin {d.recommended_margin_pct:.0f}% at recommended vs "
            f"{d.projected_margin_pct:.0f}% at their ask. Ceiling {d.allowed_ceiling:.0f}%; {chain}.")


def generate_negotiation_reply(decision: CounterDecision, product_name: str,
                               customer_note: Optional[str] = None,
                               customer_tier: Optional[str] = None,
                               narrate: bool = True) -> NegotiationResponse:
    reply = _template_reply(decision, product_name)
    nudge = _template_nudge(decision)
    used_llm = False

    if narrate:
        if decision.approval_chain:
            approval_clause = f"This requires {' then '.join(decision.approval_chain)} approval."
        else:
            approval_clause = "No additional approval is required."
        result = run_structured(
            task="negotiation", system=_SYSTEM, human=_HUMAN,
            variables={"product": product_name, "tier": customer_tier or "standard",
                       "note": customer_note or "(no note provided)",
                       "decision": decision.decision,
                       "recommended": round(decision.recommended_counter_discount, 1),
                       "counter": round(decision.counter_discount, 1),
                       "rec_margin": round(decision.recommended_margin_pct, 0),
                       "approval_clause": approval_clause},
            output_model=NegotiationNarration,
        )
        if result is not None:
            reply = result.reply_draft or reply
            nudge = result.internal_nudge or nudge
            used_llm = True

    return NegotiationResponse(
        decision=decision.decision,
        counter_discount=decision.counter_discount,
        allowed_ceiling=decision.allowed_ceiling,
        margin_floor_discount=decision.margin_floor_discount,
        policy_safe_max_discount=decision.policy_safe_max_discount,
        recommended_counter_discount=decision.recommended_counter_discount,
        projected_margin_pct=decision.projected_margin_pct,
        recommended_margin_pct=decision.recommended_margin_pct,
        overage_pp=decision.overage_pp,
        approval_chain=decision.approval_chain,
        policy_notes=decision.policy_notes,
        reply_draft=reply,
        internal_nudge=nudge,
        llm_used=used_llm,
    )
