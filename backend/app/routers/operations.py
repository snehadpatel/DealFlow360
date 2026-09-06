"""Orders, Shipments, Backorders, and Inventory routers."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.schemas.order_schemas import (
    OrderResponse, OrderStatusUpdate, ShipmentCreate, ShipmentResponse,
    BackorderResponse, WarehouseSplitRecommendation
)
from app.schemas.admin_schemas import StockResponse, StockUpdateRequest
from app.services import order_service, admin_service

# ─── Orders ──────────────────────────────────────────────────────────────────
orders_router = APIRouter(prefix="/orders", tags=["orders"])

@orders_router.get("", response_model=List[OrderResponse])
def list_orders(
    customer_id: Optional[UUID] = Query(default=None),
    rep_id: Optional[UUID] = Query(default=None),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    filter_customer = user.customer_id if user.role == Role.CUSTOMER else customer_id
    filter_rep = user.id if user.role == Role.REP else rep_id
    return order_service.list_orders(session, customer_id=filter_customer, rep_id=filter_rep)

@orders_router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: UUID, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return order_service.get_order_or_404(session, order_id)

@orders_router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: UUID,
    payload: OrderStatusUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.OPERATIONS, Role.ADMIN]))
):
    return order_service.update_order_status(session, order_id, payload.status, payload.notes)

@orders_router.get("/{order_id}/lines")
def get_order_lines(order_id: UUID, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return order_service.get_order_lines(session, order_id)

@orders_router.get("/{order_id}/warehouse-split")
def recommend_split(
    order_id: UUID,
    product_id: UUID = Query(...),
    required_qty: int = Query(...),
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.OPERATIONS, Role.ADMIN]))
):
    return order_service.recommend_warehouse_split(session, product_id, required_qty)

@orders_router.post("/{order_id}/allocate")
def allocate_order(
    order_id: UUID,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.OPERATIONS, Role.ADMIN]))
):
    """Really allocate the order across warehouses: reserve stock, split where
    needed, raise backorders for shortfalls, and move the order to PROCESSING."""
    return order_service.allocate_order(session, order_id)


# ─── Shipments ────────────────────────────────────────────────────────────────
shipments_router = APIRouter(prefix="/shipments", tags=["shipments"])

@shipments_router.get("", response_model=List[ShipmentResponse])
def list_shipments(
    order_id: Optional[UUID] = Query(default=None),
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user)
):
    return order_service.list_shipments(session, order_id)

@shipments_router.post("", response_model=ShipmentResponse, status_code=201)
def create_shipment(
    payload: ShipmentCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.OPERATIONS, Role.ADMIN]))
):
    return order_service.create_shipment(session, **payload.model_dump())

@shipments_router.put("/{shipment_id}/status", response_model=ShipmentResponse)
def update_shipment_status(
    shipment_id: UUID,
    status: str = Query(...),
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.OPERATIONS, Role.ADMIN]))
):
    return order_service.update_shipment_status(session, shipment_id, status)


# ─── Backorders ───────────────────────────────────────────────────────────────
backorders_router = APIRouter(prefix="/backorders", tags=["backorders"])

@backorders_router.get("", response_model=List[BackorderResponse])
def list_backorders(
    resolved: bool = Query(default=False),
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.OPERATIONS, Role.ADMIN]))
):
    return order_service.list_backorders(session, resolved)

@backorders_router.post("/{backorder_id}/resolve", response_model=BackorderResponse)
def resolve_backorder(
    backorder_id: UUID,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.OPERATIONS, Role.ADMIN]))
):
    return order_service.resolve_backorder(session, backorder_id)


# ─── Inventory ────────────────────────────────────────────────────────────────
inventory_router = APIRouter(prefix="/inventory", tags=["inventory"])

@inventory_router.get("", response_model=List[StockResponse])
def list_inventory(
    warehouse_id: Optional[UUID] = Query(default=None),
    product_id: Optional[UUID] = Query(default=None),
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user)
):
    return admin_service.list_stock(session, warehouse_id=warehouse_id, product_id=product_id)

@inventory_router.put("/{warehouse_id}/{product_id}", response_model=StockResponse)
def update_inventory(
    warehouse_id: UUID,
    product_id: UUID,
    payload: StockUpdateRequest,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.OPERATIONS, Role.ADMIN]))
):
    return admin_service.upsert_stock(session, warehouse_id, product_id, **payload.model_dump(exclude_none=True))
