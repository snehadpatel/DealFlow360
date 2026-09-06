from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.schemas.quote_schemas import ActionRequest, ReasonRequest, ApprovalResponse
from app.services import approval_service

router = APIRouter(prefix="/approvals", tags=["approvals"])

# Only approver roles may act on approvals (ADMIN is always permitted).
approver_guard = require_roles([Role.MANAGER, Role.FINANCE])


@router.get("", response_model=List[ApprovalResponse])
def list_all_approvals(
    status: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """All approvals visible to this approver (ADMIN sees all)."""
    return approval_service.list_approvals(session, user, status=status)


@router.get("/summary")
def get_approval_summary(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Real-time summary counts for approvals."""
    return approval_service.get_approval_summary_stats(session, user)


@router.get("/pending", response_model=List[ApprovalResponse])
def list_pending(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    """Approvals awaiting the current approver (ADMIN sees all)."""
    return approval_service.list_pending(session, user)


@router.get("/quote/{quote_id}", response_model=List[ApprovalResponse])
def list_for_quote(quote_id: UUID, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return approval_service.list_for_quote(session, quote_id)


@router.get("/{approval_id}", response_model=ApprovalResponse)
def get_approval(approval_id: UUID, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return approval_service.get_approval_by_id(session, approval_id)



@router.post("/{approval_id}/approve", response_model=ApprovalResponse)
def approve(
    approval_id: UUID,
    payload: ActionRequest = ActionRequest(),
    session: Session = Depends(get_session),
    user: User = Depends(approver_guard),
):
    return approval_service.approve(session, approval_id, approver=user, reason=payload.reason)


@router.post("/{approval_id}/reject", response_model=ApprovalResponse)
def reject(
    approval_id: UUID,
    payload: ReasonRequest,
    session: Session = Depends(get_session),
    user: User = Depends(approver_guard),
):
    return approval_service.reject(session, approval_id, approver=user, reason=payload.reason)


@router.post("/{approval_id}/return", response_model=ApprovalResponse)
def return_for_revision(
    approval_id: UUID,
    payload: ReasonRequest,
    session: Session = Depends(get_session),
    user: User = Depends(approver_guard),
):
    return approval_service.return_for_revision(session, approval_id, approver=user, reason=payload.reason)
