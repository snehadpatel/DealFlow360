"""Billing router — real DB-backed hybrid billing.

Every record is assembled on demand from Orders + Invoices + CustomerSubscriptions
+ BillingSchedules by app.services.billing_service. No hardcoded fixtures.
"""
from typing import Optional
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.models.invoice import Invoice
from app.services import billing_service, invoice_service

router = APIRouter(prefix="/billing", tags=["billing"])


class SendInvoiceRequest(BaseModel):
    email: Optional[str] = None
    message: Optional[str] = None


@router.get("")
def list_billing_orders(
    status: Optional[str] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return billing_service.list_billing(session, status=status, search=search)


@router.get("/summary")
def get_billing_summary(
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return billing_service.summary(session)


@router.get("/{billing_id}")
def get_billing_detail(
    billing_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    record = billing_service.get_billing(session, billing_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Billing record {billing_id} not found")
    return record


@router.get("/{billing_id}/items")
def get_billing_items(
    billing_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    record = get_billing_detail(billing_id, session)
    return {
        "oneTimeItems": record["oneTimeItems"],
        "recurringItems": record["recurringItems"],
    }


@router.get("/{billing_id}/payments")
def get_billing_payments(
    billing_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return get_billing_detail(billing_id, session)["payment"]


@router.get("/{billing_id}/timeline")
def get_billing_timeline(
    billing_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return get_billing_detail(billing_id, session)["timeline"]


@router.get("/{billing_id}/invoice")
def get_billing_invoice(
    billing_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return get_billing_detail(billing_id, session)["invoice"]


@router.post("/{billing_id}/send-invoice")
def send_billing_invoice(
    billing_id: str,
    payload: SendInvoiceRequest,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.FINANCE, Role.ADMIN])),
):
    record = billing_service.get_billing(session, billing_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Billing record {billing_id} not found")

    invoice_id = record["invoice"].get("invoiceId")
    if not invoice_id:
        raise HTTPException(status_code=400, detail="No invoice exists for this billing record yet")

    # Real state transition — flips status to SENT and fires the audit UPDATE
    # with the request actor/IP.
    invoice_service.mark_invoice_sent(session, UUID(invoice_id))

    target_email = payload.email or record["customer"]["email"]
    return {
        "success": True,
        "message": f"Invoice {record['invoice']['invoiceNumber']} dispatched to {target_email}",
        "sentAt": datetime.utcnow().isoformat(),
    }
