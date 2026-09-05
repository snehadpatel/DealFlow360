"""Offline test of the agent layer: schema construction + deterministic fallback
(no GEMINI key => run_structured returns None => templates fire). No DB needed."""
import sys, os
os.environ["GEMINI_API_KEY"] = ""  # force fallback path
BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

from app.services.market_basket import Recommendation
from app.services.anomaly import detect_discount_anomaly, detect_stalled
from app.services.pricing_policy import LineInput, evaluate_counter
from app.agents.upsell_agent import generate_upsell
from app.agents.anomaly_narrator_agent import generate_anomaly_narrative
from app.agents.negotiation_agent import generate_negotiation_reply
from app.agents.llm_runtime import llm_available
from datetime import datetime, timedelta

FAILS=[]
def check(n,c,got=None):
    print(("PASS" if c else "FAIL"), n, "" if c else f"(got {got})");
    if not c: FAILS.append(n)

print("llm_available() =", llm_available(), "(expect False offline)\n")

print("=== upsell agent (fallback) ===")
meta = {"p_support":{"name":"24/7 Support Pack","price":1500.0,"cost":300.0},
        "p_router":{"name":"Edge Router X1","price":1200.0,"cost":650.0}}
rec = Recommendation(product_id="p_support", anchor_product_id="p_router",
                     confidence=0.84, lift=1.62, support=0.34, margin_pct=0.80,
                     rank_score=73.66, promotion_flag=True)
resp = generate_upsell([rec], meta, transactions_analyzed=120, rules_mined=14, narrate=True)
it = resp.recommendations[0]
print("  pitch:", it.pitch)
print("  tag:", it.promotion_tag, "| margin_impact:", it.margin_impact, "| price:", it.suggested_price)
check("upsell product_name set", it.product_name=="24/7 Support Pack", it.product_name)
check("upsell numbers preserved", it.confidence==0.84 and it.lift==1.62 and it.margin_pct==0.80)
check("upsell suggested_price from meta", it.suggested_price==1500.0, it.suggested_price)
check("upsell basis transactions", resp.basis.transactions_analyzed==120)
check("upsell basis llm_used False offline", resp.basis.llm_used is False)
check("pitch mentions anchor", "Edge Router X1" in it.pitch, it.pitch)

print("\n=== anomaly narrator (fallback) ===")
baseline=[9,8,10,9,11,7,9,10,8,9,10,9,8,11,9,10]
anom = detect_discount_anomaly(32.0, baseline)
stall = detect_stalled(datetime.utcnow()-timedelta(days=15), "PENDING_APPROVAL")
ar = generate_anomaly_narrative("Q-abcd1234", "Edge Router X1", anomaly=anom, stall=stall, narrate=True)
print("  narrative:", ar.narrative)
print("  action:", ar.recommended_action)
check("anomaly flagged", ar.is_anomaly is True)
check("stats attached", ar.stats is not None and ar.stats.n==16, ar.stats)
check("stalled days", ar.days_stale==15, ar.days_stale)
check("narrative cites 32", "32" in ar.narrative, ar.narrative)
check("llm_used False offline", ar.llm_used is False)

print("\n=== negotiation copilot (fallback) ===")
router_line = LineInput(list_price=1200.0, cost=650.0, category_ceiling=15.0)
dec = evaluate_counter(28.0, router_line, "GOLD")
nr = generate_negotiation_reply(dec, "Edge Router X1", customer_note="Competitor offered 25% off.", customer_tier="GOLD")
print("  decision:", nr.decision, "| recommended:", nr.recommended_counter_discount, "| chain:", nr.approval_chain)
print("  reply:", nr.reply_draft)
print("  nudge:", nr.internal_nudge)
check("decision ESCALATE", nr.decision=="ESCALATE", nr.decision)
check("recommended <= ceiling", nr.recommended_counter_discount<=nr.allowed_ceiling)
check("reply mentions recommended pct", f"{nr.recommended_counter_discount:.1f}" in nr.reply_draft, nr.reply_draft)
check("llm_used False offline", nr.llm_used is False)

print("\n"+("ALL AGENT CHECKS PASSED" if not FAILS else f"{len(FAILS)} FAILURES: {FAILS}"))
sys.exit(1 if FAILS else 0)
