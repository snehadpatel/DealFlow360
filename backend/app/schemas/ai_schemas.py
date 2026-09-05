from typing import List, Optional
from pydantic import BaseModel

class UpsellItem(BaseModel):
    product_name: str
    reasoning: str
    suggested_price: float
    margin_impact: str

class UpsellResponse(BaseModel):
    recommendations: List[UpsellItem]

class AnomalyNarrativeResponse(BaseModel):
    deal_id: str
    narrative: str
    recommended_action: str
