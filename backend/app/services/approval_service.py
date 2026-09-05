"""Approval routing service.

Decides *which* approvals a quote needs, builds the approval chain, records
approver decisions (approve / reject / return), and — when an already-issued
quote is renegotiated to more aggressive terms — automatically invalidates the
stale approvals and requests fresh sign-off.

Routing builds on the existing deterministic ``deal_logic.determine_approval_chain``
(risk-based) and layers discount / margin rules on top:

    discount <= 10%                     -> no approval
    10% < discount <= 20%               -> Sales Manager
    discount > 20%  OR  margin < 15%    -> Sales Manager + Finance
    HIGH blended risk                   -> Sales Manager + Finance
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.approval import ApprovalRequest, ApprovalStatus
from app.models.customer import Customer
from app.models.quotation import Quotation, QuotationLine, QuoteStatus, RiskLevel
from app.models.user import Role, User
from app.services import audit_service, deal_logic, risk_engine
from app.services.audit_service import AuditAction

# Ordering of approval tiers within a chain (lower level acts first).
ROLE_LEVEL = {"MANAGER": 1, "FINANCE": 2}

MARGIN_FLOOR_FOR_FINANCE = 15.0  # margin % below which Finance must sign off


# ---------------------------------------------------------------------------
# Routing decision (pure)
# ---------------------------------------------------------------------------

def determine_required_approvals(
    blended_risk: Optional[float],
    weighted_discount: float,
    customer_tier: str,
    margin_percent: float,
) -> list[str]:
    """Return the ordered list of approver roles required for these terms."""
    roles: set[str] = set(deal_logic.determine_approval_chain(blended_risk or 0.0))

    if weighted_discount > 10.0:
        roles.add("MANAGER")
    if weighted_discount > 20.0:
        roles.update({"MANAGER", "FINANCE"})
    if margin_percent < MARGIN_FLOOR_FOR_FINANCE:
        roles.update({"MANAGER", "FINANCE"})
    if risk_engine.get_risk_level(blended_risk or 0.0) == RiskLevel.HIGH:
        roles.update({"MANAGER", "FINANCE"})

    return sorted(roles, key=lambda r: ROLE_LEVEL.get(r, 99))


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _quote_inputs(session: Session, quotation: Quotation) -> tuple[float, str]:
    lines = list(session.exec(select(QuotationLine).where(QuotationLine.quotation_id == quotation.id)))
    weighted = risk_engine.weighted_discount_percent(
        [{"discount_percent": l.discount_percent, "weight": l.line_subtotal} for l in lines]
    )
    customer = session.get(Customer, quotation.customer_id)
    tier = (customer.tier.value if customer and hasattr(customer.tier, "value") else str(customer.tier)) if customer else ""
    return weighted, tier


def _open_approvals(session: Session, quotation_id: UUID) -> list[ApprovalRequest]:
    return list(
        session.exec(
            select(ApprovalRequest).where(
                ApprovalRequest.quotation_id == quotation_id,
                ApprovalRequest.status == ApprovalStatus.PENDING,
            )
        )
    )


def invalidate_open(session: Session, quotation: Quotation, *, user_id: Optional[UUID], reason: Optional[str]) -> int:
    """Mark all still-pending approvals for a quote as INVALIDATED (stages only)."""
    count = 0
    for appr in _open_approvals(session, quotation.id):
        appr.status = ApprovalStatus.INVALIDATED
        appr.resolved_at = datetime.utcnow()
        appr.reason = reason or "Superseded by a newer version"
        session.add(appr)
        count += 1
    if count:
        audit_service.log_action(
            session,
            quotation_id=quotation.id,
            user_id=user_id,
            action=AuditAction.APPROVAL_INVALIDATED,
            reason=reason,
            new_value=f"{count} approval(s) invalidated",
        )
    return count


# ---------------------------------------------------------------------------
# Routing (stages only - caller commits)
# ---------------------------------------------------------------------------

def route_for_approval(session: Session, quotation: Quotation, *, user_id: Optional[UUID]) -> list[ApprovalRequest]:
    """Create the approval chain for the quote's current terms.

    If no approval is required the quote is auto-approved. Assumes totals/risk
    were already refreshed by ``quote_service.recalculate``. Stages only.
    """
    weighted, tier = _quote_inputs(session, quotation)
    required = determine_required_approvals(quotation.blended_risk, weighted, tier, quotation.margin_percent)

    if not required:
        quotation.status = QuoteStatus.APPROVED
        quotation.updated_at = datetime.utcnow()
        session.add(quotation)
        audit_service.log_action(
            session,
            quotation_id=quotation.id,
            user_id=user_id,
            action=AuditAction.QUOTE_APPROVED,
            reason="Auto-approved: within all thresholds",
            new_value="AUTO",
        )
        return []

    created: list[ApprovalRequest] = []
    for role in required:
        appr = ApprovalRequest(
            quotation_id=quotation.id,
            approver_role=role,
            approval_level=ROLE_LEVEL.get(role, 1),
            quote_version=quotation.version,
            status=ApprovalStatus.PENDING,
        )
        session.add(appr)
        created.append(appr)

    quotation.status = QuoteStatus.PENDING_APPROVAL
    quotation.updated_at = datetime.utcnow()
    session.add(quotation)
    audit_service.log_action(
        session,
        quotation_id=quotation.id,
        user_id=user_id,
        action=AuditAction.APPROVAL_REQUESTED,
        new_value=" -> ".join(required),
    )
    return created


def reroute_after_change(session: Session, quotation: Quotation, *, user_id: Optional[UUID], reason: Optional[str]) -> list[ApprovalRequest]:
    """Re-evaluate approvals after a quote changed. Any prior open approvals are
    invalidated, then a fresh chain is routed for the new terms. Stages only."""
    invalidate_open(session, quotation, user_id=user_id, reason=reason)
    audit_service.log_action(
        session,
        quotation_id=quotation.id,
        user_id=user_id,
        action=AuditAction.REAPPROVAL_TRIGGERED,
        reason=reason,
        new_value=f"v{quotation.version}",
    )
    return route_for_approval(session, quotation, user_id=user_id)


# ---------------------------------------------------------------------------
# Approver decisions (these commit)
# ---------------------------------------------------------------------------

def _get_approval_or_404(session: Session, approval_id: UUID) -> ApprovalRequest:
    appr = session.get(ApprovalRequest, approval_id)
    if not appr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found.")
    return appr


def _authorize(approval: ApprovalRequest, approver: User) -> None:
    if approver.role == Role.ADMIN:
        return
    if approver.role.value != approval.approver_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This approval requires the {approval.approver_role} role.",
        )


def _ensure_actionable(session: Session, approval: ApprovalRequest) -> Quotation:
    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Approval already {approval.status.value}.")
    quotation = session.get(Quotation, approval.quotation_id)
    if not quotation or quotation.status != QuoteStatus.PENDING_APPROVAL:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Quote is not awaiting approval.")
    # Enforce chain order: a lower tier must act first.
    lower_pending = session.exec(
        select(ApprovalRequest).where(
            ApprovalRequest.quotation_id == approval.quotation_id,
            ApprovalRequest.status == ApprovalStatus.PENDING,
            ApprovalRequest.approval_level < approval.approval_level,
        )
    ).first()
    if lower_pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Awaiting {lower_pending.approver_role} approval first.",
        )
    return quotation


def approve(session: Session, approval_id: UUID, *, approver: User, reason: Optional[str] = None) -> ApprovalRequest:
    approval = _get_approval_or_404(session, approval_id)
    _authorize(approval, approver)
    quotation = _ensure_actionable(session, approval)

    approval.status = ApprovalStatus.APPROVED
    approval.approver_id = approver.id
    approval.reason = reason
    approval.resolved_at = datetime.utcnow()
    session.add(approval)

    audit_service.log_action(
        session,
        quotation_id=quotation.id,
        user_id=approver.id,
        action=AuditAction.QUOTE_APPROVED,
        reason=reason,
        new_value=f"{approval.approver_role} (level {approval.approval_level})",
    )

    # If no approvals remain pending, the whole chain is complete.
    if not _open_approvals(session, quotation.id):
        quotation.status = QuoteStatus.APPROVED
        quotation.updated_at = datetime.utcnow()
        session.add(quotation)

    session.commit()
    session.refresh(approval)
    return approval


def reject(session: Session, approval_id: UUID, *, approver: User, reason: str) -> ApprovalRequest:
    approval = _get_approval_or_404(session, approval_id)
    _authorize(approval, approver)
    quotation = _ensure_actionable(session, approval)

    approval.status = ApprovalStatus.REJECTED
    approval.approver_id = approver.id
    approval.reason = reason
    approval.resolved_at = datetime.utcnow()
    session.add(approval)

    # A rejection ends the chain: remaining tiers no longer need to act.
    for other in _open_approvals(session, quotation.id):
        if other.id != approval.id:
            other.status = ApprovalStatus.INVALIDATED
            other.resolved_at = datetime.utcnow()
            session.add(other)

    quotation.status = QuoteStatus.REJECTED
    quotation.updated_at = datetime.utcnow()
    session.add(quotation)
    audit_service.log_action(
        session,
        quotation_id=quotation.id,
        user_id=approver.id,
        action=AuditAction.QUOTE_REJECTED,
        reason=reason,
        new_value=f"{approval.approver_role} (level {approval.approval_level})",
    )
    session.commit()
    session.refresh(approval)
    return approval


def return_for_revision(session: Session, approval_id: UUID, *, approver: User, reason: str) -> ApprovalRequest:
    """Send the quote back to the rep as DRAFT for changes (chain is cleared)."""
    approval = _get_approval_or_404(session, approval_id)
    _authorize(approval, approver)
    quotation = _ensure_actionable(session, approval)

    approval.status = ApprovalStatus.RETURNED
    approval.approver_id = approver.id
    approval.reason = reason
    approval.resolved_at = datetime.utcnow()
    session.add(approval)

    for other in _open_approvals(session, quotation.id):
        if other.id != approval.id:
            other.status = ApprovalStatus.INVALIDATED
            other.resolved_at = datetime.utcnow()
            session.add(other)

    quotation.status = QuoteStatus.DRAFT
    quotation.updated_at = datetime.utcnow()
    session.add(quotation)
    audit_service.log_action(
        session,
        quotation_id=quotation.id,
        user_id=approver.id,
        action=AuditAction.QUOTE_RETURNED,
        reason=reason,
        new_value=f"{approval.approver_role} (level {approval.approval_level})",
    )
    session.commit()
    session.refresh(approval)
    return approval


# ---------------------------------------------------------------------------
# Reads
# ---------------------------------------------------------------------------

def list_pending(session: Session, user: User) -> list[ApprovalRequest]:
    """Pending approvals visible to this approver (ADMIN sees all)."""
    stmt = select(ApprovalRequest).where(ApprovalRequest.status == ApprovalStatus.PENDING)
    if user.role != Role.ADMIN:
        stmt = stmt.where(ApprovalRequest.approver_role == user.role.value)
    return list(session.exec(stmt.order_by(ApprovalRequest.created_at)))


def list_for_quote(session: Session, quotation_id: UUID) -> list[ApprovalRequest]:
    return list(
        session.exec(
            select(ApprovalRequest)
            .where(ApprovalRequest.quotation_id == quotation_id)
            .order_by(ApprovalRequest.approval_level, ApprovalRequest.created_at)
        )
    )
