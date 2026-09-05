"""Read-only history access for the AI layer.

All SQL lives here so the ML services (``market_basket``, ``anomaly``,
``deal_health``) stay pure functions over plain Python values and are unit-
testable without a database. Everything is keyed by ``str(uuid)`` so the ML
side never touches the ORM types.

"Order history" is simply confirmed quotations: a basket is the distinct set of
products on one CONFIRMED quote, and a rep's discount baseline is the discounts
on their CONFIRMED lines (the in-flight quote under review is excluded so it
never pollutes its own baseline).
"""
from __future__ import annotations

from typing import Dict, List, Optional
from uuid import UUID

from sqlmodel import Session, select

from app.models.product import Product
from app.models.customer import Customer
from app.models.quotation import Quotation, QuotationLine, QuoteStatus


def _as_uuid(value) -> Optional[UUID]:
    if isinstance(value, UUID):
        return value
    try:
        return UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None


def load_product_meta(session: Session) -> Dict[str, dict]:
    """product_id(str) -> {name, price, cost, category, discount_ceiling}."""
    meta: Dict[str, dict] = {}
    for p in session.exec(select(Product)).all():
        meta[str(p.id)] = {
            "product_id": str(p.id),
            "name": p.name,
            "price": p.price,
            "cost": p.cost,
            "category": p.category,
            "discount_ceiling": p.discount_ceiling,
        }
    return meta


def load_confirmed_baskets(session: Session) -> List[List[str]]:
    """One basket (list of distinct product_id strings) per CONFIRMED quote."""
    quote_ids = session.exec(
        select(Quotation.id).where(Quotation.status == QuoteStatus.CONFIRMED)
    ).all()
    if not quote_ids:
        return []
    lines = session.exec(
        select(QuotationLine.quotation_id, QuotationLine.product_id)
        .where(QuotationLine.quotation_id.in_(quote_ids))
    ).all()
    grouped: Dict[UUID, set] = {}
    for quotation_id, product_id in lines:
        grouped.setdefault(quotation_id, set()).add(str(product_id))
    return [sorted(items) for items in grouped.values() if items]


def load_rep_discount_sample(
    session: Session,
    rep_id,
    statuses=(QuoteStatus.CONFIRMED,),
    exclude_quotation_id=None,
) -> List[float]:
    """All line-level discount_percent values for a rep's quotes (baseline)."""
    rep_uuid = _as_uuid(rep_id)
    if rep_uuid is None:
        return []
    q = select(Quotation.id).where(Quotation.rep_id == rep_uuid)
    if statuses:
        q = q.where(Quotation.status.in_(list(statuses)))
    quote_ids = list(session.exec(q).all())
    exclude = _as_uuid(exclude_quotation_id)
    if exclude is not None:
        quote_ids = [qid for qid in quote_ids if qid != exclude]
    if not quote_ids:
        return []
    discounts = session.exec(
        select(QuotationLine.discount_percent)
        .where(QuotationLine.quotation_id.in_(quote_ids))
    ).all()
    return [float(d) for d in discounts]


def load_quote_context(session: Session, quotation_id) -> Optional[dict]:
    """Full context for one quote: header + customer tier + enriched lines.

    Returns None if the quote does not exist. Each line carries the product's
    price/cost/ceiling so callers can compute margin, overage, and anomalies
    without further lookups.
    """
    qid = _as_uuid(quotation_id)
    if qid is None:
        return None
    quote = session.get(Quotation, qid)
    if quote is None:
        return None
    customer = session.get(Customer, quote.customer_id)
    tier = customer.tier.value if customer else "BRONZE"

    meta = load_product_meta(session)
    lines = session.exec(
        select(QuotationLine).where(QuotationLine.quotation_id == qid)
    ).all()
    enriched = []
    for ln in lines:
        pm = meta.get(str(ln.product_id), {})
        enriched.append({
            "product_id": str(ln.product_id),
            "product_name": pm.get("name", "Unknown"),
            "quantity": ln.quantity,
            "unit_price": ln.unit_price,
            "cost": pm.get("cost", 0.0),
            "list_price": pm.get("price", ln.unit_price),
            "discount_percent": ln.discount_percent,
            "category_ceiling": pm.get("discount_ceiling", 20.0),
            "line_total": ln.line_total,
        })
    return {
        "quotation_id": str(quote.id),
        "rep_id": str(quote.rep_id),
        "customer_id": str(quote.customer_id),
        "customer_tier": tier,
        "status": quote.status.value if hasattr(quote.status, "value") else str(quote.status),
        "blended_risk": quote.blended_risk,
        "created_at": quote.created_at,
        "updated_at": quote.updated_at,
        "lines": enriched,
    }
