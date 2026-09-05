from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


# --- Requests --------------------------------------------------------------

class LineItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(gt=0)
    discount_percent: float = Field(default=0.0, ge=0.0, le=100.0)


class QuoteCreate(BaseModel):
    customer_id: UUID
    items: List[LineItemCreate]
    notes: Optional[str] = None
    expires_in_days: int = Field(default=15, gt=0)
    # Optional idempotency key; a repeat with the same key returns the same quote.
    idempotency_key: Optional[str] = None


class QuoteUpdate(BaseModel):
    items: Optional[List[LineItemCreate]] = None
    notes: Optional[str] = None
    reason: Optional[str] = None
    # Flag an edit as a customer negotiation (affects how it is audited).
    negotiation: bool = False


class RenewRequest(BaseModel):
    expires_in_days: int = Field(default=15, gt=0)


class ActionRequest(BaseModel):
    """Generic approver/reason payload (reason optional for approve/confirm)."""
    reason: Optional[str] = None


class ReasonRequest(BaseModel):
    """Reason is mandatory for reject / return-for-revision."""
    reason: str = Field(min_length=1)


# --- Responses -------------------------------------------------------------

class QuoteLineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    product_id: UUID
    quantity: int
    unit_price: float
    unit_cost: float
    discount_percent: float
    tax_rate: float
    line_subtotal: float
    discount_amount: float
    tax_amount: float
    line_total: float


class ApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    quotation_id: UUID
    approver_role: str
    approval_level: int
    status: str
    quote_version: int
    approver_id: Optional[UUID] = None
    reason: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None


class QuoteResponse(BaseModel):
    """Summary view used in listings."""
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    customer_id: UUID
    rep_id: UUID
    status: str
    subtotal: float
    discount_total: float
    tax_total: float
    total: float
    margin: float
    margin_percent: float
    blended_risk: Optional[float] = None
    risk_level: Optional[str] = None
    version: int
    currency: str
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class QuoteDetailResponse(QuoteResponse):
    """Full view including line items and the current approval chain."""
    notes: Optional[str] = None
    lines: List[QuoteLineResponse] = []
    approvals: List[ApprovalResponse] = []


class QuoteVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    version: int
    status: str
    subtotal: float
    discount_total: float
    tax_total: float
    total: float
    margin: float
    blended_risk: Optional[float] = None
    risk_level: Optional[str] = None
    reason: Optional[str] = None
    created_by: Optional[UUID] = None
    created_at: datetime


class AuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    quotation_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    action: str
    reason: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    timestamp: datetime
