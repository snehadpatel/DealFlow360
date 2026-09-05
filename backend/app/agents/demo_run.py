"""CLI test script to verify AI agents directly."""
from app.agents.upsell_agent import generate_upsell_suggestions
from app.agents.anomaly_narrator_agent import generate_deal_anomaly_narrative

if __name__ == "__main__":
    print("--- Testing Upsell Agent ---")
    upsell_res = generate_upsell_suggestions({"customer": "Acme Corp", "items": ["Edge Router"]})
    print("Upsell recommendations:", upsell_res.model_dump())

    print("\n--- Testing Anomaly Narrator Agent ---")
    anomaly_res = generate_deal_anomaly_narrative({"deal_id": "Q-8821", "days_stalled": 4, "discount": 22})
    print("Anomaly narrative:", anomaly_res.model_dump())
