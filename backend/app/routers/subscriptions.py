"""Subscriptions router — replaces empty stub with full CRUD."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.schemas.subscription_schemas import (
    SubscriptionPlanCreate, SubscriptionPlanUpdate, SubscriptionPlanResponse,
    CustomerSubscriptionCreate, CustomerSubscriptionUpdate, CustomerSubscriptionResponse
)
from app.services import subscription_service

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


# ─── Plans ────────────────────────────────────────────────────────────────────

@router.get("/plans", response_model=List[SubscriptionPlanResponse])
def list_plans(session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return subscription_service.list_plans(session)

@router.post("/plans", response_model=SubscriptionPlanResponse, status_code=201)
def create_plan(
    payload: SubscriptionPlanCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN]))
):
    return subscription_service.create_plan(session, **payload.model_dump())

@router.put("/plans/{plan_id}", response_model=SubscriptionPlanResponse)
def update_plan(
    plan_id: UUID,
    payload: SubscriptionPlanUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN]))
):
    return subscription_service.update_plan(session, plan_id, **payload.model_dump(exclude_none=True))

@router.delete("/plans/{plan_id}", status_code=204)
def delete_plan(
    plan_id: UUID,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN]))
):
    subscription_service.delete_plan(session, plan_id)


# ─── Customer Subscriptions ───────────────────────────────────────────────────

@router.get("", response_model=List[CustomerSubscriptionResponse])
def list_subscriptions(
    customer_id: Optional[UUID] = Query(default=None),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    filter_cust = user.customer_id if user.role == Role.CUSTOMER else customer_id
    return subscription_service.list_customer_subscriptions(session, customer_id=filter_cust)

@router.post("", response_model=CustomerSubscriptionResponse, status_code=201)
def subscribe(
    payload: CustomerSubscriptionCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN, Role.FINANCE, Role.REP]))
):
    return subscription_service.subscribe_customer(
        session, payload.customer_id, payload.plan_id, payload.quantity, payload.start_date
    )

@router.get("/{sub_id}/proration-preview")
def proration_preview(
    sub_id: UUID,
    plan_id: Optional[UUID] = Query(default=None),
    quantity: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    """Dry-run the proration math for a proposed change without persisting it,
    so the UI can show the customer exactly what they'll be charged/credited."""
    return subscription_service.preview_proration(session, sub_id, plan_id=plan_id, quantity=quantity)

@router.put("/{sub_id}", response_model=CustomerSubscriptionResponse)
def update_subscription(
    sub_id: UUID,
    payload: CustomerSubscriptionUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN, Role.FINANCE]))
):
    return subscription_service.update_subscription(session, sub_id, **payload.model_dump(exclude_none=True))

@router.post("/{sub_id}/cancel", response_model=CustomerSubscriptionResponse)
def cancel_subscription(
    sub_id: UUID,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    sub = subscription_service.get_subscription_or_404(session, sub_id)
    if user.role == Role.CUSTOMER and sub.customer_id != user.customer_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    return subscription_service.cancel_subscription(session, sub_id)

@router.post("/{sub_id}/pause", response_model=CustomerSubscriptionResponse)
def pause_subscription(
    sub_id: UUID,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    sub = subscription_service.get_subscription_or_404(session, sub_id)
    if user.role == Role.CUSTOMER and sub.customer_id != user.customer_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    return subscription_service.pause_subscription(session, sub_id)

@router.post("/{sub_id}/resume", response_model=CustomerSubscriptionResponse)
def resume_subscription(
    sub_id: UUID,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    sub = subscription_service.get_subscription_or_404(session, sub_id)
    if user.role == Role.CUSTOMER and sub.customer_id != user.customer_id:
        raise HTTPException(status_code=403, detail="Permission denied")
    return subscription_service.resume_subscription(session, sub_id)
