from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field


class Warehouse(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    location: str                                        # Full address
    city: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    replenishment_threshold: int = Field(default=10)     # Min units before alert
    shipping_cost: float = Field(default=0.0)            # Per-shipment base cost
    priority: int = Field(default=1)                     # Lower = higher priority


class StockInventory(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    warehouse_id: UUID = Field(foreign_key="warehouse.id", index=True)
    product_id: UUID = Field(foreign_key="product.id", index=True)
    available_units: int = Field(default=0)
    reserved_units: int = Field(default=0)               # Allocated to pending orders
    incoming_units: int = Field(default=0)               # Expected from supplier
    reorder_level: int = Field(default=20)               # Trigger reorder below this
