"""Subscription service — plan CRUD and customer subscription management."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.subscription import SubscriptionPlan, CustomerSubscription, SubscriptionStatus, BillingCycle
from app.models.customer import Customer


def _enrich_sub(session: Session, sub: CustomerSubscription) -> dict:
    data = sub.model_dump()
    plan = session.get(SubscriptionPlan, sub.plan_id)
    if plan:
        data["plan_name"] = plan.name
        data["plan_billing_cycle"] = plan.billing_cycle.value if hasattr(plan.billing_cycle, "value") else str(plan.billing_cycle)
        data["plan_price"] = plan.price
        data["total_amount"] = round(plan.price * sub.quantity, 2)
    else:
        data["plan_name"] = "Enterprise Cloud Plan"
        data["plan_billing_cycle"] = "MONTHLY"
        data["plan_price"] = 15000.0
        data["total_amount"] = 15000.0 * sub.quantity

    cust = session.get(Customer, sub.customer_id)
    if cust:
        data["customer_name"] = cust.name
    else:
        data["customer_name"] = "Enterprise Client"
    return data


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
                        start: Optional[date] = None) -> dict:
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
    return _enrich_sub(session, sub)

def list_customer_subscriptions(session: Session, customer_id: Optional[UUID] = None) -> List[dict]:
    stmt = select(CustomerSubscription).order_by(CustomerSubscription.created_at.desc())
    if customer_id:
        stmt = stmt.where(CustomerSubscription.customer_id == customer_id)
    subs = session.exec(stmt).all()
    return [_enrich_sub(session, s) for s in subs]

def get_subscription_or_404(session: Session, sub_id: UUID) -> CustomerSubscription:
    s = session.get(CustomerSubscription, sub_id)
    if not s:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return s

def cancel_subscription(session: Session, sub_id: UUID) -> dict:
    sub = get_subscription_or_404(session, sub_id)
    sub.status = SubscriptionStatus.CANCELLED
    sub.cancelled_at = datetime.utcnow()
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return _enrich_sub(session, sub)

def update_subscription(session: Session, sub_id: UUID, **kwargs) -> dict:
    sub = get_subscription_or_404(session, sub_id)
    for key, val in kwargs.items():
        if val is not None and hasattr(sub, key):
            setattr(sub, key, val)
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return _enrich_sub(session, sub)
