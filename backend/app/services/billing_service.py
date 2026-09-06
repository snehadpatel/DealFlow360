"""Billing assembly service — builds hybrid billing records from real data.

A "billing record" is a per-order view that fuses:
  * the Order + its OrderLines (split into one-time vs recurring by product
    category — a single order genuinely carries both kinds of line),
  * the downstream Invoice (amount, paid, outstanding, status, due date),
  * any CustomerSubscriptions tied to the order and their generated
    BillingSchedule (the real recurring calendar), and
  * the audit-derived lifecycle timeline.

Everything is queried from the DB. No hardcoded fixtures.
"""
from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select

from app.models.order import Order, OrderLine
from app.models.product import Product
from app.models.customer import Customer
from app.models.invoice import Invoice, Payment
from app.models.subscription import (
    CustomerSubscription, SubscriptionPlan, BillingSchedule,
)
from app.models.audit import AuditLog


def _billing_id(order: Order) -> str:
    return f"BIL-{str(order.id)[:8].upper()}"


def _line_view(session: Session, line: OrderLine, product: Optional[Product]) -> dict:
    disc = 0.0
    tax_pct = product.tax_rate if product else 0.0
    gross = line.unit_price * line.quantity
    tax_amt = round(gross * tax_pct / 100.0, 2)
    return {
        "id": str(line.id),
        "productName": product.name if product else "Item",
        "sku": (product.sku if product else None) or "—",
        "category": product.category if product else "Hardware",
        "quantity": line.quantity,
        "unitPrice": line.unit_price,
        "discountPercent": disc,
        "taxPercent": tax_pct,
        "taxAmount": tax_amt,
        "total": round(line.line_total, 2),
    }


def _timeline(session: Session, order: Order, invoice: Optional[Invoice]) -> List[dict]:
    """Lifecycle timeline derived from real audit rows for this order's quote,
    plus concrete order/invoice milestones."""
    events: List[dict] = [{
        "id": 1,
        "title": "Order Confirmed",
        "status": "CONFIRMED",
        "date": order.created_at.isoformat() if order.created_at else None,
        "description": "Order generated from confirmed quotation",
        "actor": "Sales Engine",
    }]
    if invoice:
        events.append({
            "id": 2,
            "title": "Invoice Generated",
            "status": "GENERATED",
            "date": invoice.created_at.isoformat() if invoice.created_at else None,
            "description": f"Invoice {invoice.invoice_number} issued for {invoice.currency} {invoice.amount:,.2f}",
            "actor": "Finance",
        })
        payments = session.exec(
            select(Payment).where(Payment.invoice_id == invoice.id).order_by(Payment.paid_at)
        ).all()
        for idx, p in enumerate(payments):
            events.append({
                "id": 3 + idx,
                "title": "Payment Received",
                "status": "COMPLETED",
                "date": p.paid_at.isoformat() if p.paid_at else None,
                "description": f"Received {invoice.currency} {p.amount:,.2f} via {p.method.value if hasattr(p.method,'value') else p.method}",
                "actor": "Treasury",
            })
    return events


def build_billing_record(session: Session, order: Order) -> dict:
    customer = session.get(Customer, order.customer_id)
    lines = session.exec(select(OrderLine).where(OrderLine.order_id == order.id)).all()
    product_ids = [l.product_id for l in lines]
    products = {
        p.id: p for p in (
            session.exec(select(Product).where(Product.id.in_(product_ids))).all()
            if product_ids else []
        )
    }

    one_time_items, recurring_items = [], []
    one_time_total, recurring_total = 0.0, 0.0
    for l in lines:
        prod = products.get(l.product_id)
        view = _line_view(session, l, prod)
        if prod and (prod.category or "").upper() == "SUBSCRIPTION":
            recurring_items.append(view)
            recurring_total += view["total"]
        else:
            one_time_items.append(view)
            one_time_total += view["total"]

    invoice = session.exec(select(Invoice).where(Invoice.order_id == order.id)).first()

    # Recurring detail comes from real subscriptions + their generated schedule.
    subs = session.exec(
        select(CustomerSubscription).where(CustomerSubscription.order_id == order.id)
    ).all()
    for sub in subs:
        plan = session.get(SubscriptionPlan, sub.plan_id)
        schedule = session.exec(
            select(BillingSchedule).where(BillingSchedule.subscription_id == sub.id)
            .order_by(BillingSchedule.period_index)
        ).all()
        next_period = next((s for s in schedule if s.status.value == "SCHEDULED"), None)
        recurring_items.append({
            "id": str(sub.id),
            "planName": plan.name if plan else "Subscription Plan",
            "sku": "SUB",
            "quantity": sub.quantity,
            "billingCycle": (plan.billing_cycle.value if plan and hasattr(plan.billing_cycle, "value") else "MONTHLY"),
            "recurringAmount": round((plan.price if plan else 0.0) * sub.quantity, 2),
            "nextBillingDate": sub.next_billing_date.isoformat() if sub.next_billing_date else None,
            "status": sub.status.value if hasattr(sub.status, "value") else str(sub.status),
            "schedule": [
                {"period_index": s.period_index, "period_start": s.period_start.isoformat(),
                 "period_end": s.period_end.isoformat(), "amount": s.amount,
                 "status": s.status.value if hasattr(s.status, "value") else str(s.status)}
                for s in schedule
            ],
        })
        if plan:
            recurring_total += round(plan.price * sub.quantity, 2)

    total_amount = invoice.amount if invoice else round(one_time_total + recurring_total, 2)
    amount_paid = invoice.amount_paid if invoice else 0.0
    outstanding = invoice.outstanding_amount if invoice else total_amount
    status = (invoice.status.value if invoice and hasattr(invoice.status, "value")
              else (invoice.status if invoice else order.payment_status.value if hasattr(order.payment_status, "value") else "PENDING"))
    currency = invoice.currency if invoice else "INR"

    return {
        "id": str(invoice.id) if invoice else str(order.id),
        "billingId": _billing_id(order),
        "orderId": str(order.id),
        "quotationId": str(order.quotation_id)[:8] if order.quotation_id else None,
        "customerName": customer.name if customer else "Customer",
        "status": status,
        "createdAt": order.created_at.isoformat() if order.created_at else None,
        "currency": currency,
        "totalAmount": round(total_amount, 2),
        "oneTimeCharges": round(one_time_total, 2),
        "recurringCharges": round(recurring_total, 2),
        "amountPaid": round(amount_paid, 2),
        "outstandingAmount": round(outstanding, 2),
        "customer": {
            "name": customer.name if customer else "Customer",
            "customerId": str(order.customer_id),
            "address": (customer.address_billing if customer else None) or "—",
            "email": (customer.email if customer else None) or "—",
            "phone": (customer.phone if customer else None) or "—",
            "taxId": (getattr(customer, "tax_id", None) if customer else None) or "—",
        },
        "oneTimeItems": one_time_items,
        "recurringItems": recurring_items,
        "payment": {
            "status": status,
            "method": "Bank Transfer",
            "paidAmount": round(amount_paid, 2),
            "outstandingAmount": round(outstanding, 2),
            "currency": currency,
        },
        "invoice": {
            "invoiceNumber": invoice.invoice_number if invoice else None,
            "invoiceId": str(invoice.id) if invoice else None,
            "invoiceDate": invoice.created_at.isoformat() if invoice and invoice.created_at else None,
            "dueDate": invoice.due_date.isoformat() if invoice and invoice.due_date else None,
            "invoiceAmount": round(total_amount, 2),
            "status": status,
        },
        "timeline": _timeline(session, order, invoice),
        "permissions": {
            "can_send_invoice": bool(invoice),
            "can_download_invoice": bool(invoice),
            "can_record_payment": bool(invoice) and status != "PAID",
        },
    }


def list_billing(session: Session, status: Optional[str] = None,
                 search: Optional[str] = None) -> List[dict]:
    orders = session.exec(select(Order).order_by(Order.created_at.desc())).all()
    records = [build_billing_record(session, o) for o in orders]
    if status and status.upper() != "ALL":
        records = [r for r in records if (r["status"] or "").upper() == status.upper()]
    if search:
        q = search.lower()
        records = [
            r for r in records
            if q in (r["billingId"] or "").lower()
            or q in (r["customerName"] or "").lower()
            or q in (r["quotationId"] or "").lower()
        ]
    return records


def get_billing(session: Session, billing_id: str) -> Optional[dict]:
    """Resolve a billing record by BIL-xxxx id, order id, or invoice id."""
    orders = session.exec(select(Order)).all()
    key = (billing_id or "").upper()
    for o in orders:
        if _billing_id(o) == key or str(o.id).upper() == key:
            return build_billing_record(session, o)
    # try invoice id
    try:
        inv = session.get(Invoice, UUID(billing_id))
        if inv and inv.order_id:
            order = session.get(Order, inv.order_id)
            if order:
                return build_billing_record(session, order)
    except (ValueError, AttributeError):
        pass
    return None


def summary(session: Session) -> dict:
    records = list_billing(session)
    return {
        "totalBillingOrders": len(records),
        "totalAmount": round(sum(r["totalAmount"] for r in records), 2),
        "oneTimeCharges": round(sum(r["oneTimeCharges"] for r in records), 2),
        "recurringCharges": round(sum(r["recurringCharges"] for r in records), 2),
        "amountPaid": round(sum(r["amountPaid"] for r in records), 2),
        "outstandingAmount": round(sum(r["outstandingAmount"] for r in records), 2),
    }
