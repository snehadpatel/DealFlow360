"""Invoice service — create invoices, record payments, credit notes."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.invoice import Invoice, Payment, CreditNote, InvoiceStatus


def _next_invoice_number(session: Session) -> str:
    count = len(session.exec(select(Invoice)).all())
    return f"INV-{datetime.utcnow().year}-{count + 1:04d}"

def _next_credit_note_number(session: Session) -> str:
    count = len(session.exec(select(CreditNote)).all())
    return f"CN-{datetime.utcnow().year}-{count + 1:04d}"


def create_invoice(session: Session, customer_id: UUID, amount: float,
                   order_id: Optional[UUID] = None, currency: str = "INR",
                   due_date: Optional[date] = None, notes: Optional[str] = None) -> Invoice:
    invoice = Invoice(
        invoice_number=_next_invoice_number(session),
        customer_id=customer_id,
        order_id=order_id,
        amount=amount,
        outstanding_amount=amount,
        currency=currency,
        due_date=due_date or (date.today() + timedelta(days=30)),
        notes=notes,
    )
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    return invoice


def list_invoices(session: Session, customer_id: Optional[UUID] = None,
                  status: Optional[str] = None, rep_id: Optional[UUID] = None) -> List[Invoice]:
    from app.models.customer import Customer
    stmt = select(Invoice).order_by(Invoice.created_at.desc())
    if rep_id:
        stmt = stmt.join(Customer, Invoice.customer_id == Customer.id).where(Customer.rep_id == rep_id)
    if customer_id:
        stmt = stmt.where(Invoice.customer_id == customer_id)
    if status:
        stmt = stmt.where(Invoice.status == InvoiceStatus(status))
    return session.exec(stmt).all()


def get_invoice_or_404(session: Session, invoice_id: UUID) -> Invoice:
    inv = session.get(Invoice, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv


def update_invoice_status(session: Session, invoice_id: UUID, new_status: str) -> Invoice:
    inv = get_invoice_or_404(session, invoice_id)
    inv.status = InvoiceStatus(new_status)
    session.add(inv)
    session.commit()
    session.refresh(inv)
    return inv


def mark_invoice_sent(session: Session, invoice_id: UUID) -> Invoice:
    """Mark an invoice as SENT. No-op (returns as-is) if it's already been
    paid or partially paid, so 'Send' can't downgrade a settled invoice.
    The commit fires the audit UPDATE listener with the request's actor/IP."""
    inv = get_invoice_or_404(session, invoice_id)
    if inv.status in (InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID):
        return inv
    inv.status = InvoiceStatus.SENT
    session.add(inv)
    session.commit()
    session.refresh(inv)
    return inv


def _with_customer_name(session: Session, invoices):
    """Build InvoiceResponse objects carrying the real customer name.

    We can't set `customer_name` directly on the SQLModel `Invoice` ORM
    instance (Pydantic v2 rejects attributes that aren't declared fields),
    so we construct the response schema from each invoice plus the looked-up
    name. Accepts a single invoice or a list and mirrors the input shape."""
    from app.models.customer import Customer
    from app.schemas.invoice_schemas import InvoiceResponse
    single = not isinstance(invoices, (list, tuple))
    items = [invoices] if single else list(invoices)
    ids = {inv.customer_id for inv in items if inv.customer_id}
    names = {}
    if ids:
        rows = session.exec(select(Customer).where(Customer.id.in_(ids))).all()
        names = {c.id: c.name for c in rows}
    responses = [
        InvoiceResponse(**inv.model_dump(), customer_name=names.get(inv.customer_id))
        for inv in items
    ]
    return responses[0] if single else responses


def record_payment(session: Session, invoice_id: UUID, amount: float,
                   method: str = "BANK_TRANSFER", transaction_id: Optional[str] = None,
                   notes: Optional[str] = None) -> Payment:
    invoice = get_invoice_or_404(session, invoice_id)

    payment = Payment(
        invoice_id=invoice_id,
        amount=amount,
        method=method,
        transaction_id=transaction_id,
        notes=notes,
    )
    session.add(payment)

    # Update invoice balances
    invoice.amount_paid = round(invoice.amount_paid + amount, 2)
    invoice.outstanding_amount = round(invoice.amount - invoice.amount_paid, 2)
    if invoice.outstanding_amount <= 0:
        invoice.status = InvoiceStatus.PAID
        invoice.outstanding_amount = 0
    else:
        invoice.status = InvoiceStatus.PARTIALLY_PAID

    session.add(invoice)
    session.commit()
    session.refresh(payment)
    return payment


def list_payments(session: Session, invoice_id: Optional[UUID] = None) -> List[Payment]:
    stmt = select(Payment).order_by(Payment.paid_at.desc())
    if invoice_id:
        stmt = stmt.where(Payment.invoice_id == invoice_id)
    return session.exec(stmt).all()


def create_credit_note(session: Session, customer_id: UUID, amount: float,
                       invoice_id: Optional[UUID] = None, reason: Optional[str] = None) -> CreditNote:
    cn = CreditNote(
        credit_note_number=_next_credit_note_number(session),
        customer_id=customer_id,
        invoice_id=invoice_id,
        amount=amount,
        reason=reason,
    )
    session.add(cn)
    session.commit()
    session.refresh(cn)
    return cn


def list_credit_notes(session: Session, customer_id: Optional[UUID] = None) -> List[CreditNote]:
    stmt = select(CreditNote).order_by(CreditNote.created_at.desc())
    if customer_id:
        stmt = stmt.where(CreditNote.customer_id == customer_id)
    return session.exec(stmt).all()


def get_customer_credit_summary(session: Session, customer_id: UUID) -> dict:
    from app.models.customer import Customer
    from app.models.invoice import InvoiceStatus
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    invoices = session.exec(select(Invoice).where(Invoice.customer_id == customer_id)).all()
    total_outstanding = sum(i.outstanding_amount for i in invoices)
    overdue = [i for i in invoices if i.status == InvoiceStatus.OVERDUE]

    return {
        "customer_id": str(customer_id),
        "customer_name": customer.name,
        "credit_limit": customer.credit_limit,
        "used": total_outstanding,
        "available": max(0, customer.credit_limit - total_outstanding),
        "overdue_count": len(overdue),
        "overdue_amount": sum(i.outstanding_amount for i in overdue),
    }
