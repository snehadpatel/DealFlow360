from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text


class Tier(str, Enum):
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"


class CustomerStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    BLOCKED = "BLOCKED"


class Customer(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    tier: Tier = Field(default=Tier.BRONZE)
    email: Optional[str] = Field(default=None, index=True)
    phone: Optional[str] = Field(default=None)
    address_billing: Optional[str] = Field(default=None, sa_column=Column(Text))
    address_shipping: Optional[str] = Field(default=None, sa_column=Column(Text))
    tax_id: Optional[str] = Field(default=None)          # GST / EIN / VAT number
    rep_id: Optional[UUID] = Field(default=None, foreign_key="user.id")  # Assigned sales rep
    status: CustomerStatus = Field(default=CustomerStatus.ACTIVE)
    credit_limit: float = Field(default=0.0)             # Max outstanding credit allowed
    payment_terms: Optional[str] = Field(default="Net 30")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
