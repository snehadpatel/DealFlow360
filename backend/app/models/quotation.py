from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text


class QuoteStatus(str, Enum):
    DRAFT = "DRAFT"                        # Being built / edited by the rep
    PENDING_APPROVAL = "PENDING_APPROVAL"  # Waiting on one or more approvers
    APPROVED = "APPROVED"                  # Fully approved, ready to confirm
    REJECTED = "REJECTED"                  # Rejected by an approver
    CONFIRMED = "CONFIRMED"                # Accepted by customer / closed-won
    EXPIRED = "EXPIRED"                    # Validity window elapsed before confirmation


class RiskLevel(str, Enum):
    LOW = "LOW"        # blended score 0-30
    MEDIUM = "MEDIUM"  # blended score 31-60
    HIGH = "HIGH"      # blended score 61-100


class Quotation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    customer_id: UUID = Field(foreign_key="customer.id")
    rep_id: UUID = Field(foreign_key="user.id")
    status: QuoteStatus = Field(default=QuoteStatus.DRAFT)

    # --- Financial breakdown (all derived by quote_service.recalculate) ---
    subtotal: float = Field(default=0.0)        # Sum of gross line amounts (pre-discount)
    discount_total: float = Field(default=0.0)  # Sum of discount amounts
    tax_total: float = Field(default=0.0)       # Sum of per-line tax
    total: float = Field(default=0.0)           # Final payable amount
    margin: float = Field(default=0.0)          # Net revenue minus cost (currency)
    margin_percent: float = Field(default=0.0)  # Margin as % of net revenue
    currency: str = Field(default="USD")

    # --- Risk (populated by risk_engine) ---
    blended_risk: Optional[float] = Field(default=None)  # 0-100 blended score
    risk_level: Optional[str] = Field(default=None)      # LOW / MEDIUM / HIGH

    # --- Versioning & lifecycle ---
    version: int = Field(default=1)             # Bumped on each material re-issue
    expires_at: Optional[datetime] = Field(default=None)  # Validity deadline
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    # --- Idempotency: repeated submits with the same key return the same quote ---
    idempotency_key: Optional[str] = Field(default=None, unique=True, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class QuotationLine(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id", index=True)
    product_id: UUID = Field(foreign_key="product.id")
    quantity: int = Field(default=1)
    unit_price: float                            # Price per unit at time of quoting
    unit_cost: float = Field(default=0.0)        # Cost per unit (snapshot, for margin)
    discount_percent: float = Field(default=0.0)
    tax_rate: float = Field(default=0.0)         # Tax % snapshot from product
    line_subtotal: float = Field(default=0.0)    # unit_price * quantity (pre-discount)
    discount_amount: float = Field(default=0.0)  # line_subtotal * discount_percent/100
    tax_amount: float = Field(default=0.0)       # net * tax_rate/100
    line_total: float                            # net + tax (final line amount)


class QuotationVersion(SQLModel, table=True):
    """Immutable historical snapshot of a quotation. A new row is written every
    time a material change re-issues the quote (e.g. a customer negotiation),
    so an approved version is never silently overwritten."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id", index=True)
    version: int
    status: str
    subtotal: float = Field(default=0.0)
    discount_total: float = Field(default=0.0)
    tax_total: float = Field(default=0.0)
    total: float = Field(default=0.0)
    margin: float = Field(default=0.0)
    blended_risk: Optional[float] = Field(default=None)
    risk_level: Optional[str] = Field(default=None)
    snapshot: str = Field(sa_column=Column(Text))  # JSON snapshot of quote + lines
    reason: Optional[str] = Field(default=None)    # Why this version was created
    created_by: Optional[UUID] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
