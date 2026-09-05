"""Price list models — customer-tier based pricing overrides."""
from typing import Optional
from datetime import datetime, date
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field


class PriceList(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str                                            # e.g. "Gold Customer 2026"
    tier: Optional[str] = Field(default=None)           # BRONZE / SILVER / GOLD / None=all
    currency: str = Field(default="INR")
    effective_from: Optional[date] = Field(default=None)
    expires_at: Optional[date] = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PriceListItem(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    price_list_id: UUID = Field(foreign_key="pricelist.id", index=True)
    product_id: UUID = Field(foreign_key="product.id", index=True)
    price: float                                         # Override price for this product
