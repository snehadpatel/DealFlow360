"""Quotation service: the single home for all quote business logic.

Responsibilities:
    * Pricing math (subtotal, discount, tax, margin, total) - pure helpers
    * Quote creation with **idempotency** (safe against double-submits)
    * Recalculation + blended risk scoring (via ``risk_engine``)
    * Rule-conflict detection (via ``rule_engine``)
    * **Version history** - approved versions are snapshotted, never overwritten
    * **Expiry** - quotes cannot be confirmed past their validity window
    * Edits / customer negotiations that automatically trigger **re-approval**
      (delegated to ``approval_service``)

Routers stay thin: they parse the request, call one function here, and shape the
response. No business rules live in the routers.
"""
import json
from datetime import datetime, timedelta
from typing import Iterable, Optional, Sequence
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.audit import AuditLog
from app.models.customer import Customer
from app.models.product import Product
from app.models.quotation import (
    Quotation,
    QuotationLine,
    QuotationVersion,
    QuoteStatus,
)
from app.models.user import Role, User
from app.services import audit_service, risk_engine, rule_engine
from app.services.audit_service import AuditAction

DEFAULT_VALIDITY_DAYS = 15


# ---------------------------------------------------------------------------
# Pure pricing math (no DB) - unit-testable in isolation
# ---------------------------------------------------------------------------

def price_line(
    unit_price: float,
    unit_cost: float,
    quantity: int,
    discount_percent: float,
    tax_rate: float,
) -> dict:
    """Compute the money breakdown for one line.

    line_subtotal = unit_price * quantity            (gross, pre-discount)
    discount_amount = line_subtotal * discount%       (as a fraction)
    net = line_subtotal - discount_amount             (post-discount, pre-tax)
    tax_amount = net * tax_rate%
    line_total = net + tax_amount                     (final payable for the line)
    """
    line_subtotal = round(unit_price * quantity, 2)
    discount_amount = round(line_subtotal * (discount_percent / 100.0), 2)
    net = round(line_subtotal - discount_amount, 2)
    tax_amount = round(net * (tax_rate / 100.0), 2)
    line_total = round(net + tax_amount, 2)
    line_cost = round(unit_cost * quantity, 2)
    return {
        "line_subtotal": line_subtotal,
        "discount_amount": discount_amount,
        "net": net,
        "tax_amount": tax_amount,
        "line_total": line_total,
        "line_cost": line_cost,
    }


def aggregate_totals(lines: Sequence[dict]) -> dict:
    """Aggregate priced lines into quote-level totals and margin.

    Each item must expose ``line_subtotal``, ``discount_amount``, ``tax_amount``,
    ``line_total`` and ``line_cost`` (as produced by :func:`price_line`).
    """
    subtotal = round(sum(l["line_subtotal"] for l in lines), 2)
    discount_total = round(sum(l["discount_amount"] for l in lines), 2)
    tax_total = round(sum(l["tax_amount"] for l in lines), 2)
    total = round(sum(l["line_total"] for l in lines), 2)
    total_cost = round(sum(l["line_cost"] for l in lines), 2)
    net_revenue = round(subtotal - discount_total, 2)
    margin = round(net_revenue - total_cost, 2)
    margin_percent = round((margin / net_revenue * 100.0), 2) if net_revenue > 0 else 0.0
    return {
        "subtotal": subtotal,
        "discount_total": discount_total,
        "tax_total": tax_total,
        "total": total,
        "total_cost": total_cost,
        "net_revenue": net_revenue,
        "margin": margin,
        "margin_percent": margin_percent,
    }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _load_products(session: Session, product_ids: Iterable[UUID]) -> dict[UUID, Product]:
    ids = list({pid for pid in product_ids})
    if not ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quote must contain at least one line item.")
    products = session.exec(select(Product).where(Product.id.in_(ids))).all()
    found = {p.id: p for p in products}
    missing = [str(pid) for pid in ids if pid not in found]
    if missing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unknown product(s): {', '.join(missing)}")
    inactive = [p.name for p in found.values() if not p.active]
    if inactive:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Inactive product(s): {', '.join(inactive)}")
    return found


def _lines_for_quote(session: Session, quotation_id: UUID) -> list[QuotationLine]:
    return list(session.exec(select(QuotationLine).where(QuotationLine.quotation_id == quotation_id)))


def _risk_inputs(session: Session, lines: Sequence[QuotationLine]) -> list[dict]:
    """Build the per-line inputs the risk/rule engines expect (category + weight)."""
    product_ids = [l.product_id for l in lines]
    products = session.exec(select(Product).where(Product.id.in_(product_ids))).all() if product_ids else []
    cat = {p.id: p.category for p in products}
    return [
        {
            "category": cat.get(l.product_id, ""),
            "discount_percent": l.discount_percent,
            "weight": l.line_subtotal,
        }
        for l in lines
    ]


def _rule_inputs(session: Session, lines: Sequence[QuotationLine]) -> list[dict]:
    product_ids = [l.product_id for l in lines]
    products = session.exec(select(Product).where(Product.id.in_(product_ids))).all() if product_ids else []
    pmap = {p.id: p for p in products}
    inputs = []
    for l in lines:
        p = pmap.get(l.product_id)
        inputs.append(
            {
                "product_id": str(l.product_id),
                "product_name": p.name if p else str(l.product_id),
                "category": p.category if p else "",
                "requested_discount": l.discount_percent,
                "product_ceiling": p.discount_ceiling if p else None,
            }
        )
    return inputs


def _serialize_snapshot(quotation: Quotation, lines: Sequence[QuotationLine]) -> str:
    payload = {
        "version": quotation.version,
        "status": quotation.status.value if hasattr(quotation.status, "value") else str(quotation.status),
        "customer_id": str(quotation.customer_id),
        "rep_id": str(quotation.rep_id),
        "subtotal": quotation.subtotal,
        "discount_total": quotation.discount_total,
        "tax_total": quotation.tax_total,
        "total": quotation.total,
        "margin": quotation.margin,
        "margin_percent": quotation.margin_percent,
        "blended_risk": quotation.blended_risk,
        "risk_level": quotation.risk_level,
        "expires_at": quotation.expires_at.isoformat() if quotation.expires_at else None,
        "lines": [
            {
                "product_id": str(l.product_id),
                "quantity": l.quantity,
                "unit_price": l.unit_price,
                "unit_cost": l.unit_cost,
                "discount_percent": l.discount_percent,
                "tax_rate": l.tax_rate,
                "line_subtotal": l.line_subtotal,
                "discount_amount": l.discount_amount,
                "tax_amount": l.tax_amount,
                "line_total": l.line_total,
            }
            for l in lines
        ],
    }
    return json.dumps(payload)


def snapshot_version(
    session: Session,
    quotation: Quotation,
    *,
    reason: Optional[str],
    user_id: Optional[UUID],
    lines: Optional[Sequence[QuotationLine]] = None,
) -> QuotationVersion:
    """Write an immutable snapshot of the quote's *current* state (stages only)."""
    if lines is None:
        lines = _lines_for_quote(session, quotation.id)
    version = QuotationVersion(
        quotation_id=quotation.id,
        version=quotation.version,
        status=quotation.status.value if hasattr(quotation.status, "value") else str(quotation.status),
        subtotal=quotation.subtotal,
        discount_total=quotation.discount_total,
        tax_total=quotation.tax_total,
        total=quotation.total,
        margin=quotation.margin,
        blended_risk=quotation.blended_risk,
        risk_level=quotation.risk_level,
        snapshot=_serialize_snapshot(quotation, lines),
        reason=reason,
        created_by=user_id,
    )
    session.add(version)
    return version


def recalculate(session: Session, quotation: Quotation) -> dict:
    """Recompute totals, margin and blended risk from the current lines.

    Mutates ``quotation`` in place (stages only - caller commits) and returns a
    metrics dict including any rule conflicts/violations for the caller to audit.
    """
    lines = _lines_for_quote(session, quotation.id)
    totals = aggregate_totals(
        [
            {
                "line_subtotal": l.line_subtotal,
                "discount_amount": l.discount_amount,
                "tax_amount": l.tax_amount,
                "line_total": l.line_total,
                "line_cost": round(l.unit_cost * l.quantity, 2),
            }
            for l in lines
        ]
    )
    assessment = risk_engine.assess(
        _risk_inputs(session, lines),
        customer_tier=_customer_tier(session, quotation.customer_id),
        margin_percent=totals["margin_percent"],
    )
    conflicts = rule_engine.evaluate_quote(_rule_inputs(session, lines), tier=_customer_tier(session, quotation.customer_id))

    quotation.subtotal = totals["subtotal"]
    quotation.discount_total = totals["discount_total"]
    quotation.tax_total = totals["tax_total"]
    quotation.total = totals["total"]
    quotation.margin = totals["margin"]
    quotation.margin_percent = totals["margin_percent"]
    quotation.blended_risk = assessment["blended_risk"]
    quotation.risk_level = assessment["risk_level"]
    quotation.updated_at = datetime.utcnow()
    session.add(quotation)

    return {"totals": totals, "assessment": assessment, "rules": conflicts, "weighted_discount": assessment["weighted_discount_percent"]}


def _customer_tier(session: Session, customer_id: UUID) -> str:
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    return customer.tier.value if hasattr(customer.tier, "value") else str(customer.tier)


# ---------------------------------------------------------------------------
# Lifecycle operations (invoked by routers - these commit)
# ---------------------------------------------------------------------------

def create_quote(
    session: Session,
    *,
    customer_id: UUID,
    rep_id: UUID,
    items: Sequence,
    idempotency_key: Optional[str] = None,
    expires_in_days: int = DEFAULT_VALIDITY_DAYS,
    notes: Optional[str] = None,
) -> Quotation:
    """Create a DRAFT quotation. Idempotent when ``idempotency_key`` is provided:
    a repeated request with the same key returns the existing quote instead of
    creating a duplicate (protects against double-clicks / network retries)."""
    if idempotency_key:
        existing = session.exec(
            select(Quotation).where(Quotation.idempotency_key == idempotency_key)
        ).first()
        if existing:
            return existing

    if session.get(Customer, customer_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    products = _load_products(session, [it.product_id for it in items])

    quotation = Quotation(
        customer_id=customer_id,
        rep_id=rep_id,
        status=QuoteStatus.DRAFT,
        version=1,
        idempotency_key=idempotency_key,
        notes=notes,
        expires_at=datetime.utcnow() + timedelta(days=expires_in_days),
    )
    session.add(quotation)
    session.flush()  # assign quotation.id for the lines / FKs

    for it in items:
        product = products[it.product_id]
        if it.quantity <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be positive.")
        priced = price_line(product.price, product.cost, it.quantity, it.discount_percent, product.tax_rate)
        session.add(
            QuotationLine(
                quotation_id=quotation.id,
                product_id=product.id,
                quantity=it.quantity,
                unit_price=product.price,
                unit_cost=product.cost,
                discount_percent=it.discount_percent,
                tax_rate=product.tax_rate,
                line_subtotal=priced["line_subtotal"],
                discount_amount=priced["discount_amount"],
                tax_amount=priced["tax_amount"],
                line_total=priced["line_total"],
            )
        )
    session.flush()

    metrics = recalculate(session, quotation)
    snapshot_version(session, quotation, reason="Initial version", user_id=rep_id)

    audit_service.log_action(
        session,
        quotation_id=quotation.id,
        user_id=rep_id,
        action=AuditAction.QUOTE_CREATED,
        reason=notes,
        new_value=f"total={quotation.total}, discount={metrics['weighted_discount']}%, risk={quotation.risk_level}",
    )
    _audit_conflicts(session, quotation, rep_id, metrics)

    session.commit()
    session.refresh(quotation)
    return quotation


def update_quote(
    session: Session,
    quotation: Quotation,
    *,
    user_id: UUID,
    items: Optional[Sequence] = None,
    notes: Optional[str] = None,
    reason: Optional[str] = None,
    negotiation: bool = False,
) -> Quotation:
    """Edit a quote's line items and/or notes.

    Editing a quote that has already been submitted/approved snapshots the prior
    version, bumps the version number, and re-runs approval routing so that any
    increase in discount/risk automatically requires fresh sign-off.
    """
    if quotation.status in (QuoteStatus.CONFIRMED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A {quotation.status.value} quote cannot be edited. Renew or clone it instead.",
        )

    was_issued = quotation.status in (QuoteStatus.PENDING_APPROVAL, QuoteStatus.APPROVED)
    old_lines = _lines_for_quote(session, quotation.id)
    old_weighted = risk_engine.weighted_discount_percent(_risk_inputs(session, old_lines))

    if notes is not None:
        quotation.notes = notes

    if items is not None:
        products = _load_products(session, [it.product_id for it in items])
        for line in old_lines:
            session.delete(line)
        session.flush()
        for it in items:
            product = products[it.product_id]
            if it.quantity <= 0:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be positive.")
            priced = price_line(product.price, product.cost, it.quantity, it.discount_percent, product.tax_rate)
            session.add(
                QuotationLine(
                    quotation_id=quotation.id,
                    product_id=product.id,
                    quantity=it.quantity,
                    unit_price=product.price,
                    unit_cost=product.cost,
                    discount_percent=it.discount_percent,
                    tax_rate=product.tax_rate,
                    line_subtotal=priced["line_subtotal"],
                    discount_amount=priced["discount_amount"],
                    tax_amount=priced["tax_amount"],
                    line_total=priced["line_total"],
                )
            )
        session.flush()

    # If the quote had been issued, preserve the prior version before mutating state.
    if was_issued:
        quotation.version += 1

    metrics = recalculate(session, quotation)
    new_weighted = metrics["weighted_discount"]

    # Audit the edit + any discount movement.
    audit_service.log_action(
        session,
        quotation_id=quotation.id,
        user_id=user_id,
        action=AuditAction.CUSTOMER_NEGOTIATED if negotiation else AuditAction.QUOTE_EDITED,
        reason=reason,
        old_value=f"discount={old_weighted}%",
        new_value=f"discount={new_weighted}%, total={quotation.total}",
    )
    if abs(new_weighted - old_weighted) > 1e-9:
        audit_service.log_action(
            session,
            quotation_id=quotation.id,
            user_id=user_id,
            action=AuditAction.DISCOUNT_CHANGED,
            reason=reason,
            old_value=f"{old_weighted}%",
            new_value=f"{new_weighted}%",
        )
    _audit_conflicts(session, quotation, user_id, metrics)

    if was_issued:
        snapshot_version(session, quotation, reason=reason or "Revised terms", user_id=user_id)
        audit_service.log_action(
            session,
            quotation_id=quotation.id,
            user_id=user_id,
            action=AuditAction.NEW_VERSION_CREATED,
            new_value=f"v{quotation.version}",
        )
        # Deferred import avoids a circular dependency at module load time.
        from app.services import approval_service
        approval_service.reroute_after_change(session, quotation, user_id=user_id, reason=reason)

    session.commit()
    session.refresh(quotation)
    return quotation


def submit_quote(session: Session, quotation: Quotation, *, user_id: UUID) -> Quotation:
    """Submit a DRAFT (or returned) quote for approval routing."""
    if quotation.status not in (QuoteStatus.DRAFT,):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only a DRAFT quote can be submitted (current status: {quotation.status.value}).",
        )
    expire_if_needed(session, quotation, user_id=user_id, commit=False)
    if quotation.status == QuoteStatus.EXPIRED:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Quote has expired; renew it before submitting.")

    recalculate(session, quotation)
    audit_service.log_action(
        session,
        quotation_id=quotation.id,
        user_id=user_id,
        action=AuditAction.QUOTE_SUBMITTED,
        new_value=f"risk={quotation.risk_level} ({quotation.blended_risk})",
    )
    from app.services import approval_service
    approval_service.route_for_approval(session, quotation, user_id=user_id)

    session.commit()
    session.refresh(quotation)
    return quotation


def confirm_quote(session: Session, quotation: Quotation, *, user_id: UUID) -> Quotation:
    """Confirm an APPROVED quote. Expired quotes are rejected (and marked EXPIRED)."""
    expire_if_needed(session, quotation, user_id=user_id, commit=False)
    if quotation.status == QuoteStatus.EXPIRED:
        session.commit()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Quote has expired and cannot be confirmed; renew it first.")
    if quotation.status != QuoteStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only an APPROVED quote can be confirmed (current status: {quotation.status.value}).",
        )
    quotation.status = QuoteStatus.CONFIRMED
    quotation.updated_at = datetime.utcnow()
    session.add(quotation)
    audit_service.log_action(
        session,
        quotation_id=quotation.id,
        user_id=user_id,
        action=AuditAction.QUOTE_CONFIRMED,
        new_value=f"total={quotation.total}",
    )
    session.commit()
    session.refresh(quotation)

    # A confirmed quote becomes a fulfillable Order so operations can split it
    # across warehouses / raise backorders. Idempotent (returns the existing
    # order on repeat) and best-effort — a fulfillment hiccup must not undo the
    # confirmation the customer already saw succeed.
    try:
        from app.services import order_service
        order_service.create_order_from_quote(session, quotation)
    except Exception:
        session.rollback()

    return quotation


def is_expired(quotation: Quotation, *, now: Optional[datetime] = None) -> bool:
    now = now or datetime.utcnow()
    return (
        quotation.expires_at is not None
        and quotation.expires_at < now
        and quotation.status in (QuoteStatus.DRAFT, QuoteStatus.PENDING_APPROVAL, QuoteStatus.APPROVED)
    )


def expire_if_needed(
    session: Session,
    quotation: Quotation,
    *,
    user_id: Optional[UUID] = None,
    commit: bool = True,
) -> Quotation:
    """Lazily transition a quote to EXPIRED once its validity window has passed."""
    if is_expired(quotation):
        quotation.status = QuoteStatus.EXPIRED
        quotation.updated_at = datetime.utcnow()
        session.add(quotation)
        audit_service.log_action(
            session,
            quotation_id=quotation.id,
            user_id=user_id,
            action=AuditAction.QUOTE_EXPIRED,
            old_value=quotation.expires_at.isoformat() if quotation.expires_at else None,
        )
        if commit:
            session.commit()
            session.refresh(quotation)
    return quotation


def renew_quote(
    session: Session,
    quotation: Quotation,
    *,
    user_id: UUID,
    expires_in_days: int = DEFAULT_VALIDITY_DAYS,
) -> Quotation:
    """Extend the validity window; an EXPIRED quote returns to DRAFT for re-issue."""
    old = quotation.expires_at.isoformat() if quotation.expires_at else None
    quotation.expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
    if quotation.status == QuoteStatus.EXPIRED:
        quotation.status = QuoteStatus.DRAFT
    quotation.updated_at = datetime.utcnow()
    session.add(quotation)
    audit_service.log_action(
        session,
        quotation_id=quotation.id,
        user_id=user_id,
        action=AuditAction.QUOTE_RENEWED,
        old_value=old,
        new_value=quotation.expires_at.isoformat(),
    )
    session.commit()
    session.refresh(quotation)
    return quotation


def delete_quote(session: Session, quotation: Quotation, *, user_id: UUID) -> None:
    """Delete a DRAFT quote and its lines/versions. Only drafts may be deleted."""
    if quotation.status != QuoteStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only DRAFT quotes can be deleted.",
        )
    for line in _lines_for_quote(session, quotation.id):
        session.delete(line)
    for ver in session.exec(select(QuotationVersion).where(QuotationVersion.quotation_id == quotation.id)):
        session.delete(ver)
    session.delete(quotation)
    session.commit()


# ---------------------------------------------------------------------------
# Reads
# ---------------------------------------------------------------------------

def get_quote_or_404(session: Session, quote_id: UUID) -> Quotation:
    quotation = session.get(Quotation, quote_id)
    if not quotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found.")
    return quotation


def list_quotes(session: Session, user: User) -> list[Quotation]:
    """Role-scoped listing: reps see their own, customers see theirs, and
    managers/finance/ops/admin see everything."""
    stmt = select(Quotation)
    if user.role == Role.REP:
        stmt = stmt.where(Quotation.rep_id == user.id)
    elif user.role == Role.CUSTOMER:
        stmt = stmt.where(Quotation.customer_id == user.customer_id)
    quotes = list(session.exec(stmt.order_by(Quotation.created_at.desc())))
    for q in quotes:
        expire_if_needed(session, q, commit=False)
    session.commit()
    return quotes


def list_lines(session: Session, quotation_id: UUID) -> list[QuotationLine]:
    return _lines_for_quote(session, quotation_id)


def list_versions(session: Session, quotation_id: UUID) -> list[QuotationVersion]:
    return list(
        session.exec(
            select(QuotationVersion)
            .where(QuotationVersion.quotation_id == quotation_id)
            .order_by(QuotationVersion.version)
        )
    )


def list_audit(session: Session, quotation_id: UUID) -> list[AuditLog]:
    return audit_service.list_for_quote(session, quotation_id)


def _audit_conflicts(session: Session, quotation: Quotation, user_id: UUID, metrics: dict) -> None:
    rules = metrics.get("rules", {})
    if rules.get("conflicts") or rules.get("violations"):
        detail = {"conflicts": rules.get("conflicts"), "violations": rules.get("violations")}
        audit_service.log_action(
            session,
            quotation_id=quotation.id,
            user_id=user_id,
            action=AuditAction.RULE_CONFLICT_DETECTED,
            new_value=json.dumps(detail),
        )
