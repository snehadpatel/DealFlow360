from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text


class Product(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    sku: Optional[str] = Field(default=None, index=True)
    category: str                                        # Hardware, Services, Subscription
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    price: float                                         # Base list price per unit
    cost: float                                          # Unit cost (for margin)
    discount_ceiling: float = Field(default=20.0)        # Max discount % before escalation
    tax_rate: float = Field(default=0.0)                 # Tax % applied per line
    unit: str = Field(default="unit")                    # unit, license, hour
    variants: Optional[str] = Field(default=None, sa_column=Column(Text))  # JSON
    image_url: Optional[str] = Field(default=None)
    active: bool = Field(default=True)
    is_archived: bool = Field(default=False)
