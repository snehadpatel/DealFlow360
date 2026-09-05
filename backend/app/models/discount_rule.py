"""Discount rule and upsell rule models."""
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field


class DiscountRule(SQLModel, table=True):
    """Defines maximum allowed discount % per customer tier and/or product category.
    Approval thresholds define when manager / finance approval is required."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tier: Optional[str] = Field(default=None)            # BRONZE/SILVER/GOLD or None=all
    category: Optional[str] = Field(default=None)        # Product category or None=all
    max_discount: float = Field(default=20.0)            # Max discount without any approval
    min_margin: float = Field(default=12.0)              # Min allowed margin %
    manager_approval_threshold: float = Field(default=15.0)   # Discount % requiring manager
    finance_approval_threshold: float = Field(default=20.0)   # Discount % requiring finance
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UpsellRule(SQLModel, table=True):
    """AI / rule-based product pairing for upsell and cross-sell recommendations."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    product_id: UUID = Field(foreign_key="product.id", index=True)          # The primary product
    recommended_product_id: UUID = Field(foreign_key="product.id")          # What to suggest
    promotion: Optional[str] = Field(default=None)      # Promotional message
    priority: int = Field(default=1)                     # Lower = shown first
    min_margin_impact: float = Field(default=0.0)        # Margin % gain from adding this
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
