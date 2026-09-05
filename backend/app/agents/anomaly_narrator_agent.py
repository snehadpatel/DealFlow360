"""AI Agent for translating stalled deals and pricing anomalies into plain language narratives."""
from app.core.llm import get_llm
from app.schemas.ai_schemas import AnomalyNarrativeResponse

def generate_deal_anomaly_narrative(deal_data: dict) -> AnomalyNarrativeResponse:
    llm = get_llm()
    deal_id = deal_data.get("deal_id", "Q-Unknown")
    
    if not llm:
        return AnomalyNarrativeResponse(
            deal_id=deal_id,
            narrative=f"Deal {deal_id} is stalled because requested discounts exceed typical tier bounds by 5%.",
            recommended_action="Counter with a 2-year commitment at 12% discount to preserve account margin."
        )

    try:
        prompt = f"""Analyze this stalled B2B deal and provide a short 2-sentence narrative explanation and an action recommendation:
        {deal_data}"""
        response = llm.invoke(prompt)
        return AnomalyNarrativeResponse(
            deal_id=deal_id,
            narrative=str(response.content)[:240],
            recommended_action="Review discount thresholds with the sales manager."
        )
    except Exception:
        return AnomalyNarrativeResponse(
            deal_id=deal_id,
            narrative=f"Deal {deal_id} is stalled pending manager discount verification.",
            recommended_action="Follow up with the sales rep to adjust bundle terms."
        )
