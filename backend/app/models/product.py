from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field


class Product(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    category: str  # Hardware, Services, Subscription
    price: float                                    # Base list price per unit
    cost: float                                     # Unit cost (used for margin)
    discount_ceiling: float = Field(default=20.0)   # Max discount % before escalation
    tax_rate: float = Field(default=0.0)            # Tax % applied per line
    unit: str = Field(default="unit")               # Selling unit (unit, license, hour)
    description: Optional[str] = Field(default=None)
    active: bool = Field(default=True)              # Inactive products cannot be quoted
