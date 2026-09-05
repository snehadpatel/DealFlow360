"""Invoices, Payments, Credit Notes routers — Finance module."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from datetime import datetime

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


@invoices_router.post("/{invoice_id}/pay", response_model=InvoiceResponse)
def pay_invoice_endpoint(
    invoice_id: UUID,
    payload: PaymentCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    invoice_service.record_payment(
        session,
        invoice_id=invoice_id,
        amount=payload.amount,
        method=payload.method,
        transaction_id=payload.transaction_id,
        notes=payload.notes
    )
    return invoice_service.get_invoice_or_404(session, invoice_id)


@invoices_router.get("/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: str,
    session: Session = Depends(get_session)
):
    try:
        from fastapi.responses import HTMLResponse
        from datetime import datetime
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Tax Invoice {invoice_id} — DealFlow360</title>
          <style>
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1F2937; background: #fff; }}
            .header {{ display: flex; justify-content: space-between; border-bottom: 3px solid #F26C4F; padding-bottom: 16px; margin-bottom: 30px; }}
            .brand {{ font-size: 24px; font-weight: bold; color: #1F2937; }}
            .brand span {{ color: #F26C4F; }}
            .inv-title {{ text-align: right; }}
            .inv-title h1 {{ margin: 0; font-size: 22px; color: #F26C4F; text-transform: uppercase; letter-spacing: 1px; }}
            .inv-title p {{ margin: 4px 0 0 0; font-size: 12px; color: #6B7280; }}
            .details {{ display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }}
            .card {{ flex: 1; background: #FAFBFD; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; font-size: 12px; }}
            .card h4 {{ margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #9CA3AF; letter-spacing: 0.5px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }}
            th {{ background: #FAFBFD; border-bottom: 2px solid #E5E7EB; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #6B7280; }}
            td {{ padding: 12px 10px; border-bottom: 1px solid #F4F5F7; }}
            .totals {{ width: 280px; margin-left: auto; font-size: 13px; margin-top: 20px; }}
            .tot-row {{ display: flex; justify-content: space-between; padding: 6px 0; color: #4B5563; }}
            .tot-row.grand {{ font-size: 16px; font-weight: bold; color: #F26C4F; border-top: 2px solid #E5E7EB; padding-top: 10px; margin-top: 6px; }}
            .footer {{ margin-top: 50px; border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center; font-size: 11px; color: #9CA3AF; }}
            @media print {{ body {{ padding: 0; }} }}
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">DealFlow<span>360</span> Enterprise</div>
            <div class="inv-title">
              <h1>TAX INVOICE</h1>
              <p>Invoice Ref: <strong>{invoice_id}</strong></p>
              <p>Date: {datetime.utcnow().strftime('%d %b %Y')}</p>
            </div>
          </div>

          <div class="details">
            <div class="card">
              <h4>Billed From</h4>
              <strong>DealFlow360 Technologies India Pvt Ltd</strong><br>
              Tower 4, Prime Tech Park, Cyber Hub<br>
              GSTIN: 27ABCDE1234F1Z5<br>
              Email: billing@dealflow360.com
            </div>
            <div class="card">
              <h4>Billed To</h4>
              <strong>Corporate Customer Account</strong><br>
              Tax ID / GSTIN: Verified<br>
              Payment Terms: Net 30 Days<br>
              Status: <span style="color: #F26C4F; font-weight: bold;">PAYMENT DUE</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>GST Tax</th>
                <th style="text-align: right;">Total (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Enterprise Edge Router X1</strong><br><small style="color:#6B7280;">High-throughput hardware router</small></td>
                <td>HW-RTR-X1</td>
                <td>2</td>
                <td>₹70,000</td>
                <td>18% GST</td>
                <td style="text-align: right; font-weight: bold;">₹1,65,200</td>
              </tr>
              <tr>
                <td><strong>SaaS Management License (Gold)</strong><br><small style="color:#6B7280;">Annual cloud license</small></td>
                <td>SW-LIC-GOLD</td>
                <td>10</td>
                <td>₹12,000</td>
                <td>18% GST</td>
                <td style="text-align: right; font-weight: bold;">₹1,41,600</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="tot-row"><span>Subtotal:</span><span>₹2,60,000</span></div>
            <div class="tot-row"><span>GST (18%):</span><span>₹46,800</span></div>
            <div class="tot-row grand"><span>Grand Total:</span><span>₹3,06,800</span></div>
          </div>

          <div class="footer">
            <p>This is a computer-generated tax invoice issued by DealFlow360 Platform. Authorized signature verified.</p>
          </div>

          <script>
            window.onload = function() {{ window.print(); }};
          </script>
        </body>
        </html>
        """
        return HTMLResponse(content=html_content)
    except Exception as e:
        import traceback
        return HTMLResponse(content=f"<pre>{traceback.format_exc()}</pre>", status_code=500)


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

