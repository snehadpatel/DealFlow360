"""Invoices, Payments, Credit Notes routers — Finance module."""
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.schemas.invoice_schemas import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceSendRequest,
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
    from app.models.customer import Customer
    from sqlmodel import select
    filter_customer = user.customer_id if user.role == Role.CUSTOMER else customer_id
    filter_rep = user.id if user.role == Role.REP else None
    invoices = invoice_service.list_invoices(session, customer_id=filter_customer, status=status, rep_id=filter_rep)
    return invoice_service._with_customer_name(session, invoices)

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
    inv = invoice_service.get_invoice_or_404(session, invoice_id)
    return invoice_service._with_customer_name(session, inv)

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
    payload: Optional[PaymentCreate] = None,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.FINANCE, Role.ADMIN]))
):
    inv = invoice_service.get_invoice_or_404(session, invoice_id)
    pay_amount = payload.amount if (payload and payload.amount) else inv.outstanding_amount
    method = payload.method if (payload and payload.method) else "BANK_TRANSFER"
    transaction_id = payload.transaction_id if (payload and payload.transaction_id) else f"TXN-{uuid4().hex[:8].upper()}"
    notes = payload.notes if (payload and payload.notes) else "Full settlement via DealFlow360"
    invoice_service.record_payment(
        session,
        invoice_id=invoice_id,
        amount=pay_amount,
        method=method,
        transaction_id=transaction_id,
        notes=notes
    )
    inv = invoice_service.get_invoice_or_404(session, invoice_id)
    return invoice_service._with_customer_name(session, inv)


@invoices_router.post("/{invoice_id}/send", response_model=InvoiceResponse)
def send_invoice_endpoint(
    invoice_id: UUID,
    payload: InvoiceSendRequest = Body(default=InvoiceSendRequest()),
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.FINANCE, Role.ADMIN]))
):
    inv = invoice_service.mark_invoice_sent(session, invoice_id)
    return invoice_service._with_customer_name(session, inv)


@invoices_router.get("/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: str,
    session: Session = Depends(get_session)
):
    from fastapi.responses import HTMLResponse
    from app.models.invoice import Invoice
    from app.models.customer import Customer
    from app.models.order import Order, OrderLine
    from app.models.product import Product
    from sqlmodel import select

    # SQLAlchemy's UUID column type calls .hex on the lookup value, which
    # crashes when given a plain str. Parse to uuid.UUID first.
    import uuid as _uuid
    try:
        invoice_uuid = _uuid.UUID(invoice_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")

    invoice = session.get(Invoice, invoice_uuid)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    customer_uuid = _uuid.UUID(str(invoice.customer_id))
    customer = session.get(Customer, customer_uuid)
    customer_name = customer.name if customer else "Corporate Customer"
    customer_address = customer.address_billing or "Address Not Provided"
    tax_id = customer.tax_id or "Not Provided"

    order = None
    if invoice.order_id:
        try:
            order_uuid = _uuid.UUID(str(invoice.order_id))
            order = session.get(Order, order_uuid)
        except (ValueError, Exception):
            order = None
    
    lines_html = ""
    subtotal = invoice.amount
    tax = 0.0 # simplified
    grand_total = invoice.amount

    if order:
        order_lines = session.exec(select(OrderLine).where(OrderLine.order_id == order.id)).all()
        for line in order_lines:
            product = session.get(Product, line.product_id)
            product_name = product.name if product else "Custom Item"
            product_desc = product.description if product else ""
            sku = f"SKU-{str(line.product_id)[:8]}"
            lines_html += f"""
            <tr>
                <td><strong>{product_name}</strong><br><small style="color:#6B7280;">{product_desc}</small></td>
                <td>{sku}</td>
                <td>{line.quantity}</td>
                <td>₹{line.unit_price:,.2f}</td>
                <td>Included</td>
                <td style="text-align: right; font-weight: bold;">₹{line.line_total:,.2f}</td>
            </tr>
            """
    else:
        lines_html = f"""
        <tr>
            <td><strong>Custom Billing</strong><br><small style="color:#6B7280;">Direct Invoice</small></td>
            <td>N/A</td>
            <td>1</td>
            <td>₹{invoice.amount:,.2f}</td>
            <td>Included</td>
            <td style="text-align: right; font-weight: bold;">₹{invoice.amount:,.2f}</td>
        </tr>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tax Invoice {invoice.invoice_number} — DealFlow360</title>
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
          <p>Invoice Ref: <strong>{invoice.invoice_number}</strong></p>
          <p>Date: {invoice.invoice_date.strftime('%d %b %Y')}</p>
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
          <strong>{customer_name}</strong><br>
          {customer_address}<br>
          Tax ID / GSTIN: {tax_id}<br>
          Status: <span style="color: #F26C4F; font-weight: bold;">{invoice.status}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th>SKU</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Tax</th>
            <th style="text-align: right;">Total ({invoice.currency})</th>
          </tr>
        </thead>
        <tbody>
          {lines_html}
        </tbody>
      </table>

      <div class="totals">
        <div class="tot-row"><span>Subtotal:</span><span>₹{subtotal:,.2f}</span></div>
        <div class="tot-row grand"><span>Grand Total:</span><span>₹{grand_total:,.2f}</span></div>
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
