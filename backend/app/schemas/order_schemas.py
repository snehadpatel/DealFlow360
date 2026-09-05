"""Schemas for Orders, Shipments, Backorders."""
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel


class OrderLineCreate(BaseModel):
    product_id: UUID
    warehouse_id: Optional[UUID] = None
    quantity: int
    unit_price: float

class OrderLineResponse(BaseModel):
    id: UUID
    product_id: UUID
    warehouse_id: Optional[UUID]
    quantity: int
    unit_price: float
    line_total: float
    class Config: from_attributes = True

class OrderResponse(BaseModel):
    id: UUID
    quotation_id: UUID
    customer_id: UUID
    rep_id: UUID
    status: str
    payment_status: str
    total_amount: float
    delivery_address: Optional[str]
    promised_delivery_date: Optional[date]
    actual_delivery_date: Optional[date]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config: from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class ShipmentCreate(BaseModel):
    order_id: UUID
    warehouse_id: UUID
    courier: Optional[str] = None
    tracking_number: Optional[str] = None
    shipping_cost: float = 0.0
    estimated_delivery: Optional[date] = None

class ShipmentResponse(BaseModel):
    id: UUID
    order_id: UUID
    warehouse_id: UUID
    courier: Optional[str]
    tracking_number: Optional[str]
    shipping_cost: float
    estimated_delivery: Optional[date]
    actual_delivery: Optional[date]
    status: str
    created_at: datetime
    class Config: from_attributes = True

class BackorderResponse(BaseModel):
    id: UUID
    order_id: UUID
    product_id: UUID
    required_qty: int
    available_qty: int
    backorder_qty: int
    expected_restock_date: Optional[date]
    is_resolved: bool
    created_at: datetime
    class Config: from_attributes = True

class WarehouseSplitRecommendation(BaseModel):
    warehouse_id: UUID
    warehouse_name: str
    allocated_qty: int
    shipping_cost: float
