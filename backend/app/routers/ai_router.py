"""AI endpoints: glass-box numbers computed server-side, LLM only narrates.

Every endpoint injects a DB session, computes the real figures from confirmed
history via the pure ML services, and hands those figures to an agent for
prose. If the model is down the numbers are unchanged and the prose falls back
to a deterministic template. Nothing here can hang (llm_runtime bounds the
call) or crash the app on a missing model (defensive imports upstream).
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db import get_session
from app.schemas.ai_schemas import (
    UpsellRequest, UpsellResponse,
    AnomalyRequest, AnomalyNarrativeResponse,
    NegotiationRequest, NegotiationResponse,
    DealHealthRequest, DealHealthResponse, HealthFeatureOut,
)
from app.services import history_repo
from app.services.market_basket import mine_rules, recommend
from app.services.anomaly import detect_discount_anomaly, detect_stalled, DiscountAnomaly
from app.services.deal_health import score_deal
from app.services.pricing_policy import (LineInput, blended_risk, evaluate_counter,
                                         DEFAULT_TARGET_MARGIN_PCT)
from app.agents.upsell_agent import generate_upsell
from app.agents.anomaly_narrator_agent import generate_anomaly_narrative
from app.agents.negotiation_agent import generate_negotiation_reply
from app.agents.llm_runtime import llm_available

router = APIRouter(prefix="/ai", tags=["ai"])


# --- helpers -----------------------------------------------------------------

def _short_id(quotation_id: str) -> str:
    return f"Q-{str(quotation_id)[:8]}"


def _line_inputs(ctx: dict):
    return [LineInput(list_price=l["list_price"], cost=l["cost"],
                      category_ceiling=l["category_ceiling"],
                      discount_percent=l["discount_percent"], qty=l["quantity"],
                      product_id=l["product_id"]) for l in ctx["lines"]]


def _quote_margin_pct(ctx: dict) -> float:
    net_rev = sum(l["quantity"] * l["list_price"] * (1 - l["discount_percent"] / 100.0)
                  for l in ctx["lines"])
    cost = sum(l["quantity"] * l["cost"] for l in ctx["lines"])
    if net_rev <= 0:
        return 0.0
    return round(100.0 * (net_rev - cost) / net_rev, 2)


def _chosen_score(a: DiscountAnomaly) -> float:
    return a.modified_z_score if a.method == "modified_zscore" else a.z_score


def _worst_line_anomaly(session: Session, ctx: dict):
    """Return (DiscountAnomaly, line_name) for the most abnormal line, or (None, name)."""
    baseline = history_repo.load_rep_discount_sample(
        session, ctx["rep_id"], exclude_quotation_id=ctx["quotation_id"])
    worst = None
    worst_name = ctx["lines"][0]["product_name"] if ctx["lines"] else "line item"
    for l in ctx["lines"]:
        a = detect_discount_anomaly(l["discount_percent"], baseline)
        if worst is None or abs(_chosen_score(a)) > abs(_chosen_score(worst)):
            worst, worst_name = a, l["product_name"]
    return worst, worst_name


# --- endpoints ---------------------------------------------------------------

@router.get("/health")
def ai_health():
    """Reports whether a live LLM is wired up (numbers work regardless)."""
    return {"llm_available": llm_available(), "narration": "gemini" if llm_available() else "deterministic-template"}


@router.post("/upsell", response_model=UpsellResponse)
def upsell_endpoint(payload: UpsellRequest, session: Session = Depends(get_session)):
    meta = history_repo.load_product_meta(session)
    baskets = history_repo.load_confirmed_baskets(session)

    # Resolve the cart to product_ids (accept ids and/or names from the client).
    cart_ids = [pid for pid in payload.cart_product_ids if pid in meta]
    if payload.cart_product_names:
        name_to_id = {m["name"].lower(): pid for pid, m in meta.items()}
        for nm in payload.cart_product_names:
            pid = name_to_id.get(nm.lower())
            if pid is None:  # loose contains-match fallback
                pid = next((p for p, m in meta.items() if nm.lower() in m["name"].lower()), None)
            if pid and pid not in cart_ids:
                cart_ids.append(pid)

    rules = mine_rules(baskets, meta)
    recs = recommend(cart_ids, rules, top_k=payload.top_k)
    return generate_upsell(recs, meta, transactions_analyzed=len(baskets),
                           rules_mined=len(rules), narrate=True)


@router.post("/anomaly-narrative", response_model=AnomalyNarrativeResponse)
def anomaly_narrative_endpoint(payload: AnomalyRequest, session: Session = Depends(get_session)):
    if payload.quotation_id:
        ctx = history_repo.load_quote_context(session, payload.quotation_id)
        if ctx is None:
            raise HTTPException(status_code=404, detail="quotation not found")
        anomaly, line_name = _worst_line_anomaly(session, ctx)
        stall = detect_stalled(ctx["updated_at"], ctx["status"])
        return generate_anomaly_narrative(_short_id(ctx["quotation_id"]), line_name,
                                          anomaly=anomaly, stall=stall, narrate=True)

    # Fallback: ad-hoc call without a persisted quote.
    deal_id = payload.deal_id or "Q-adhoc"
    anomaly = None
    if payload.rep_id is not None and payload.discount_percent is not None:
        baseline = history_repo.load_rep_discount_sample(session, payload.rep_id)
        anomaly = detect_discount_anomaly(payload.discount_percent, baseline)
    return generate_anomaly_narrative(deal_id, "line item", anomaly=anomaly, stall=None, narrate=True)


@router.post("/negotiation-reply", response_model=NegotiationResponse)
def negotiation_reply_endpoint(payload: NegotiationRequest, session: Session = Depends(get_session)):
    target = payload.target_margin_pct or DEFAULT_TARGET_MARGIN_PCT
    product_name = "the product"
    tier = payload.tier or "SILVER"

    if payload.quotation_id and payload.product_id:
        ctx = history_repo.load_quote_context(session, payload.quotation_id)
        if ctx is None:
            raise HTTPException(status_code=404, detail="quotation not found")
        tier = ctx["customer_tier"]
        line = next((l for l in ctx["lines"] if l["product_id"] == payload.product_id), None)
        if line is None:
            raise HTTPException(status_code=404, detail="product not on quotation")
        product_name = line["product_name"]
        li = LineInput(list_price=line["list_price"], cost=line["cost"],
                       category_ceiling=line["category_ceiling"])
    else:
        if payload.list_price is None or payload.cost is None:
            raise HTTPException(status_code=422,
                                detail="provide quotation_id+product_id, or list_price+cost")
        li = LineInput(list_price=payload.list_price, cost=payload.cost,
                       category_ceiling=payload.category_ceiling
                       if payload.category_ceiling is not None else 100.0)

    decision = evaluate_counter(payload.counter_discount, li, tier, target)
    response = generate_negotiation_reply(decision, product_name,
                                          customer_note=payload.customer_note,
                                          customer_tier=tier, narrate=True)

    if payload.persist and payload.quotation_id:
        from uuid import UUID
        from app.models.portal import PortalNegotiation
        try:
            session.add(PortalNegotiation(
                quotation_id=UUID(str(payload.quotation_id)),
                customer_note=payload.customer_note or "",
                counter_discount=payload.counter_discount,
            ))
            session.commit()
        except Exception:
            session.rollback()  # persistence is best-effort; never fail the advice

    return response


@router.post("/deal-health", response_model=DealHealthResponse)
def deal_health_endpoint(payload: DealHealthRequest, session: Session = Depends(get_session)):
    ctx = history_repo.load_quote_context(session, payload.quotation_id)
    if ctx is None:
        raise HTTPException(status_code=404, detail="quotation not found")

    risk = blended_risk(_line_inputs(ctx), ctx["customer_tier"])
    stall = detect_stalled(ctx["updated_at"], ctx["status"])
    anomaly, _ = _worst_line_anomaly(session, ctx)

    health = score_deal(
        margin_pct=_quote_margin_pct(ctx),
        total_overage_pp=risk.total_overage_pp,
        approval_chain=risk.approval_chain,
        stall_severity=stall.severity,
        anomaly_severity=(anomaly.severity if anomaly else "NONE"),
    )
    return DealHealthResponse(
        deal_id=_short_id(ctx["quotation_id"]),
        score=health.score,
        band=health.band,
        features=[HealthFeatureOut(name=f.name, score=f.score, weight=f.weight,
                                   contribution=f.contribution, detail=f.detail)
                  for f in health.features],
        llm_used=False,
    )


# --- Chatbot with Custom Trained Models ---------------------------------------

@router.post("/chat")
def chat_endpoint(payload: dict):
    from app.ml.inference import get_pipeline
    pipeline = get_pipeline()
    msg = payload.get("message", "")
    res = pipeline.chat(msg)
    res["session_id"] = payload.get("session_id", "default")
    return res


@router.get("/chat/suggestions")
def chat_suggestions(screen: Optional[str] = None):
    from app.ml.intents import INTENT_SUGGESTIONS, Intent
    if screen == "billing":
        return {"suggestions": INTENT_SUGGESTIONS[Intent.CHECK_BILLING]}
    elif screen == "subscriptions":
        return {"suggestions": INTENT_SUGGESTIONS[Intent.SUBSCRIPTION_QUERY]}
    elif screen == "quotes":
        return {"suggestions": INTENT_SUGGESTIONS[Intent.DEAL_STATUS]}
    return {"suggestions": INTENT_SUGGESTIONS[Intent.GENERAL]}

