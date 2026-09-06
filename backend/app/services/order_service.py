"""Order service — create orders from confirmed quotes, manage fulfillment lifecycle."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.order import Order, OrderLine, Shipment, Backorder, OrderStatus, ShipmentStatus
from app.models.quotation import Quotation, QuotationLine, QuoteStatus
from app.models.warehouse import StockInventory, Warehouse
from app.models.notification import Notification


def create_order_from_quote(session: Session, quotation: Quotation) -> Order:
    """Create an Order from a CONFIRMED quotation."""
    if quotation.status != QuoteStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Only confirmed quotes can become orders")
    # Check for existing order
    existing = session.exec(select(Order).where(Order.quotation_id == quotation.id)).first()
    if existing:
        return existing

    order = Order(
        quotation_id=quotation.id,
        customer_id=quotation.customer_id,
        rep_id=quotation.rep_id,
        total_amount=quotation.total,
        promised_delivery_date=date.today() + timedelta(days=7),
    )
    session.add(order)
    session.flush()

    # Copy lines from quotation
    lines = session.exec(select(QuotationLine).where(QuotationLine.quotation_id == quotation.id)).all()
    for ql in lines:
        ol = OrderLine(
            order_id=order.id,
            product_id=ql.product_id,
            quantity=ql.quantity,
            unit_price=ql.unit_price,
            line_total=ql.line_total,
        )
        session.add(ol)

    session.commit()
    session.refresh(order)

    # Automatically generate an Invoice for this confirmed Order
    try:
        from app.models.invoice import Invoice
        from app.services import invoice_service
        existing_inv = session.exec(select(Invoice).where(Invoice.order_id == order.id)).first()
        if not existing_inv:
            invoice_service.create_invoice(
                session,
                customer_id=quotation.customer_id,
                amount=quotation.total,
                order_id=order.id,
                currency=quotation.currency or "INR",
                notes=f"Generated from confirmed Quotation {quotation.id}",
            )
    except Exception as inv_err:
        print(f"Notice: Invoice auto-creation for order {order.id}: {inv_err}")

    return order


def list_orders(session: Session, customer_id: Optional[UUID] = None, rep_id: Optional[UUID] = None) -> List[Order]:
    stmt = select(Order).order_by(Order.created_at.desc())
    if customer_id:
        stmt = stmt.where(Order.customer_id == customer_id)
    if rep_id:
        stmt = stmt.where(Order.rep_id == rep_id)
    return session.exec(stmt).all()


def get_order_or_404(session: Session, order_id: UUID) -> Order:
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def update_order_status(session: Session, order_id: UUID, new_status: str, notes: Optional[str] = None) -> Order:
    order = get_order_or_404(session, order_id)
    order.status = OrderStatus(new_status)
    order.updated_at = datetime.utcnow()
    if notes:
        order.notes = notes
    if new_status == OrderStatus.DELIVERED:
        order.actual_delivery_date = date.today()
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


def get_order_lines(session: Session, order_id: UUID) -> List[OrderLine]:
    return session.exec(select(OrderLine).where(OrderLine.order_id == order_id)).all()


def create_shipment(session: Session, **kwargs) -> Shipment:
    shipment = Shipment(**kwargs)
    session.add(shipment)
    session.commit()
    session.refresh(shipment)
    return shipment


def list_shipments(session: Session, order_id: Optional[UUID] = None) -> List[Shipment]:
    stmt = select(Shipment).order_by(Shipment.created_at.desc())
    if order_id:
        stmt = stmt.where(Shipment.order_id == order_id)
    return session.exec(stmt).all()


def get_shipment_or_404(session: Session, shipment_id: UUID) -> Shipment:
    s = session.get(Shipment, shipment_id)
    if not s:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return s


def update_shipment_status(session: Session, shipment_id: UUID, new_status: str) -> Shipment:
    s = get_shipment_or_404(session, shipment_id)
    s.status = ShipmentStatus(new_status)
    if new_status == ShipmentStatus.DELIVERED:
        s.actual_delivery = date.today()
    session.add(s)
    session.commit()
    session.refresh(s)
    return s


def list_backorders(session: Session, resolved: bool = False) -> List[Backorder]:
    stmt = select(Backorder).where(Backorder.is_resolved == resolved).order_by(Backorder.created_at.desc())
    return session.exec(stmt).all()


def create_backorder(session: Session, **kwargs) -> Backorder:
    b = Backorder(**kwargs)
    session.add(b)
    session.commit()
    session.refresh(b)
    return b


def resolve_backorder(session: Session, backorder_id: UUID) -> Backorder:
    b = session.get(Backorder, backorder_id)
    if not b:
        raise HTTPException(status_code=404, detail="Backorder not found")
    b.is_resolved = True
    session.add(b)
    session.commit()
    session.refresh(b)
    return b


def recommend_warehouse_split(session: Session, product_id: UUID, required_qty: int) -> list:
    """Recommend how to split an order across warehouses based on stock."""
    stocks = session.exec(
        select(StockInventory, Warehouse)
        .join(Warehouse, StockInventory.warehouse_id == Warehouse.id)
        .where(StockInventory.product_id == product_id)
        .where(Warehouse.is_active == True)
        .order_by(Warehouse.priority)
    ).all()

    recommendations = []
    remaining = required_qty
    for stock, warehouse in stocks:
        if remaining <= 0:
            break
        allocate = min(stock.available_units - stock.reserved_units, remaining)
        if allocate > 0:
            recommendations.append({
                "warehouse_id": str(warehouse.id),
                "warehouse_name": warehouse.name,
                "allocated_qty": allocate,
                "shipping_cost": warehouse.shipping_cost,
            })
            remaining -= allocate

    return recommendations
