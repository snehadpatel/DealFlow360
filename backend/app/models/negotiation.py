"""Negotiation thread models — Sales Rep ↔ Customer negotiation."""
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text


class NegotiationStatus(str, Enum):
    OPEN = "OPEN"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    COUNTER_OFFERED = "COUNTER_OFFERED"
    CLOSED = "CLOSED"


class SenderRole(str, Enum):
    REP = "REP"
    CUSTOMER = "CUSTOMER"
    MANAGER = "MANAGER"
    SYSTEM = "SYSTEM"


class Negotiation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id", index=True)
    customer_id: UUID = Field(foreign_key="customer.id")
    rep_id: UUID = Field(foreign_key="user.id")
    status: NegotiationStatus = Field(default=NegotiationStatus.OPEN)
    requested_discount: Optional[float] = Field(default=None)  # Customer's ask
    counter_discount: Optional[float] = Field(default=None)     # Rep's counter
    final_discount: Optional[float] = Field(default=None)       # Agreed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class NegotiationMessage(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    negotiation_id: UUID = Field(foreign_key="negotiation.id", index=True)
    sender_id: UUID = Field(foreign_key="user.id")
    sender_role: SenderRole = Field(default=SenderRole.REP)
    message: str = Field(sa_column=Column(Text))
    discount_proposed: Optional[float] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
