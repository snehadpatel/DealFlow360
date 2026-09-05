from fastapi import APIRouter
from app.schemas.ai_schemas import UpsellResponse, AnomalyNarrativeResponse
from app.agents.upsell_agent import generate_upsell_suggestions
from app.agents.anomaly_narrator_agent import generate_deal_anomaly_narrative

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/upsell", response_model=UpsellResponse)
def upsell_endpoint(payload: dict):
    return generate_upsell_suggestions(payload)

@router.post("/anomaly-narrative", response_model=AnomalyNarrativeResponse)
def anomaly_narrative_endpoint(payload: dict):
    return generate_deal_anomaly_narrative(payload)
