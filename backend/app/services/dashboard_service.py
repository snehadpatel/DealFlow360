"""Role-aware dashboard stats service — computes KPIs from real DB data."""
from typing import Optional
from uuid import UUID
from datetime import datetime, date, timedelta

from sqlmodel import Session, select, func

from app.models.user import User, Role
from app.models.quotation import Quotation, QuoteStatus
from app.models.customer import Customer
from app.models.order import Order, OrderStatus, Shipment
from app.models.invoice import Invoice, InvoiceStatus
from app.models.approval import ApprovalRequest, ApprovalStatus
from app.models.subscription import CustomerSubscription, SubscriptionStatus


def admin_dashboard(session: Session) -> dict:
    total_users = len(session.exec(select(User)).all())
    active_reps = len(session.exec(select(User).where(User.role == Role.REP, User.is_active == True)).all())
    total_customers = len(session.exec(select(Customer)).all())
    total_quotes = len(session.exec(select(Quotation)).all())
    total_orders = len(session.exec(select(Order)).all())
    total_revenue = sum(o.total_amount for o in session.exec(select(Order)).all())
    pending_approvals = len(session.exec(
        select(ApprovalRequest).where(ApprovalRequest.status == ApprovalStatus.PENDING)
    ).all())
    high_risk = len(session.exec(
        select(Quotation).where(Quotation.risk_level == "HIGH")
    ).all())
    active_subs = len(session.exec(
        select(CustomerSubscription).where(CustomerSubscription.status == SubscriptionStatus.ACTIVE)
    ).all())
    low_stock_threshold = 10
    from app.models.warehouse import StockInventory
    low_stock = len(session.exec(
        select(StockInventory).where(StockInventory.available_units <= low_stock_threshold)
    ).all())

    return {
        "total_users": total_users,
        "active_reps": active_reps,
        "total_customers": total_customers,
        "total_quotes": total_quotes,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "pending_approvals": pending_approvals,
        "high_risk_deals": high_risk,
        "active_subscriptions": active_subs,
        "warehouse_alerts": low_stock,
    }


def rep_dashboard(session: Session, rep_id: UUID) -> dict:
    my_quotes = session.exec(select(Quotation).where(Quotation.rep_id == rep_id)).all()
    drafts = [q for q in my_quotes if q.status == QuoteStatus.DRAFT]
    pending_approval = [q for q in my_quotes if q.status == QuoteStatus.PENDING_APPROVAL]
    approved = [q for q in my_quotes if q.status == QuoteStatus.APPROVED]
    confirmed = [q for q in my_quotes if q.status == QuoteStatus.CONFIRMED]

    from app.models.negotiation import Negotiation, NegotiationStatus
    negotiations = session.exec(
        select(Negotiation).where(Negotiation.rep_id == rep_id, Negotiation.status == NegotiationStatus.OPEN)
    ).all()

    total_sales = sum(q.total for q in confirmed)
    avg_margin = (sum(q.margin_percent for q in confirmed) / len(confirmed)) if confirmed else 0

    return {
        "my_quotations": len(my_quotes),
        "draft_quotations": len(drafts),
        "pending_approvals": len(pending_approval),
        "negotiations": len(negotiations),
        "won_deals": len(confirmed),
        "total_sales": round(total_sales, 2),
        "expected_revenue": round(sum(q.total for q in approved), 2),
        "average_margin": round(avg_margin, 1),
    }


def manager_dashboard(session: Session) -> dict:
    all_quotes = session.exec(select(Quotation)).all()
    pending_approvals = len(session.exec(
        select(ApprovalRequest).where(ApprovalRequest.status == ApprovalStatus.PENDING)
    ).all())
    high_risk = [q for q in all_quotes if q.risk_level == "HIGH"]
    pipeline_value = sum(q.total for q in all_quotes if q.status not in (QuoteStatus.EXPIRED, QuoteStatus.REJECTED))
    stalled = [q for q in all_quotes if q.status == QuoteStatus.PENDING_APPROVAL and
               (datetime.utcnow() - q.updated_at).days > 3]
    confirmed = [q for q in all_quotes if q.status == QuoteStatus.CONFIRMED]
    total = len([q for q in all_quotes if q.status in (QuoteStatus.CONFIRMED, QuoteStatus.REJECTED)])
    win_rate = round((len(confirmed) / total * 100) if total else 0, 1)

    return {
        "pending_approvals": pending_approvals,
        "high_risk_deals": len(high_risk),
        "total_pipeline": round(pipeline_value, 2),
        "forecast_revenue": round(sum(q.total for q in all_quotes if q.status == QuoteStatus.APPROVED), 2),
        "stalled_deals": len(stalled),
        "team_win_rate": win_rate,
    }


def finance_dashboard(session: Session) -> dict:
    invoices = session.exec(select(Invoice)).all()
    pending_fa = len(session.exec(
        select(ApprovalRequest).where(ApprovalRequest.status == ApprovalStatus.PENDING)
    ).all())
    outstanding = sum(i.outstanding_amount for i in invoices)
    overdue = [i for i in invoices if i.status == InvoiceStatus.OVERDUE]
    subs = session.exec(
        select(CustomerSubscription).where(CustomerSubscription.status == SubscriptionStatus.ACTIVE)
    ).all()

    from app.models.invoice import CreditNote
    credit_notes = len(session.exec(select(CreditNote)).all())

    return {
        "pending_approvals": pending_fa,
        "outstanding_invoices": len([i for i in invoices if i.status != InvoiceStatus.PAID]),
        "total_outstanding": round(outstanding, 2),
        "overdue_payments": len(overdue),
        "overdue_amount": round(sum(i.outstanding_amount for i in overdue), 2),
        "active_subscriptions": len(subs),
        "credit_notes": credit_notes,
    }


def operations_dashboard(session: Session) -> dict:
    orders = session.exec(select(Order)).all()
    to_fulfill = [o for o in orders if o.status in (OrderStatus.CONFIRMED, OrderStatus.PROCESSING)]
    ready_to_ship = [o for o in orders if o.status == OrderStatus.PACKED]
    from app.models.order import Backorder
    backorders = len(session.exec(select(Backorder).where(Backorder.is_resolved == False)).all())
    from app.models.warehouse import StockInventory
    low_stock = len(session.exec(
        select(StockInventory).where(StockInventory.available_units <= 10)
    ).all())
    delayed = [o for o in orders if o.promised_delivery_date and
               o.promised_delivery_date < date.today() and
               o.status not in (OrderStatus.DELIVERED, OrderStatus.CANCELLED)]
    today_shipments = len(session.exec(
        select(Shipment).where(Shipment.created_at >= datetime.combine(date.today(), datetime.min.time()))
    ).all())

    return {
        "orders_to_fulfill": len(to_fulfill),
        "ready_to_ship": len(ready_to_ship),
        "backorders": backorders,
        "low_stock_alerts": low_stock,
        "delayed_deliveries": len(delayed),
        "shipments_today": today_shipments,
    }


def customer_dashboard(session: Session, customer_id: UUID) -> dict:
    from app.models.quotation import Quotation, QuoteStatus
    quotes = session.exec(select(Quotation).where(Quotation.customer_id == customer_id)).all()
    orders = session.exec(select(Order).where(Order.customer_id == customer_id)).all()
    invoices = session.exec(select(Invoice).where(Invoice.customer_id == customer_id)).all()
    subs = session.exec(
        select(CustomerSubscription).where(CustomerSubscription.customer_id == customer_id)
    ).all()

    return {
        "active_quotations": len([q for q in quotes if q.status not in (QuoteStatus.EXPIRED, QuoteStatus.REJECTED)]),
        "confirmed_orders": len([o for o in orders if o.status == OrderStatus.DELIVERED]),
        "pending_payments": len([i for i in invoices if i.outstanding_amount > 0]),
        "active_subscriptions": len([s for s in subs if s.status == SubscriptionStatus.ACTIVE]),
    }
