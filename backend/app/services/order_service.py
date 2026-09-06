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

    # Generate the downstream Invoice so the full Quote -> Order -> Invoice chain
    # shows up in the Invoices screen and Customer Portal. Best-effort: an invoice
    # failure must not roll back an already-committed order.
    try:
        from app.services import invoice_service
        from app.models.invoice import Invoice, InvoiceStatus
        existing_invoice = session.exec(select(Invoice).where(Invoice.order_id == order.id)).first()
        if not existing_invoice:
            invoice_service.create_invoice(
                session,
                customer_id=order.customer_id,
                amount=order.total_amount,
                order_id=order.id,
                status=InvoiceStatus.SENT,
            )
    except Exception as e:
        print(f"Invoice auto-generation notice for order {order.id}: {e}")

    # Generate downstream CustomerSubscriptions if any products in the quote are Subscriptions/SaaS
    try:
        from app.services import subscription_service
        from app.models.product import Product
        from app.models.subscription import SubscriptionPlan, CustomerSubscription
        for ql in lines:
            prod = session.get(Product, ql.product_id)
            if prod and (prod.category or "").lower() in ("subscription", "saas"):
                plans = session.exec(select(SubscriptionPlan).where(SubscriptionPlan.is_active == True)).all()
                plan = next((p for p in plans if p.name.lower() in prod.name.lower() or prod.name.lower() in p.name.lower()), None)
                if not plan and plans:
                    plan = plans[0]
                if plan:
                    existing_sub = session.exec(
                        select(CustomerSubscription).where(
                            CustomerSubscription.order_id == order.id,
                            CustomerSubscription.plan_id == plan.id,
                        )
                    ).first()
                    if not existing_sub:
                        subscription_service.subscribe_customer(
                            session,
                            customer_id=order.customer_id,
                            plan_id=plan.id,
                            quantity=ql.quantity,
                            order_id=order.id,
                        )
    except Exception as e:
        print(f"Subscription auto-generation notice for order {order.id}: {e}")

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
    """Resolve a backorder by re-running allocation against current stock.

    When a restock has arrived, the backordered quantity is re-planned by the
    allocation_engine and the newly-available units are reserved (consolidated
    onto the fewest warehouses). Only if the shortfall is now fully coverable is
    the backorder marked resolved; a partial restock leaves it open with the
    remaining shortfall updated.
    """
    from app.services import allocation_engine
    b = session.get(Backorder, backorder_id)
    if not b:
        raise HTTPException(status_code=404, detail="Backorder not found")

    stocks = _load_warehouse_stocks(session, b.product_id)
    plan = allocation_engine.plan_allocation(stocks, b.backorder_qty)

    # Reserve whatever is now available toward the shortfall.
    for alloc in plan.allocations:
        stock = session.exec(
            select(StockInventory)
            .where(StockInventory.warehouse_id == alloc.warehouse_id)
            .where(StockInventory.product_id == b.product_id)
        ).first()
        if stock:
            stock.reserved_units += alloc.allocated_qty
            session.add(stock)

    b.available_qty += plan.allocated_qty
    b.backorder_qty = plan.backorder_qty
    if plan.backorder_qty == 0:
        b.is_resolved = True

    session.add(b)
    session.commit()
    session.refresh(b)
    return b


def _load_warehouse_stocks(session: Session, product_id: UUID):
    """Load the active warehouses' stock position for a product as engine inputs."""
    from app.services.allocation_engine import WarehouseStock
    rows = session.exec(
        select(StockInventory, Warehouse)
        .join(Warehouse, StockInventory.warehouse_id == Warehouse.id)
        .where(StockInventory.product_id == product_id)
        .where(Warehouse.is_active == True)
        .order_by(Warehouse.priority)
    ).all()
    return [
        WarehouseStock(
            warehouse_id=warehouse.id,
            warehouse_name=warehouse.name,
            available_units=stock.available_units,
            reserved_units=stock.reserved_units,
            shipping_cost=warehouse.shipping_cost,
            priority=warehouse.priority,
        )
        for stock, warehouse in rows
    ]


def recommend_warehouse_split(session: Session, product_id: UUID, required_qty: int) -> dict:
    """Recommend how to split an order across warehouses (dry-run, no persistence).

    Delegates the real decision to the deterministic allocation_engine: prefers
    a single-warehouse consolidation, otherwise a priority-ranked split, and
    reports any backorder shortfall. Returns the full engine plan so the UI can
    show *why* an order was split or backordered.
    """
    from app.services import allocation_engine
    stocks = _load_warehouse_stocks(session, product_id)
    plan = allocation_engine.plan_allocation(stocks, required_qty)
    return {
        "product_id": str(product_id),
        "required_qty": plan.required_qty,
        "total_available": plan.total_available,
        "allocated_qty": plan.allocated_qty,
        "backorder_qty": plan.backorder_qty,
        "is_split": plan.is_split,
        "is_backordered": plan.is_backordered,
        "consolidated": plan.consolidated,
        "total_shipping_cost": plan.total_shipping_cost,
        "allocations": [
            {
                "warehouse_id": str(a.warehouse_id),
                "warehouse_name": a.warehouse_name,
                "allocated_qty": a.allocated_qty,
                "shipping_cost": a.shipping_cost,
            }
            for a in plan.allocations
        ],
        "notes": plan.notes,
    }


def allocate_order(session: Session, order_id: UUID) -> dict:
    """Really allocate an order's lines across warehouses and persist the result.

    For each line the allocation_engine decides the split; we then:
      * reserve the allocated units in each contributing warehouse's stock,
      * stamp the first (or sole) warehouse on the OrderLine,
      * create a real Backorder row for any shortfall, and
      * advance the order to PROCESSING.

    This is the operations counterpart to the dry-run recommend_warehouse_split:
    it mutates stock and creates the backorders the fulfillment screen lists.
    """
    from app.services import allocation_engine
    order = get_order_or_404(session, order_id)
    lines = session.exec(select(OrderLine).where(OrderLine.order_id == order_id)).all()

    line_results = []
    any_backorder = False
    for line in lines:
        stocks = _load_warehouse_stocks(session, line.product_id)
        plan = allocation_engine.plan_allocation(stocks, line.quantity)

        # Reserve the allocated units against each contributing warehouse.
        for alloc in plan.allocations:
            stock = session.exec(
                select(StockInventory)
                .where(StockInventory.warehouse_id == alloc.warehouse_id)
                .where(StockInventory.product_id == line.product_id)
            ).first()
            if stock:
                stock.reserved_units += alloc.allocated_qty
                session.add(stock)

        # Stamp the primary (highest-priority) warehouse on the line.
        if plan.allocations:
            line.warehouse_id = plan.allocations[0].warehouse_id
            session.add(line)

        # Persist a real backorder for any shortfall.
        if plan.is_backordered:
            any_backorder = True
            session.add(Backorder(
                order_id=order_id,
                product_id=line.product_id,
                required_qty=plan.required_qty,
                available_qty=plan.allocated_qty,
                backorder_qty=plan.backorder_qty,
            ))

        line_results.append({
            "product_id": str(line.product_id),
            "required_qty": plan.required_qty,
            "allocated_qty": plan.allocated_qty,
            "backorder_qty": plan.backorder_qty,
            "is_split": plan.is_split,
            "consolidated": plan.consolidated,
            "allocations": [
                {"warehouse_id": str(a.warehouse_id), "warehouse_name": a.warehouse_name,
                 "allocated_qty": a.allocated_qty, "shipping_cost": a.shipping_cost}
                for a in plan.allocations
            ],
            "notes": plan.notes,
        })

    order.status = OrderStatus.PROCESSING
    order.updated_at = datetime.utcnow()
    session.add(order)
    session.commit()
    session.refresh(order)

    return {
        "order_id": str(order_id),
        "status": order.status.value if hasattr(order.status, "value") else str(order.status),
        "has_backorder": any_backorder,
        "lines": line_results,
    }
