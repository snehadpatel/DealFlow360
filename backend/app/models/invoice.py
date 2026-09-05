"""Invoice, Payment, and CreditNote models — Finance module."""
from typing import Optional
from datetime import datetime, date
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text


class InvoiceStatus(str, Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"


class PaymentMethod(str, Enum):
    BANK_TRANSFER = "BANK_TRANSFER"
    CREDIT_CARD = "CREDIT_CARD"
    CHEQUE = "CHEQUE"
    CASH = "CASH"
    NET_30 = "NET_30"
    NET_60 = "NET_60"
    ACH = "ACH"


class Invoice(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    invoice_number: str = Field(index=True)              # e.g. INV-2026-0001
    order_id: Optional[UUID] = Field(default=None, foreign_key="order.id")
    customer_id: UUID = Field(foreign_key="customer.id", index=True)
    status: InvoiceStatus = Field(default=InvoiceStatus.DRAFT)
    amount: float = Field(default=0.0)                   # Total invoice amount
    amount_paid: float = Field(default=0.0)
    outstanding_amount: float = Field(default=0.0)
    currency: str = Field(default="INR")
    due_date: Optional[date] = Field(default=None)
    invoice_date: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Payment(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    invoice_id: UUID = Field(foreign_key="invoice.id", index=True)
    amount: float
    method: PaymentMethod = Field(default=PaymentMethod.BANK_TRANSFER)
    transaction_id: Optional[str] = Field(default=None)
    status: str = Field(default="COMPLETED")             # PENDING, COMPLETED, FAILED
    paid_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(default=None)


class CreditNote(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    credit_note_number: str = Field(index=True)          # e.g. CN-2026-0001
    invoice_id: Optional[UUID] = Field(default=None, foreign_key="invoice.id")
    customer_id: UUID = Field(foreign_key="customer.id", index=True)
    amount: float
    reason: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
