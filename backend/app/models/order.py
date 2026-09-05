"""Order fulfillment models: Order, OrderLine, Shipment, Backorder."""
from typing import Optional
from datetime import datetime, date
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text


class OrderStatus(str, Enum):
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    PICKING = "PICKING"
    PACKED = "PACKED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    PAID = "PAID"
    OVERDUE = "OVERDUE"


class ShipmentStatus(str, Enum):
    CREATED = "CREATED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"


class Order(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id", index=True)
    customer_id: UUID = Field(foreign_key="customer.id", index=True)
    rep_id: UUID = Field(foreign_key="user.id")
    status: OrderStatus = Field(default=OrderStatus.CONFIRMED)
    payment_status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    total_amount: float = Field(default=0.0)
    delivery_address: Optional[str] = Field(default=None, sa_column=Column(Text))
    promised_delivery_date: Optional[date] = Field(default=None)
    actual_delivery_date: Optional[date] = Field(default=None)
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class OrderLine(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    order_id: UUID = Field(foreign_key="order.id", index=True)
    product_id: UUID = Field(foreign_key="product.id")
    warehouse_id: Optional[UUID] = Field(default=None, foreign_key="warehouse.id")
    quantity: int = Field(default=1)
    unit_price: float = Field(default=0.0)
    line_total: float = Field(default=0.0)


class Shipment(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    order_id: UUID = Field(foreign_key="order.id", index=True)
    warehouse_id: UUID = Field(foreign_key="warehouse.id")
    courier: Optional[str] = Field(default=None)
    tracking_number: Optional[str] = Field(default=None)
    shipping_cost: float = Field(default=0.0)
    estimated_delivery: Optional[date] = Field(default=None)
    actual_delivery: Optional[date] = Field(default=None)
    status: ShipmentStatus = Field(default=ShipmentStatus.CREATED)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Backorder(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    order_id: UUID = Field(foreign_key="order.id", index=True)
    product_id: UUID = Field(foreign_key="product.id")
    required_qty: int
    available_qty: int
    backorder_qty: int
    expected_restock_date: Optional[date] = Field(default=None)
    is_resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
