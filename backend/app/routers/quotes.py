from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.models.quotation import Quotation
from app.schemas.quote_schemas import (
    QuoteCreate,
    QuoteUpdate,
    RenewRequest,
    ActionRequest,
    QuoteResponse,
    QuoteDetailResponse,
    QuoteLineResponse,
    QuoteVersionResponse,
    ApprovalResponse,
    AuditResponse,
)
from app.services import quote_service, approval_service

router = APIRouter(prefix="/quotes", tags=["quotes"])


# --- helpers ---------------------------------------------------------------

def _can_view(user: User, quotation: Quotation) -> bool:
    if user.role in (Role.MANAGER, Role.FINANCE, Role.OPERATIONS, Role.ADMIN):
        return True
    if user.role == Role.REP:
        return quotation.rep_id == user.id
    if user.role == Role.CUSTOMER:
        return quotation.customer_id == user.customer_id
    return False


def _load_visible(session: Session, quote_id: UUID, user: User) -> Quotation:
    quotation = quote_service.get_quote_or_404(session, quote_id)
    if not _can_view(user, quotation):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this quote.")
    return quotation


def _build_detail(session: Session, quotation: Quotation) -> QuoteDetailResponse:
    detail = QuoteDetailResponse.model_validate(quotation)
    detail.lines = [QuoteLineResponse.model_validate(l) for l in quote_service.list_lines(session, quotation.id)]
    detail.approvals = [ApprovalResponse.model_validate(a) for a in approval_service.list_for_quote(session, quotation.id)]
    return detail


# --- endpoints -------------------------------------------------------------

@router.get("", response_model=List[QuoteResponse])
def list_quotes(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return quote_service.list_quotes(session, user)


@router.get("/{quote_id}", response_model=QuoteDetailResponse)
def get_quote(quote_id: UUID, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    quotation = _load_visible(session, quote_id, user)
    quote_service.expire_if_needed(session, quotation)
    return _build_detail(session, quotation)


@router.post("", response_model=QuoteDetailResponse, status_code=status.HTTP_201_CREATED)
def create_quote(
    payload: QuoteCreate,
    session: Session = Depends(get_session),
    user: User = Depends(require_roles([Role.REP, Role.MANAGER])),
    idempotency_header: Optional[str] = Header(default=None, alias="Idempotency-Key"),
):
    quotation = quote_service.create_quote(
        session,
        customer_id=payload.customer_id,
        rep_id=user.id,
        items=payload.items,
        idempotency_key=payload.idempotency_key or idempotency_header,
        expires_in_days=payload.expires_in_days,
        notes=payload.notes,
    )
    return _build_detail(session, quotation)


@router.put("/{quote_id}", response_model=QuoteDetailResponse)
def update_quote(
    quote_id: UUID,
    payload: QuoteUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(require_roles([Role.REP, Role.MANAGER])),
):
    quotation = _load_visible(session, quote_id, user)
    quotation = quote_service.update_quote(
        session,
        quotation,
        user_id=user.id,
        items=payload.items,
        notes=payload.notes,
        reason=payload.reason,
        negotiation=payload.negotiation,
    )
    return _build_detail(session, quotation)


@router.delete("/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote(
    quote_id: UUID,
    session: Session = Depends(get_session),
    user: User = Depends(require_roles([Role.REP, Role.MANAGER])),
):
    quotation = _load_visible(session, quote_id, user)
    quote_service.delete_quote(session, quotation, user_id=user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{quote_id}/submit", response_model=QuoteDetailResponse)
def submit_quote(
    quote_id: UUID,
    session: Session = Depends(get_session),
    user: User = Depends(require_roles([Role.REP, Role.MANAGER])),
):
    quotation = _load_visible(session, quote_id, user)
    quotation = quote_service.submit_quote(session, quotation, user_id=user.id)
    return _build_detail(session, quotation)


@router.post("/{quote_id}/confirm", response_model=QuoteDetailResponse)
def confirm_quote(
    quote_id: UUID,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    quotation = _load_visible(session, quote_id, user)
    quotation = quote_service.confirm_quote(session, quotation, user_id=user.id)
    return _build_detail(session, quotation)


@router.post("/{quote_id}/renew", response_model=QuoteDetailResponse)
def renew_quote(
    quote_id: UUID,
    payload: RenewRequest = RenewRequest(),
    session: Session = Depends(get_session),
    user: User = Depends(require_roles([Role.REP, Role.MANAGER])),
):
    quotation = _load_visible(session, quote_id, user)
    quotation = quote_service.renew_quote(session, quotation, user_id=user.id, expires_in_days=payload.expires_in_days)
    return _build_detail(session, quotation)


@router.get("/{quote_id}/versions", response_model=List[QuoteVersionResponse])
def get_versions(quote_id: UUID, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    _load_visible(session, quote_id, user)
    return quote_service.list_versions(session, quote_id)


@router.get("/{quote_id}/audit", response_model=List[AuditResponse])
def get_audit_trail(quote_id: UUID, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    _load_visible(session, quote_id, user)
    return quote_service.list_audit(session, quote_id)
