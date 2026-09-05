"""Negotiation service — rep/customer negotiation threads."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.negotiation import Negotiation, NegotiationMessage, NegotiationStatus, SenderRole
from app.models.user import User, Role


def create_negotiation(session: Session, quotation_id: UUID, customer_id: UUID,
                        rep_id: UUID, requested_discount: Optional[float] = None) -> Negotiation:
    neg = Negotiation(
        quotation_id=quotation_id,
        customer_id=customer_id,
        rep_id=rep_id,
        requested_discount=requested_discount,
    )
    session.add(neg)
    session.commit()
    session.refresh(neg)
    return neg


def get_negotiation_or_404(session: Session, neg_id: UUID) -> Negotiation:
    n = session.get(Negotiation, neg_id)
    if not n:
        raise HTTPException(status_code=404, detail="Negotiation not found")
    return n


def list_negotiations(session: Session, quotation_id: Optional[UUID] = None,
                       rep_id: Optional[UUID] = None, customer_id: Optional[UUID] = None) -> List[Negotiation]:
    stmt = select(Negotiation).order_by(Negotiation.updated_at.desc())
    if quotation_id:
        stmt = stmt.where(Negotiation.quotation_id == quotation_id)
    if rep_id:
        stmt = stmt.where(Negotiation.rep_id == rep_id)
    if customer_id:
        stmt = stmt.where(Negotiation.customer_id == customer_id)
    return session.exec(stmt).all()


def add_message(session: Session, neg_id: UUID, sender: User,
                message: str, discount_proposed: Optional[float] = None) -> NegotiationMessage:
    neg = get_negotiation_or_404(session, neg_id)
    role_map = {Role.REP: SenderRole.REP, Role.CUSTOMER: SenderRole.CUSTOMER,
                Role.MANAGER: SenderRole.MANAGER, Role.ADMIN: SenderRole.REP}
    msg = NegotiationMessage(
        negotiation_id=neg_id,
        sender_id=sender.id,
        sender_role=role_map.get(sender.role, SenderRole.REP),
        message=message,
        discount_proposed=discount_proposed,
    )
    session.add(msg)
    neg.updated_at = datetime.utcnow()
    session.add(neg)
    session.commit()
    session.refresh(msg)
    return msg


def list_messages(session: Session, neg_id: UUID) -> List[NegotiationMessage]:
    return session.exec(
        select(NegotiationMessage)
        .where(NegotiationMessage.negotiation_id == neg_id)
        .order_by(NegotiationMessage.created_at)
    ).all()


def accept_negotiation(session: Session, neg_id: UUID, final_discount: Optional[float] = None) -> Negotiation:
    neg = get_negotiation_or_404(session, neg_id)
    neg.status = NegotiationStatus.ACCEPTED
    neg.final_discount = final_discount or neg.counter_discount or neg.requested_discount
    neg.updated_at = datetime.utcnow()
    session.add(neg)
    session.commit()
    session.refresh(neg)
    return neg


def counter_offer(session: Session, neg_id: UUID, counter_discount: float) -> Negotiation:
    neg = get_negotiation_or_404(session, neg_id)
    neg.status = NegotiationStatus.COUNTER_OFFERED
    neg.counter_discount = counter_discount
    neg.updated_at = datetime.utcnow()
    session.add(neg)
    session.commit()
    session.refresh(neg)
    return neg


def reject_negotiation(session: Session, neg_id: UUID) -> Negotiation:
    neg = get_negotiation_or_404(session, neg_id)
    neg.status = NegotiationStatus.REJECTED
    neg.updated_at = datetime.utcnow()
    session.add(neg)
    session.commit()
    session.refresh(neg)
    return neg
