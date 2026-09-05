"""Schemas for SubscriptionPlan and CustomerSubscription."""
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel


class SubscriptionPlanCreate(BaseModel):
    name: str
    billing_cycle: str = "MONTHLY"
    price: float
    description: Optional[str] = None
    products: Optional[str] = None
    proration_rules: Optional[str] = None
    cancellation_rules: Optional[str] = None
    refund_rules: Optional[str] = None

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    billing_cycle: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SubscriptionPlanResponse(BaseModel):
    id: UUID
    name: str
    billing_cycle: str
    price: float
    description: Optional[str]
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True

class CustomerSubscriptionCreate(BaseModel):
    customer_id: UUID
    plan_id: UUID
    quantity: int = 1
    start_date: Optional[date] = None
    next_billing_date: Optional[date] = None

class CustomerSubscriptionUpdate(BaseModel):
    quantity: Optional[int] = None
    status: Optional[str] = None
    next_billing_date: Optional[date] = None

class CustomerSubscriptionResponse(BaseModel):
    id: UUID
    customer_id: UUID
    customer_name: Optional[str] = None
    plan_id: UUID
    plan_name: Optional[str] = None
    plan_billing_cycle: Optional[str] = None
    plan_price: Optional[float] = None
    total_amount: Optional[float] = None
    quantity: int
    status: str
    start_date: date
    next_billing_date: Optional[date]
    cancelled_at: Optional[datetime]
    created_at: datetime
    class Config: from_attributes = True
