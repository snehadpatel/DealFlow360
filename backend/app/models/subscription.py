"""Subscription plan and customer subscription models."""
from typing import Optional
from datetime import datetime, date
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text


class BillingCycle(str, Enum):
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"
    YEARLY = "YEARLY"


class SubscriptionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    CANCELLED = "CANCELLED"
    PENDING = "PENDING"


class SubscriptionPlan(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    billing_cycle: BillingCycle = Field(default=BillingCycle.MONTHLY)
    price: float
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    products: Optional[str] = Field(default=None, sa_column=Column(Text))  # JSON
    proration_rules: Optional[str] = Field(default=None, sa_column=Column(Text))
    cancellation_rules: Optional[str] = Field(default=None, sa_column=Column(Text))
    refund_rules: Optional[str] = Field(default=None, sa_column=Column(Text))
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CustomerSubscription(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    customer_id: UUID = Field(foreign_key="customer.id", index=True)
    plan_id: UUID = Field(foreign_key="subscriptionplan.id")
    order_id: Optional[UUID] = Field(default=None, foreign_key="order.id", index=True)
    quantity: int = Field(default=1)
    status: SubscriptionStatus = Field(default=SubscriptionStatus.ACTIVE)
    start_date: date = Field(default_factory=date.today)
    next_billing_date: Optional[date] = Field(default=None)
    cancelled_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ScheduleStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    INVOICED = "INVOICED"
    PAID = "PAID"
    SKIPPED = "SKIPPED"


class BillingSchedule(SQLModel, table=True):
    """One recurring billing period generated for a customer subscription.

    Persisting the forward schedule (rather than a single next_billing_date)
    is what makes recurring billing a real calendar the UI can render and the
    finance team can act on."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    subscription_id: UUID = Field(foreign_key="customersubscription.id", index=True)
    period_index: int = Field(default=1)
    period_start: date
    period_end: date
    amount: float = Field(default=0.0)
    status: ScheduleStatus = Field(default=ScheduleStatus.SCHEDULED)
    invoice_id: Optional[UUID] = Field(default=None, foreign_key="invoice.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
