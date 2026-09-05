from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field

class QuoteStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CONFIRMED = "CONFIRMED"

class Quotation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    customer_id: UUID = Field(foreign_key="customer.id")
    rep_id: UUID = Field(foreign_key="user.id")
    status: QuoteStatus = Field(default=QuoteStatus.DRAFT)
    blended_risk: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class QuotationLine(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id")
    product_id: UUID = Field(foreign_key="product.id")
    quantity: int = Field(default=1)
    unit_price: float
    discount_percent: float = Field(default=0.0)
    line_total: float
