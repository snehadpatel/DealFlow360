"""Schemas for Invoice, Payment, CreditNote."""
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel


class InvoiceCreate(BaseModel):
    order_id: Optional[UUID] = None
    customer_id: UUID
    amount: float
    currency: str = "INR"
    due_date: Optional[date] = None
    notes: Optional[str] = None

class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None

class InvoiceResponse(BaseModel):
    id: UUID
    invoice_number: str
    order_id: Optional[UUID]
    customer_id: UUID
    status: str
    amount: float
    amount_paid: float
    outstanding_amount: float
    currency: str
    due_date: Optional[date]
    invoice_date: datetime
    notes: Optional[str]
    created_at: datetime
    customer_name: Optional[str] = None
    class Config: from_attributes = True

class PaymentCreate(BaseModel):
    invoice_id: Optional[UUID] = None
    amount: float
    method: str = "BANK_TRANSFER"
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class PaymentResponse(BaseModel):
    id: UUID
    invoice_id: UUID
    amount: float
    method: str
    transaction_id: Optional[str]
    status: str
    paid_at: datetime
    notes: Optional[str]
    class Config: from_attributes = True

class CreditNoteCreate(BaseModel):
    invoice_id: Optional[UUID] = None
    customer_id: UUID
    amount: float
    reason: Optional[str] = None

class CreditNoteResponse(BaseModel):
    id: UUID
    credit_note_number: str
    invoice_id: Optional[UUID]
    customer_id: UUID
    amount: float
    reason: Optional[str]
    created_at: datetime
    class Config: from_attributes = True
