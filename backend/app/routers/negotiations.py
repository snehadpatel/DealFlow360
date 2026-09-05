"""Negotiations router — Rep/Customer negotiation threads."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.models.negotiation import Negotiation, NegotiationMessage
from app.schemas.negotiation_schemas import (
    NegotiationCreate, NegotiationResponse,
    NegotiationMessageCreate, NegotiationMessageResponse,
    NegotiationActionRequest
)
from app.services import negotiation_service

from app.models.quotation import Quotation
from app.models.customer import Customer
from app.models.negotiation import Negotiation, NegotiationMessage

router = APIRouter(prefix="/negotiations", tags=["negotiations"])


def _enrich_neg(session: Session, n: Negotiation) -> NegotiationResponse:
    resp = NegotiationResponse.model_validate(n)
    cust = session.get(Customer, n.customer_id)
    if cust:
        resp.customer_name = cust.name
    rep = session.get(User, n.rep_id)
    if rep:
        resp.rep_name = rep.name or rep.email
    quote = session.get(Quotation, n.quotation_id)
    if quote:
        resp.quotation_total = quote.total

    msgs = session.exec(
        select(NegotiationMessage)
        .where(NegotiationMessage.negotiation_id == n.id)
        .order_by(NegotiationMessage.created_at.desc())
    ).all()
    resp.messages_count = len(msgs)
    if msgs:
        resp.last_message = msgs[0].message
    return resp


@router.get("", response_model=List[NegotiationResponse])
def list_negotiations(
    quotation_id: Optional[UUID] = Query(default=None),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    rep_id = user.id if user.role == Role.REP else None
    customer_id = user.customer_id if user.role == Role.CUSTOMER else None
    raw_negs = negotiation_service.list_negotiations(session, quotation_id=quotation_id, rep_id=rep_id, customer_id=customer_id)
    return [_enrich_neg(session, n) for n in raw_negs]


@router.post("", response_model=NegotiationResponse, status_code=201)
def create_negotiation(
    payload: NegotiationCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user)
):
    neg = negotiation_service.create_negotiation(
        session, payload.quotation_id, payload.customer_id, payload.rep_id, payload.requested_discount
    )
    return _enrich_neg(session, neg)


@router.get("/{neg_id}", response_model=NegotiationResponse)
def get_negotiation(neg_id: UUID, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    neg = negotiation_service.get_negotiation_or_404(session, neg_id)
    return _enrich_neg(session, neg)


@router.get("/{neg_id}/messages", response_model=List[NegotiationMessageResponse])
def list_messages(neg_id: UUID, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return negotiation_service.list_messages(session, neg_id)


@router.post("/{neg_id}/messages", response_model=NegotiationMessageResponse, status_code=201)
def add_message(
    neg_id: UUID,
    payload: NegotiationMessageCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    return negotiation_service.add_message(session, neg_id, user, payload.message, payload.discount_proposed)


@router.post("/{neg_id}/accept", response_model=NegotiationResponse)
def accept(
    neg_id: UUID,
    payload: NegotiationActionRequest = NegotiationActionRequest(),
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user)
):
    return negotiation_service.accept_negotiation(session, neg_id, payload.discount)


@router.post("/{neg_id}/counter", response_model=NegotiationResponse)
def counter(
    neg_id: UUID,
    payload: NegotiationActionRequest,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.REP, Role.MANAGER, Role.ADMIN]))
):
    return negotiation_service.counter_offer(session, neg_id, payload.discount)


@router.post("/{neg_id}/reject", response_model=NegotiationResponse)
def reject(
    neg_id: UUID,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user)
):
    return negotiation_service.reject_negotiation(session, neg_id)
