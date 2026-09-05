"""Upsell narration agent.

Consumes market-basket ``Recommendation`` objects (all numbers already
computed) and produces ``UpsellItem``s. The LLM is asked ONLY for a one-line
pitch and a short badge; every numeric field is set from the computed rule. If
the LLM is unavailable/slow/failing, a deterministic template quotes the exact
same numbers, so the recommendation is identical minus the polish.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from app.schemas.ai_schemas import (UpsellItem, UpsellResponse, UpsellBasis, UpsellNarration)
from app.services.market_basket import Recommendation
from app.agents.llm_runtime import run_structured, llm_available

_SYSTEM = ("You translate pre-computed B2B cross-sell statistics into concise, "
           "confident sales language. Do NOT invent or change any number, price, "
           "or percentage. Only write the requested prose.")

_HUMAN = ("Recommend adding '{product}' to a deal that already contains '{anchor}'.\n"
          "Evidence (do not restate as numbers, just be persuasive): appears together in "
          "{confidence_pct}% of comparable orders, lift {lift}x, gross margin {margin_pct}%.\n"
          "Write a single-sentence pitch and a 1-3 word promotion tag.")


def _template_pitch(name: str, anchor: str, conf_pct: int, lift: float, margin_pct: int) -> str:
    return (f"{name} is bought with your {anchor} in {conf_pct}% of comparable orders "
            f"(lift {lift:.1f}x) and carries a {margin_pct}% gross margin.")


def _template_tag(promo: bool) -> str:
    return "Margin booster" if promo else "Frequently bundled"


def build_upsell_item(rec: Recommendation, product_meta: Dict[str, dict],
                      narrate: bool = True) -> UpsellItem:
    meta = product_meta.get(rec.product_id, {})
    anchor_meta = product_meta.get(rec.anchor_product_id, {})
    name = meta.get("name", "Recommended add-on")
    anchor = anchor_meta.get("name", "current item")
    price = float(meta.get("price", 0.0))
    conf_pct = int(round(rec.confidence * 100))
    margin_pct_int = int(round(rec.margin_pct * 100))

    pitch = _template_pitch(name, anchor, conf_pct, rec.lift, margin_pct_int)
    tag = _template_tag(rec.promotion_flag)

    if narrate:
        narration = run_structured(
            task="upsell", system=_SYSTEM, human=_HUMAN,
            variables={"product": name, "anchor": anchor, "confidence_pct": conf_pct,
                       "lift": round(rec.lift, 1), "margin_pct": margin_pct_int},
            output_model=UpsellNarration,
        )
        if narration is not None:
            pitch = narration.pitch or pitch
            tag = narration.promotion_tag or tag

    return UpsellItem(
        product_name=name,
        reasoning=pitch,
        suggested_price=price,
        margin_impact=f"+{margin_pct_int}% gross margin",
        product_id=rec.product_id,
        anchor_product_name=anchor,
        confidence=round(rec.confidence, 4),
        lift=round(rec.lift, 4),
        support=round(rec.support, 4),
        margin_pct=round(rec.margin_pct, 4),
        rank_score=rec.rank_score,
        promotion_flag=rec.promotion_flag,
        promotion_tag=tag,
        pitch=pitch,
    )


def generate_upsell(recommendations: List[Recommendation], product_meta: Dict[str, dict],
                    transactions_analyzed: int, rules_mined: int,
                    narrate: bool = True) -> UpsellResponse:
    used_llm = narrate and llm_available()
    items = [build_upsell_item(r, product_meta, narrate=narrate) for r in recommendations]
    return UpsellResponse(
        recommendations=items,
        basis=UpsellBasis(transactions_analyzed=transactions_analyzed,
                          rules_mined=rules_mined, llm_used=bool(used_llm)),
    )


# --- Legacy entrypoint kept so nothing that imported the old name breaks. ----
def generate_upsell_suggestions(quote_data: dict) -> UpsellResponse:
    """Deprecated: the router now drives upsell via ``generate_upsell`` with
    server-side history. Retained as a safe no-history stub."""
    return UpsellResponse(recommendations=[], basis=UpsellBasis(
        transactions_analyzed=0, rules_mined=0, llm_used=False))
