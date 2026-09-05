# DealFlow360 — AI Demo Script & Runbook

The AI story in one line: **Glass-Box AI for deal-making** — every number is a
real, hand-verifiable algorithm (market-basket lift, robust z-scores, spec
margin math); the LLM only narrates; deterministic fallbacks mean the live demo
**cannot break** even with no internet or no API key.

---

## 0. Setup (one time, ~2 min — needs internet for pip)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# OPTIONAL — live Gemini narration. Skip it and the demo still works (templates).
export GEMINI_API_KEY="…your key…"
python seed.py            # builds dealflow360.db: 8 products, 3 reps, ~120 confirmed
                          # deals with baked co-purchase patterns + the hero anomaly
uvicorn app.main:app --reload   # http://localhost:8000/docs
```
> Re-seeding from scratch: `rm backend/dealflow360.db` then `python seed.py`
> (schema is created by `seed.py`; there are no Alembic migrations).

**Prove the math with zero dependencies (great for judges):**
```bash
python3 verify_ai_math.py     # 23 checks: spec example, lift, z-scores, health bands
python3 verify_ai_agents.py   # agent prose + deterministic fallback path
```

---

## The 3 "wow" beats (maps to the spec's Quick Test Flow)

### 🎯 Beat 1 — Grounded upsell (not a black-box guess)
In the Quotation Builder, add **Enterprise Edge Router X1**. The upsell panel
suggests the **24/7 Support Pack**.

- **Say:** *"This isn't ChatGPT guessing. It mined 120 confirmed deals: these
  two ship together in 84% of comparable orders, lift 1.6×, and the add-on
  carries 80% margin. The pitch is AI-written; the numbers are computed."*
- **Show:** `basis.transactions_analyzed = 120`, the `Margin booster` badge,
  and that `confidence`/`lift`/`margin_pct` are real fields.
```bash
curl -s localhost:8000/ai/upsell -H 'Content-Type: application/json' \
  -d '{"cart_product_names":["Enterprise Edge Router X1"],"top_k":3}'
```

### 📈 Beat 2 — Statistical discount anomaly, explained
Open the seeded **PENDING_APPROVAL** quote for rep **Sam** (the hero deal:
~32% router discount, stalled 15 days). Look up its id via `GET /quotes`
(login as `manager@dealflow360.com` / `password123`).

- **Say:** *"Sam normally discounts around 9%. This 32% line is a z-score of ~9.6
  against his own history — a statistical outlier, and the quote has been stuck
  15 days. The system flags it and explains it in plain English."*
- **Show:** `is_anomaly: true`, the `stats` block (mean 9.2, the real z / modified-z),
  `is_stalled: true`, `days_stale: 15`, and the narrative + recommended action.
```bash
curl -s localhost:8000/ai/anomaly-narrative -H 'Content-Type: application/json' \
  -d '{"quotation_id":"<SAM_PENDING_QUOTE_ID>"}'
```

### 🤝 Beat 3 — Negotiation Copilot
A customer counters at **28%** on the Router (Gold tier, 15% ceiling).

- **Say:** *"The copilot doesn't just say yes/no. It knows the 15% ceiling and the
  45.8% margin floor, recommends a policy-safe 15% counter that holds 36% margin,
  routes the 28% ask to Manager approval, and drafts the customer reply."*
- **Show:** `decision: ESCALATE`, `recommended_counter_discount`, `projected_margin_pct`
  vs `recommended_margin_pct`, `approval_chain`, and the `reply_draft`.
```bash
curl -s localhost:8000/ai/negotiation-reply -H 'Content-Type: application/json' \
  -d '{"counter_discount":28,"list_price":1200,"cost":650,"category_ceiling":15,"tier":"GOLD","customer_note":"A competitor offered 25% off."}'
```

### 🩺 Bonus — Deal Health (transparent score)
`POST /ai/deal-health {"quotation_id":"…"}` returns a 0–100 score with the **five
weighted sub-scores that produced it** (margin, discipline, approval, velocity,
anomaly). *"Not a mystery score — you can see exactly why it's AMBER."*

---

## Demo-safety drills (rehearse these — they're the confidence story)
1. **No key:** `unset GEMINI_API_KEY`, restart. Every endpoint still returns the
   real numbers; prose comes from templates; `llm_used: false`. Nothing breaks.
2. **Bad/slow key:** the call is abandoned after `LLM_TIMEOUT_SECONDS` (default 8);
   the template fires. The UI never hangs.
3. **Repeat a call:** identical requests are cached (sha256), so demo clicks are
   instant.
4. **Package missing:** even if `langchain-google-genai` isn't installed, the app
   boots (defensive import) and computes normally.

## Judge talking points (why this wins)
- **Real business logic, not a faked demo:** hand-verify any figure — run
  `verify_ai_math.py`, or check the spec's own worked example (Gold, 18% vs 10%
  ceiling → 8pp overage → Manager) live.
- **Trustworthy AI boundary:** the LLM literally cannot change a number — it's
  handed pre-computed values and only asked for prose (see
  `app/agents/llm_runtime.py`).
- **Efficient:** the ML is pure stdlib (no numpy/pandas/sklearn) — sub-millisecond,
  no framework bloat, no network dependency for correctness.
