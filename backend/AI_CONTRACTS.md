# DealFlow360 — AI Endpoint Contracts (Backend → Frontend Handoff)

**Base URL:** `http://localhost:8000`  **Interactive docs:** `http://localhost:8000/docs`
**Auth:** the `/ai/*` endpoints are **open (no token required)** for demo friction.
`GET /quotes` (used to look up quotation IDs) **does** require a Bearer token.

> **Design contract:** every number in these responses is computed in pure Python
> from confirmed order history and reviewable policy constants — the LLM only
> writes the prose fields (`pitch`, `promotion_tag`, `narrative`,
> `recommended_action`, `reply_draft`, `internal_nudge`). If `GEMINI_API_KEY` is
> unset or the model is slow/down, every endpoint still returns the **same
> numbers** with deterministic template prose and `llm_used: false`. Nothing
> here can hang the UI (all model calls are timeout-bounded) or crash the app
> (the LLM SDK import is optional).

---

## ⚠️ Known frontend bug to fix on your side (`/api` base path)

The frontend calls `/api/ai/*`, but the backend serves these at `/ai/*` (no
`/api` prefix) — so today every AI call 404s. Fix on the frontend, either:

**Option A — Vite dev proxy** (`vite.config.js`), strip the prefix:
```js
server: { proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true,
  rewrite: (p) => p.replace(/^\/api/, "") } } }
```
**Option B — axios base URL:** set `baseURL: "http://localhost:8000"` and call
`/ai/...` (no `/api`). Pick one; Option A keeps your existing `/api/...` calls.

---

## 1) `POST /ai/upsell` — grounded cross-sell

Mines association rules (support / confidence / lift) from all CONFIRMED quotes
and ranks candidates by a margin-aware score. Cart comes from the client; stats
are computed server-side. **You may pass product names OR ids** (names are
easiest — no lookup needed).

**Request** (`UpsellRequest`):
```json
{ "cart_product_names": ["Enterprise Edge Router X1"], "cart_product_ids": [], "top_k": 3 }
```

**Response** (`UpsellResponse`):
```json
{
  "recommendations": [
    {
      "product_name": "24/7 Mission-Critical Support Pack",
      "reasoning": "24/7 Mission-Critical Support Pack is bought with your Enterprise Edge Router X1 in 84% of comparable orders (lift 1.6x) and carries an 80% gross margin.",
      "suggested_price": 1500.0,
      "margin_impact": "+80% gross margin",
      "product_id": "…uuid…",
      "anchor_product_name": "Enterprise Edge Router X1",
      "confidence": 0.84, "lift": 1.62, "support": 0.34,
      "margin_pct": 0.80, "rank_score": 73.66,
      "promotion_flag": true, "promotion_tag": "Margin booster",
      "pitch": "…same as reasoning…"
    }
  ],
  "basis": { "transactions_analyzed": 120, "rules_mined": 24,
             "method": "association-rules(support/confidence/lift) + margin-aware rank",
             "llm_used": true }
}
```
The original four fields (`product_name`, `reasoning`, `suggested_price`,
`margin_impact`) are always present. Everything else is additive/optional.

```bash
curl -s localhost:8000/ai/upsell -H 'Content-Type: application/json' \
  -d '{"cart_product_names":["Enterprise Edge Router X1"],"top_k":3}'
```

---

## 2) `POST /ai/anomaly-narrative` — statistical discount anomaly + stall

Compares each line's discount against the **rep's own history** (z-score and
robust modified z-score, method chosen by sample size) and checks the stall SLA.
Prefer passing a real `quotation_id` (server loads everything).

**Request** (`AnomalyRequest`):
```json
{ "quotation_id": "…uuid of a quote…" }
```

**Response** (`AnomalyNarrativeResponse`):
```json
{
  "deal_id": "Q-1a2b3c4d",
  "narrative": "Deal Q-1a2b3c4d's 'Enterprise Edge Router X1' discount of 32.0% is a statistical outlier for this rep, whose discounts average 9.2% (z-score 9.6). It has also stalled in PENDING_APPROVAL for 15 days.",
  "recommended_action": "Verify the 32.0% discount with the rep against the ~9.2% baseline and route to Manager for sign-off before it ages further.",
  "is_anomaly": true, "severity": "HIGH", "anomalous_line": "Enterprise Edge Router X1",
  "stats": { "value": 32.0, "z_score": 9.58, "modified_z_score": 10.23,
             "method": "zscore", "mean": 9.2, "std": 2.4, "median": 9.2, "mad": 1.5, "n": 40 },
  "is_stalled": true, "days_stale": 15, "llm_used": true
}
```
Ad-hoc form (no persisted quote): `{ "deal_id":"Q-x", "rep_id":"…uuid…", "discount_percent":32, "status":"PENDING_APPROVAL" }`.

---

## 3) `POST /ai/negotiation-reply` — Negotiation Copilot

Evaluates a customer counter-offer with `pricing_policy.evaluate_counter`:
returns `ACCEPT | COUNTER | ESCALATE`, the policy-safe recommended counter, the
projected margin, the approval chain, and drafts a customer reply + internal nudge.

**Request** (`NegotiationRequest`) — either mode:
```json
{ "quotation_id": "…uuid…", "product_id": "…uuid…", "counter_discount": 28,
  "customer_note": "A competitor offered 25% off.", "persist": false }
```
```json
{ "counter_discount": 28, "list_price": 1200, "cost": 650,
  "category_ceiling": 15, "tier": "GOLD", "customer_note": "Competitor at 25%." }
```

**Response** (`NegotiationResponse`):
```json
{
  "decision": "ESCALATE",
  "counter_discount": 28.0, "allowed_ceiling": 15.0,
  "margin_floor_discount": 45.83, "policy_safe_max_discount": 15.0,
  "recommended_counter_discount": 15.0,
  "projected_margin_pct": 24.7, "recommended_margin_pct": 36.27,
  "overage_pp": 13.0, "approval_chain": ["MANAGER"],
  "policy_notes": ["28.0% exceeds the 15% ceiling by 13.0 pts -> requires MANAGER.", "A 15.0% counter stays within policy and needs no sign-off."],
  "reply_draft": "Thank you for the counter-offer on the Enterprise Edge Router X1…",
  "internal_nudge": "ESCALATE: offer 15.0% (customer asked 28.0%)…",
  "llm_used": true
}
```
`persist: true` (with a `quotation_id`) stores the counter in `PortalNegotiation`
(best-effort; never fails the advice).

---

## 4) `POST /ai/deal-health` — transparent 0–100 score

Deterministic (no LLM needed). Weighted sub-scores are all returned so the UI
can show *why*.

**Request** (`DealHealthRequest`): `{ "quotation_id": "…uuid…" }`

**Response** (`DealHealthResponse`):
```json
{
  "deal_id": "Q-1a2b3c4d", "score": 41.2, "band": "AMBER",
  "features": [
    { "name": "margin", "score": 62.0, "weight": 0.30, "contribution": 18.6, "detail": "Gross margin 25% (100 at >=40%)." },
    { "name": "discount_discipline", "score": 15.0, "weight": 0.25, "contribution": 3.75, "detail": "Summed overage 17.0pp over ceilings." },
    { "name": "approval", "score": 60.0, "weight": 0.15, "contribution": 9.0, "detail": "Approval chain: MANAGER." },
    { "name": "velocity", "score": 35.0, "weight": 0.15, "contribution": 5.25, "detail": "Stall severity: MEDIUM." },
    { "name": "anomaly", "score": 12.0, "weight": 0.15, "contribution": 1.8, "detail": "Discount anomaly severity: HIGH." }
  ],
  "llm_used": false
}
```
Bands: **GREEN ≥ 75, AMBER 50–74, RED < 50**.

---

## 5) `GET /ai/health` — narration mode probe
`{ "llm_available": true, "narration": "gemini" }` or `"deterministic-template"`.

---

## How to get real quotation IDs (for endpoints 2–4)

```bash
# 1. login (manager sees ALL quotes)
TOKEN=$(curl -s localhost:8000/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"manager@dealflow360.com","password":"password123"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
# 2. list quotes; grab the PENDING_APPROVAL one seeded for rep "Sam" (the hero anomaly)
curl -s localhost:8000/quotes -H "Authorization: Bearer $TOKEN"
```

## Suggested frontend wiring
- Hooks: `useUpsell(cart)`, `useAnomalyNarrative(quotationId)`, `useNegotiationReply(payload)`, `useDealHealth(quotationId)`.
- Wire `useUpsell` into `QuotationBuilder.jsx` (call on cart change; render `recommendations` with the `promotion_tag` badge and `pitch`).
- Show `basis.transactions_analyzed` ("based on N past deals") and `llm_used` (a small "AI-written" vs "rule-based" indicator).
- Render `DealHealth.features` as a stacked/contribution bar — that transparency is the differentiator.
