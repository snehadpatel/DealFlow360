"""Schemas for Negotiation and NegotiationMessage."""
from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class NegotiationCreate(BaseModel):
    quotation_id: UUID
    customer_id: UUID
    rep_id: UUID
    requested_discount: Optional[float] = None

class NegotiationMessageCreate(BaseModel):
    message: str
    discount_proposed: Optional[float] = None

class NegotiationResponse(BaseModel):
    id: UUID
    quotation_id: UUID
    customer_id: UUID
    rep_id: UUID
    status: str
    requested_discount: Optional[float]
    counter_discount: Optional[float]
    final_discount: Optional[float]
    created_at: datetime
    updated_at: datetime
    class Config: from_attributes = True

class NegotiationMessageResponse(BaseModel):
    id: UUID
    negotiation_id: UUID
    sender_id: UUID
    sender_role: str
    message: str
    discount_proposed: Optional[float]
    created_at: datetime
    class Config: from_attributes = True

class NegotiationActionRequest(BaseModel):
    discount: Optional[float] = None
    reason: Optional[str] = None
