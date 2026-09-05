"""Audit trail service.

Every material action on a quotation is recorded as an :class:`AuditLog` row so
the full lifecycle (creation, edits, discount changes, approvals, rejections,
negotiations and automatic re-approvals) is traceable with who / when / why and
the old -> new value of what changed.

``log_action`` *stages* the entry on the passed-in session; the calling service
owns the transaction and commits. This keeps each business operation atomic:
if the operation fails before commit, no misleading audit row is persisted.
"""
from typing import Optional
from uuid import UUID
from sqlmodel import Session, select

from app.models.audit import AuditLog


class AuditAction:
    """Canonical action names used across the backend (avoids magic strings)."""
    QUOTE_CREATED = "QUOTE_CREATED"
    QUOTE_EDITED = "QUOTE_EDITED"
    DISCOUNT_CHANGED = "DISCOUNT_CHANGED"
    QUOTE_SUBMITTED = "QUOTE_SUBMITTED"
    APPROVAL_REQUESTED = "APPROVAL_REQUESTED"
    QUOTE_APPROVED = "QUOTE_APPROVED"
    QUOTE_REJECTED = "QUOTE_REJECTED"
    QUOTE_RETURNED = "QUOTE_RETURNED"
    CUSTOMER_NEGOTIATED = "CUSTOMER_NEGOTIATED"
    REAPPROVAL_TRIGGERED = "REAPPROVAL_TRIGGERED"
    APPROVAL_INVALIDATED = "APPROVAL_INVALIDATED"
    QUOTE_CONFIRMED = "QUOTE_CONFIRMED"
    QUOTE_EXPIRED = "QUOTE_EXPIRED"
    QUOTE_RENEWED = "QUOTE_RENEWED"
    NEW_VERSION_CREATED = "NEW_VERSION_CREATED"
    RULE_CONFLICT_DETECTED = "RULE_CONFLICT_DETECTED"


def log_action(
    session: Session,
    *,
    quotation_id: Optional[UUID],
    user_id: Optional[UUID],
    action: str,
    reason: Optional[str] = None,
    old_value: Optional[object] = None,
    new_value: Optional[object] = None,
) -> AuditLog:
    """Stage an audit entry on ``session`` (caller commits).

    ``old_value`` / ``new_value`` accept any value and are coerced to ``str`` so
    callers can pass numbers, enums, or short descriptions freely.
    """
    entry = AuditLog(
        quotation_id=quotation_id,
        user_id=user_id,
        action=action,
        reason=reason,
        old_value=None if old_value is None else str(old_value),
        new_value=None if new_value is None else str(new_value),
    )
    session.add(entry)
    return entry


def list_for_quote(session: Session, quotation_id: UUID) -> list[AuditLog]:
    """Return the audit trail for a quotation, oldest first."""
    return list(
        session.exec(
            select(AuditLog)
            .where(AuditLog.quotation_id == quotation_id)
            .order_by(AuditLog.timestamp)
        )
    )
