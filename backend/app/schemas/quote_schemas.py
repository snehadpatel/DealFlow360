from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel

class LineItemCreate(BaseModel):
    product_id: UUID
    quantity: int
    discount_percent: float

class QuoteCreate(BaseModel):
    customer_id: UUID
    items: List[LineItemCreate]

class QuoteResponse(BaseModel):
    id: UUID
    customer_id: UUID
    rep_id: UUID
    status: str
    blended_risk: Optional[float]
