"""Offline verification of the glass-box math — pure stdlib, no server deps.
Mirrors the seed's baked patterns so it validates the data->ML pipeline too.
"""
import sys, os, random, statistics
BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE, "app", "services"))

import pricing_policy as pp
import market_basket as mb
import anomaly as an
import deal_health as dh

FAILS = []
def check(name, cond, got=None):
    print(("PASS" if cond else "FAIL"), name, "" if cond else f"(got {got})")
    if not cond: FAILS.append(name)

print("\n=== 1. pricing_policy: spec worked example ===")
# Spec p.12: Gold customer, a line at 18% discount on a product whose effective
# ceiling is 10% -> 8pp overage. Gold tier max=20, category_ceiling=10 -> stricter=10.
line = pp.LineInput(list_price=1000.0, cost=500.0, category_ceiling=10.0, discount_percent=18.0, qty=1)
risk = pp.blended_risk([line], "GOLD")
check("spec overage == 8.0pp", risk.total_overage_pp == 8.0, risk.total_overage_pp)
check("spec dollar_at_risk == 80.0", risk.dollar_at_risk == 80.0, risk.dollar_at_risk)
check("spec routes to MANAGER only", risk.approval_chain == ["MANAGER"], risk.approval_chain)

# Multi-line: many small overages sum past the finance threshold (sum, not avg).
lines = [pp.LineInput(1000, 500, 10.0, 18.0, 1) for _ in range(3)]  # 8pp each => 24pp
r2 = pp.blended_risk(lines, "GOLD")
check("summed 3x8pp == 24.0", r2.total_overage_pp == 24.0, r2.total_overage_pp)
check("24pp routes MANAGER+FINANCE", r2.approval_chain == ["MANAGER", "FINANCE"], r2.approval_chain)

# Within ceilings -> auto approve.
ok = pp.blended_risk([pp.LineInput(1000, 500, 20.0, 9.0, 1)], "GOLD")
check("within-ceiling auto-approve", ok.approval_chain == [] and ok.requires_approval is False, ok.approval_chain)

print("\n=== 2. pricing_policy: negotiation copilot ===")
# Router list 1200 cost 650 (margin floor = 45.8%). Gold, ceiling 15% (product).
router = pp.LineInput(list_price=1200.0, cost=650.0, category_ceiling=15.0)
d_ok = pp.evaluate_counter(8.0, router, "GOLD")     # within ceiling + margin-safe
d_mid = pp.evaluate_counter(14.0, router, "GOLD")   # within ceiling, margin dips
d_esc = pp.evaluate_counter(28.0, router, "GOLD")   # over ceiling -> escalate
check("counter 8% -> ACCEPT", d_ok.decision == "ACCEPT", d_ok.decision)
check("counter 28% -> ESCALATE", d_esc.decision == "ESCALATE", d_esc.decision)
check("escalate recommends a safe counter <= ceiling", d_esc.recommended_counter_discount <= 15.0, d_esc.recommended_counter_discount)
check("escalate has approval chain", len(d_esc.approval_chain) >= 1, d_esc.approval_chain)
print(f"   ceiling={d_esc.allowed_ceiling} margin_floor={d_esc.margin_floor_discount} safe_max={d_esc.policy_safe_max_discount}")

print("\n=== 3. market_basket: recover seeded co-purchase rules ===")
# Replicate the seed's generation so mining should surface router->support etc.
random.seed(42)
KEYS = ["router","switch","support","saas","cat6","rack","onboarding","warranty"]
META = {  # (price, cost) -> margins: support .80, saas .846, onboarding .825, warranty .829, cat6 .778, rack .422, router .458, switch .458
    "router":(1200,650),"switch":(2400,1300),"support":(1500,300),"saas":(65,10),
    "cat6":(180,40),"rack":(900,520),"onboarding":(2000,350),"warranty":(700,120),
}
meta = {k:{"name":k,"price":p,"cost":c} for k,(p,c) in META.items()}
COP = {"router":[("support",.80),("cat6",.70)],"switch":[("rack",.65),("cat6",.50)],
       "saas":[("onboarding",.60),("support",.40)],"support":[("warranty",.50)]}
ANCH = (["router"]*5+["switch"]*4+["saas"]*3+["support"]*2+["onboarding"]*1)
baskets=[]
for _ in range(120):
    a=random.choice(ANCH); b=[a]
    for partner,prob in COP.get(a,[]):
        if random.random()<prob and partner not in b: b.append(partner)
    while len(b)<2:
        k=random.choice(KEYS)
        if k not in b: b.append(k)
    baskets.append(b[:4])
rules = mb.mine_rules(baskets, meta)
recs = mb.recommend(["router"], rules, top_k=3)
rec_ids = [r.product_id for r in recs]
print("   cart=[router] ->", [(r.product_id, f"conf={r.confidence:.2f}", f"lift={r.lift:.2f}", f"m={r.margin_pct:.2f}", f"score={r.rank_score}") for r in recs])
check("router recommends support", "support" in rec_ids, rec_ids)
check("all recs margin >= 0.15", all(r.margin_pct >= 0.15 for r in recs), rec_ids)
check("recs sorted by rank_score desc", rec_ids == [r.product_id for r in sorted(recs, key=lambda x:-x.rank_score)], rec_ids)
# Hand-verify one rule's arithmetic against raw counts.
N=len(baskets)
cnt_router=sum(1 for b in baskets if "router" in b)
cnt_support=sum(1 for b in baskets if "support" in b)
cnt_both=sum(1 for b in baskets if "router" in b and "support" in b)
exp_conf=cnt_both/cnt_router; exp_lift=exp_conf/(cnt_support/N)
rs = next((r for r in recs if r.product_id=="support"), None)
check("router->support confidence matches raw counts", rs and abs(rs.confidence-round(exp_conf,4))<1e-9, rs and rs.confidence)
check("router->support lift matches raw counts", rs and abs(rs.lift-round(exp_lift,4))<1e-9, rs and rs.lift)
print(f"   raw: N={N} A(router)={cnt_router} B(support)={cnt_support} A&B={cnt_both} -> conf={exp_conf:.3f} lift={exp_lift:.3f}")

print("\n=== 4. anomaly: Sam's hero outlier vs clean baseline ===")
random.seed(7)
sam_baseline = [round(min(22,max(0,random.gauss(9,3))),1) for _ in range(40)]
res = an.detect_discount_anomaly(32.0, sam_baseline)
print(f"   baseline n={res.baseline.n} mean={res.baseline.mean} std={res.baseline.std} median={res.baseline.median} mad={res.baseline.mad}")
print(f"   value=32.0 z={res.z_score} modified_z={res.modified_z_score} method={res.method} sev={res.severity}")
check("32% flagged anomalous", res.is_anomaly is True, res.is_anomaly)
check("large sample uses z-score", res.method == "zscore", res.method)
check("normal 9% not anomalous", an.detect_discount_anomaly(9.0, sam_baseline).is_anomaly is False)
# Small-sample robustness: MAD method picked, resists a lone outlier in the baseline.
small = [6,7,6,8,7,6,7,30]  # n<12 -> modified z
sm = an.detect_discount_anomaly(31.0, small)
check("small sample uses modified z", sm.method == "modified_zscore", sm.method)
check("31 flagged in small noisy sample", sm.is_anomaly is True, sm.is_anomaly)

print("\n=== 5. anomaly: stall detection ===")
from datetime import datetime, timedelta
now=datetime(2026,9,5)
st=an.detect_stalled(now-timedelta(days=15),"PENDING_APPROVAL",now)
check("PENDING 15d is stalled", st.is_stalled and st.days_stale==15, (st.is_stalled,st.days_stale))
check("PENDING 5d not stalled", an.detect_stalled(now-timedelta(days=5),"PENDING_APPROVAL",now).is_stalled is False)
check("DRAFT 20d stalled", an.detect_stalled(now-timedelta(days=20),"DRAFT",now).is_stalled is True)

print("\n=== 6. deal_health: bands ===")
healthy=dh.score_deal(margin_pct=55, total_overage_pp=0, approval_chain=[], stall_severity="NONE", anomaly_severity="NONE")
sick=dh.score_deal(margin_pct=18, total_overage_pp=17, approval_chain=["MANAGER","FINANCE"], stall_severity="HIGH", anomaly_severity="HIGH")
print(f"   healthy={healthy.score} band={healthy.band} | sick={sick.score} band={sick.band}")
check("healthy deal GREEN", healthy.band=="GREEN", (healthy.score,healthy.band))
check("bad deal RED", sick.band=="RED", (sick.score,sick.band))
check("feature contributions sum to score", abs(sum(f.contribution for f in sick.features)-sick.score)<0.02, sum(f.contribution for f in sick.features))
check("5 features returned", len(healthy.features)==5, len(healthy.features))

print("\n" + ("ALL CHECKS PASSED" if not FAILS else f"{len(FAILS)} FAILURES: {FAILS}"))
sys.exit(1 if FAILS else 0)
