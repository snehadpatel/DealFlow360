"""Subscription service — plan CRUD and customer subscription management."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.subscription import SubscriptionPlan, CustomerSubscription, SubscriptionStatus, BillingCycle


def list_plans(session: Session) -> List[SubscriptionPlan]:
    return session.exec(select(SubscriptionPlan).where(SubscriptionPlan.is_active == True)).all()

def get_plan_or_404(session: Session, plan_id: UUID) -> SubscriptionPlan:
    p = session.get(SubscriptionPlan, plan_id)
    if not p:
        raise HTTPException(status_code=404, detail="Plan not found")
    return p

def create_plan(session: Session, **kwargs) -> SubscriptionPlan:
    plan = SubscriptionPlan(**kwargs)
    session.add(plan)
    session.commit()
    session.refresh(plan)
    return plan

def update_plan(session: Session, plan_id: UUID, **kwargs) -> SubscriptionPlan:
    plan = get_plan_or_404(session, plan_id)
    for key, val in kwargs.items():
        if val is not None and hasattr(plan, key):
            setattr(plan, key, val)
    session.add(plan)
    session.commit()
    session.refresh(plan)
    return plan

def delete_plan(session: Session, plan_id: UUID):
    plan = get_plan_or_404(session, plan_id)
    plan.is_active = False
    session.add(plan)
    session.commit()


def _calc_next_billing(start: date, cycle: str) -> date:
    if cycle == BillingCycle.MONTHLY:
        return date(start.year + (start.month // 12), (start.month % 12) + 1, start.day)
    elif cycle == BillingCycle.QUARTERLY:
        return start + timedelta(days=91)
    else:  # YEARLY
        return date(start.year + 1, start.month, start.day)


def subscribe_customer(session: Session, customer_id: UUID, plan_id: UUID, quantity: int = 1,
                        start: Optional[date] = None) -> CustomerSubscription:
    plan = get_plan_or_404(session, plan_id)
    start_date = start or date.today()
    sub = CustomerSubscription(
        customer_id=customer_id,
        plan_id=plan_id,
        quantity=quantity,
        start_date=start_date,
        next_billing_date=_calc_next_billing(start_date, plan.billing_cycle),
    )
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return sub

def list_customer_subscriptions(session: Session, customer_id: Optional[UUID] = None) -> List[CustomerSubscription]:
    stmt = select(CustomerSubscription).order_by(CustomerSubscription.created_at.desc())
    if customer_id:
        stmt = stmt.where(CustomerSubscription.customer_id == customer_id)
    return session.exec(stmt).all()

def get_subscription_or_404(session: Session, sub_id: UUID) -> CustomerSubscription:
    s = session.get(CustomerSubscription, sub_id)
    if not s:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return s

def cancel_subscription(session: Session, sub_id: UUID) -> CustomerSubscription:
    sub = get_subscription_or_404(session, sub_id)
    sub.status = SubscriptionStatus.CANCELLED
    sub.cancelled_at = datetime.utcnow()
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return sub

def update_subscription(session: Session, sub_id: UUID, **kwargs) -> CustomerSubscription:
    sub = get_subscription_or_404(session, sub_id)
    for key, val in kwargs.items():
        if val is not None and hasattr(sub, key):
            setattr(sub, key, val)
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return sub
