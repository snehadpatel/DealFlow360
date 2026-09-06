"""Subscription service — plan CRUD and customer subscription management."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.subscription import (
    SubscriptionPlan, CustomerSubscription, SubscriptionStatus, BillingCycle,
    BillingSchedule, ScheduleStatus,
)
from app.models.customer import Customer
from app.services import billing_engine, invoice_service


def _cycle_value(cycle) -> str:
    return cycle.value if hasattr(cycle, "value") else str(cycle)


def _enrich_sub(session: Session, sub: CustomerSubscription) -> dict:
    data = sub.model_dump()
    plan = session.get(SubscriptionPlan, sub.plan_id)
    if plan:
        data["plan_name"] = plan.name
        data["plan_billing_cycle"] = _cycle_value(plan.billing_cycle)
        data["plan_price"] = plan.price
        data["total_amount"] = round(plan.price * sub.quantity, 2)
    else:
        data["plan_name"] = "Enterprise Cloud Plan"
        data["plan_billing_cycle"] = "MONTHLY"
        data["plan_price"] = 15000.0
        data["total_amount"] = 15000.0 * sub.quantity

    cust = session.get(Customer, sub.customer_id)
    data["customer_name"] = cust.name if cust else "Enterprise Client"

    # Attach the forward billing schedule so the UI shows the real recurring
    # calendar, not a single next date.
    schedule = session.exec(
        select(BillingSchedule)
        .where(BillingSchedule.subscription_id == sub.id)
        .order_by(BillingSchedule.period_index)
    ).all()
    data["schedule"] = [
        {
            "period_index": s.period_index,
            "period_start": s.period_start.isoformat(),
            "period_end": s.period_end.isoformat(),
            "amount": s.amount,
            "status": s.status.value if hasattr(s.status, "value") else str(s.status),
        }
        for s in schedule
    ]
    return data


def _regenerate_schedule(session: Session, sub: CustomerSubscription, plan: SubscriptionPlan,
                         periods: int = 12) -> None:
    """Replace any SCHEDULED (not yet invoiced) future periods for a subscription.

    Already-invoiced/paid periods are historical and left untouched; only the
    forward-looking SCHEDULED rows are rebuilt from the current plan + quantity.
    """
    existing = session.exec(
        select(BillingSchedule).where(BillingSchedule.subscription_id == sub.id)
    ).all()
    for s in existing:
        if s.status == ScheduleStatus.SCHEDULED:
            session.delete(s)

    start = sub.next_billing_date or sub.start_date or date.today()
    entries = billing_engine.generate_schedule(
        start=start,
        billing_cycle=_cycle_value(plan.billing_cycle),
        unit_price=plan.price,
        quantity=sub.quantity,
        periods=periods,
    )
    for e in entries:
        session.add(BillingSchedule(
            subscription_id=sub.id,
            period_index=e.period_index,
            period_start=e.period_start,
            period_end=e.period_end,
            amount=e.amount,
            status=ScheduleStatus.SCHEDULED,
        ))


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
    session.delete(plan)
    session.commit()


def _calc_next_billing(start: date, cycle) -> date:
    """Next billing date for a cycle (calendar-aware, delegates to billing_engine)."""
    return billing_engine.add_cycle(start, _cycle_value(cycle))


def subscribe_customer(session: Session, customer_id: UUID, plan_id: UUID, quantity: int = 1,
                        start: Optional[date] = None, order_id: Optional[UUID] = None) -> dict:
    plan = get_plan_or_404(session, plan_id)
    start_date = start or date.today()
    sub = CustomerSubscription(
        customer_id=customer_id,
        plan_id=plan_id,
        order_id=order_id,
        quantity=quantity,
        start_date=start_date,
        next_billing_date=_calc_next_billing(start_date, plan.billing_cycle),
    )
    session.add(sub)
    session.flush()  # need sub.id before generating the schedule
    _regenerate_schedule(session, sub, plan)
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
    """Cancel a subscription and, if cancelled mid-cycle, issue a real credit
    note for the unused portion (computed by billing_engine)."""
    sub = get_subscription_or_404(session, sub_id)
    plan = session.get(SubscriptionPlan, sub.plan_id)

    credit_note = None
    if plan and sub.status == SubscriptionStatus.ACTIVE:
        today = date.today()
        next_billing = sub.next_billing_date or _calc_next_billing(sub.start_date, plan.billing_cycle)
        refund = billing_engine.cancellation_refund(
            cancel_date=today,
            next_billing_date=next_billing,
            billing_cycle=_cycle_value(plan.billing_cycle),
            price=plan.price,
            quantity=sub.quantity,
        )
        if refund.credit_for_unused_old > 0:
            credit_note = invoice_service.create_credit_note(
                session,
                customer_id=sub.customer_id,
                amount=refund.credit_for_unused_old,
                reason=(f"Subscription {plan.name} cancelled on {today.isoformat()}: "
                        f"refund for {refund.unused_days} unused day(s)."),
            )

    # Drop future scheduled (un-invoiced) periods — they will never be billed.
    for s in session.exec(select(BillingSchedule).where(
        BillingSchedule.subscription_id == sub.id,
        BillingSchedule.status == ScheduleStatus.SCHEDULED,
    )).all():
        s.status = ScheduleStatus.SKIPPED
        session.add(s)

    sub.status = SubscriptionStatus.CANCELLED
    sub.cancelled_at = datetime.utcnow()
    session.add(sub)
    session.commit()
    session.refresh(sub)

    data = _enrich_sub(session, sub)
    if credit_note:
        data["credit_note"] = {
            "credit_note_number": credit_note.credit_note_number,
            "amount": credit_note.amount,
            "reason": credit_note.reason,
        }
    return data

def pause_subscription(session: Session, sub_id: UUID) -> dict:
    sub = get_subscription_or_404(session, sub_id)
    sub.status = SubscriptionStatus.PAUSED
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return _enrich_sub(session, sub)

def resume_subscription(session: Session, sub_id: UUID) -> dict:
    sub = get_subscription_or_404(session, sub_id)
    sub.status = SubscriptionStatus.ACTIVE
    session.add(sub)
    session.commit()
    session.refresh(sub)
    return _enrich_sub(session, sub)

def preview_proration(session: Session, sub_id: UUID, *, plan_id: Optional[UUID] = None,
                      quantity: Optional[int] = None) -> dict:
    """Compute (but do not persist) the proration for a proposed change."""
    sub = get_subscription_or_404(session, sub_id)
    old_plan = session.get(SubscriptionPlan, sub.plan_id)
    new_plan = session.get(SubscriptionPlan, plan_id) if plan_id else old_plan
    new_qty = quantity or sub.quantity
    if not old_plan or not new_plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    today = date.today()
    next_billing = sub.next_billing_date or _calc_next_billing(sub.start_date, old_plan.billing_cycle)
    result = billing_engine.prorate_change(
        change_date=today,
        next_billing_date=next_billing,
        billing_cycle=_cycle_value(old_plan.billing_cycle),
        old_price=old_plan.price,
        old_quantity=sub.quantity,
        new_price=new_plan.price,
        new_quantity=new_qty,
    )
    return {
        "subscription_id": str(sub_id),
        "current_plan": old_plan.name,
        "new_plan": new_plan.name,
        "current_quantity": sub.quantity,
        "new_quantity": new_qty,
        "direction": result.direction,
        "net_amount": result.net_amount,
        "credit_for_unused_old": result.credit_for_unused_old,
        "charge_for_new": result.charge_for_new,
        "unused_days": result.unused_days,
        "days_in_cycle": result.days_in_cycle,
        "notes": result.notes,
    }


def update_subscription(session: Session, sub_id: UUID, **kwargs) -> dict:
    """Change a subscription's plan and/or quantity mid-cycle with real proration.

    Computes the unused-time credit for the old terms and the charge for the new
    terms (billing_engine). A positive net raises an incremental one-off invoice;
    a negative net issues a credit note. The forward schedule is regenerated for
    the new terms so future recurring bills reflect the change.
    """
    sub = get_subscription_or_404(session, sub_id)

    old_plan = session.get(SubscriptionPlan, sub.plan_id)
    old_qty = sub.quantity
    new_qty = kwargs.get("quantity", old_qty) or old_qty
    new_plan_id = kwargs.get("plan_id", sub.plan_id) or sub.plan_id
    new_plan = session.get(SubscriptionPlan, new_plan_id) if new_plan_id else old_plan

    proration = None
    incremental_invoice = None
    credit_note = None

    terms_changed = old_plan and new_plan and (
        new_plan.id != old_plan.id or new_qty != old_qty
    )
    if terms_changed and sub.status == SubscriptionStatus.ACTIVE:
        today = date.today()
        next_billing = sub.next_billing_date or _calc_next_billing(sub.start_date, old_plan.billing_cycle)
        result = billing_engine.prorate_change(
            change_date=today,
            next_billing_date=next_billing,
            billing_cycle=_cycle_value(old_plan.billing_cycle),
            old_price=old_plan.price,
            old_quantity=old_qty,
            new_price=new_plan.price,
            new_quantity=new_qty,
        )
        proration = {
            "direction": result.direction,
            "net_amount": result.net_amount,
            "credit_for_unused_old": result.credit_for_unused_old,
            "charge_for_new": result.charge_for_new,
            "unused_days": result.unused_days,
            "days_in_cycle": result.days_in_cycle,
            "notes": result.notes,
        }
        if result.direction == "CHARGE" and result.net_amount > 0:
            incremental_invoice = invoice_service.create_invoice(
                session,
                customer_id=sub.customer_id,
                amount=result.net_amount,
                notes=(f"Proration for {new_plan.name} change on {today.isoformat()}: "
                       f"{result.unused_days} day(s) remaining."),
            )
        elif result.direction == "CREDIT" and result.net_amount < 0:
            credit_note = invoice_service.create_credit_note(
                session,
                customer_id=sub.customer_id,
                amount=abs(result.net_amount),
                reason=(f"Proration credit for {new_plan.name} change on {today.isoformat()}: "
                        f"{result.unused_days} unused day(s)."),
            )

    for key, val in kwargs.items():
        if val is not None and hasattr(sub, key):
            setattr(sub, key, val)

    # Rebuild the forward schedule for the new terms.
    if new_plan:
        session.flush()
        _regenerate_schedule(session, sub, new_plan)

    session.add(sub)
    session.commit()
    session.refresh(sub)

    data = _enrich_sub(session, sub)
    if proration:
        data["proration"] = proration
    if incremental_invoice:
        data["incremental_invoice"] = {
            "invoice_number": incremental_invoice.invoice_number,
            "amount": incremental_invoice.amount,
        }
    if credit_note:
        data["credit_note"] = {
            "credit_note_number": credit_note.credit_note_number,
            "amount": credit_note.amount,
        }
    return data
