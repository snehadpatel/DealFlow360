"""Invoices, Payments, Credit Notes routers — Finance module."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.schemas.invoice_schemas import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse,
    PaymentCreate, PaymentResponse,
    CreditNoteCreate, CreditNoteResponse
)
from app.services import invoice_service

# ─── Invoices ─────────────────────────────────────────────────────────────────
invoices_router = APIRouter(prefix="/invoices", tags=["invoices"])

@invoices_router.get("", response_model=List[InvoiceResponse])
def list_invoices(
    customer_id: Optional[UUID] = Query(default=None),
    status: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    filter_customer = user.customer_id if user.role == Role.CUSTOMER else customer_id
    return invoice_service.list_invoices(session, customer_id=filter_customer, status=status)

@invoices_router.get("/summary")
def invoice_summary(session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    invoices = invoice_service.list_invoices(session)
    from app.models.invoice import InvoiceStatus
    return {
        "total": len(invoices),
        "paid": len([i for i in invoices if i.status == InvoiceStatus.PAID]),
        "pending": len([i for i in invoices if i.status in (InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID)]),
        "overdue": len([i for i in invoices if i.status == InvoiceStatus.OVERDUE]),
        "total_outstanding": round(sum(i.outstanding_amount for i in invoices), 2),
    }

@invoices_router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: UUID, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return invoice_service.get_invoice_or_404(session, invoice_id)

@invoices_router.post("", response_model=InvoiceResponse, status_code=201)
def create_invoice(
    payload: InvoiceCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.FINANCE, Role.ADMIN]))
):
    return invoice_service.create_invoice(session, **payload.model_dump())

@invoices_router.put("/{invoice_id}/status")
def update_status(
    invoice_id: UUID,
    status: str = Query(...),
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.FINANCE, Role.ADMIN]))
):
    return invoice_service.update_invoice_status(session, invoice_id, status)


# ─── Payments ─────────────────────────────────────────────────────────────────
payments_router = APIRouter(prefix="/payments", tags=["payments"])

@payments_router.get("", response_model=List[PaymentResponse])
def list_payments(
    invoice_id: Optional[UUID] = Query(default=None),
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.FINANCE, Role.ADMIN, Role.CUSTOMER]))
):
    return invoice_service.list_payments(session, invoice_id)

@payments_router.post("", response_model=PaymentResponse, status_code=201)
def record_payment(
    payload: PaymentCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.FINANCE, Role.ADMIN]))
):
    return invoice_service.record_payment(session, **payload.model_dump())


# ─── Credit Notes ─────────────────────────────────────────────────────────────
credit_notes_router = APIRouter(prefix="/credit-notes", tags=["credit-notes"])

@credit_notes_router.get("", response_model=List[CreditNoteResponse])
def list_credit_notes(
    customer_id: Optional[UUID] = Query(default=None),
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.FINANCE, Role.ADMIN, Role.CUSTOMER]))
):
    return invoice_service.list_credit_notes(session, customer_id)

@credit_notes_router.post("", response_model=CreditNoteResponse, status_code=201)
def create_credit_note(
    payload: CreditNoteCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.FINANCE, Role.ADMIN]))
):
    return invoice_service.create_credit_note(session, **payload.model_dump())

@credit_notes_router.get("/customer/{customer_id}/credit-summary")
def customer_credit_summary(
    customer_id: UUID,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.FINANCE, Role.ADMIN]))
):
    return invoice_service.get_customer_credit_summary(session, customer_id)
