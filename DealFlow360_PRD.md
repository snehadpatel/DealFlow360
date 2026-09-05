# DealFlow360 — Product Requirements Document

**Version:** 1.0 (Hackathon MVP)
**Timeframe:** 24-hour build
**Team stack:** React (Vite) · FastAPI (Python) · PostgreSQL (Neon/Railway) · SQLModel + Alembic · LangChain (Python)
**Author:** Team draft, generated with Claude

---

## 1. Executive Summary

DealFlow360 is a self-governing B2B sales operations platform. Instead of a static "quote → invoice" form, it enforces pricing discipline through automated discount approval routing, splits orders across warehouses based on live stock, reconciles one-time and recurring billing on a single order, and lets customers negotiate quotations directly in a portal.

Given the 24-hour build window, this PRD scopes the project to a **deterministic core engine** (discount governance, approval routing, warehouse splitting, billing) plus a **thin AI/agentic layer** (upsell suggestions, anomaly narration) that showcases intelligence without putting non-deterministic logic in charge of decisions the demo needs to prove out step-by-step.

---

## 2. Problem Statement

Real B2B sales teams operate in messier conditions than simple CRUD tools support:

- Multi-level discount approvals that vary by customer tier *and* product category
- Partial stock spread across multiple warehouses
- Bundled subscriptions mixed with one-time hardware on the same order
- Customers who want to negotiate inside a portal instead of over email
- Managers who only discover a deal is stuck after momentum is already lost

DealFlow360 solves this by making the quotation a living, rule-governed object rather than a static document.

---

## 3. Goals

### 3.1 MVP Goal (24h)
Ship a working, demoable slice that proves the **quotation-to-cash** flow end-to-end for at least two scenarios, matching the original spec's "Quick Test Flow."

### 3.2 Key Outcomes
| # | Outcome | Deterministic or AI-assisted |
|---|---|---|
| 1 | Rep builds a quote; discount + category rules auto-route it for approval | Deterministic |
| 2 | Rep sees live upsell/cross-sell suggestions with margin impact while quoting | AI-assisted |
| 3 | Order auto-splits across warehouses based on live stock, with manual override | Deterministic |
| 4 | One order mixes one-time + recurring lines with correct billing schedules | Deterministic |
| 5 | Dashboard flags stalled/anomalous deals in real time | Deterministic detection + AI narration |
| 6 | Customer negotiates a live quotation from a portal; over-threshold changes re-trigger approval | Deterministic |

---

## 4. Scope

### 4.1 In Scope (Build This)
- Auth with 5 roles: Sales Rep, Sales Manager/Approver, Finance/Ops, Customer (portal), Admin (seeded, not built as UI)
- Quotation Builder: add products, quantities, line/order discounts, live margin indicator
- **Blended Discount Risk Score** engine + approval routing (Manager → Finance)
- Full audit trail (user, timestamp, reason) on every approval/rejection/edit
- Upsell/Cross-sell panel powered by an AI agent, with Add/Dismiss actions
- Warehouse split screen: recommended split from live stock, Accept/Manual Override
- Subscription & billing screen: one-time vs recurring lines, billing schedule, proration on quantity change
- Customer portal: view quote, comment/counter-discount, Confirm; auto re-enters approval if over threshold
- Deal Health dashboard: stalled deals, discount anomalies (rule-based), AI-generated plain-language nudge draft
- Seeded backend config data (products, price lists, discount tiers, warehouses, one subscription plan) — **no admin CRUD UI built**

### 4.2 Explicitly Out of Scope / Deferred
- Admin backend configuration screens (A1–A7 in original spec) — data is seeded via script instead
- Multi-currency / multi-company support (explicitly a "bonus" in original spec)
- Full reporting/export suite (PDF/XLS export limited to one payslip-style/quote PDF if time allows)
- Real-time websockets (using polling instead unless time remains)
- Negotiation AI assistant (stretch only, see 4.3)

### 4.3 Stretch Goals (only if core flow is done early)
- Negotiation assistant: AI drafts rep's reply to a customer counter-offer
- Socket.io for true real-time updates instead of polling
- Second AI-suggested product bundle beyond single-item upsell

---

## 5. User Roles & Permissions

| Role | Key Permissions |
|---|---|
| **Sales Rep** | Build quotations, apply discounts, add upsell items, track approval/fulfillment status, respond to customer negotiation |
| **Sales Manager/Approver** | Review/approve/reject quotes exceeding thresholds, monitor Deal Health dashboard |
| **Finance/Ops** | Second-level approval for high-risk discounts, manage warehouse splits and backorders, reconcile billing |
| **Customer (Portal)** | View quotation, request changes/ask questions, counter a discount, confirm final terms (own quotes only) |
| **Admin** | Full access; in MVP this is represented by seed data rather than a config UI |

---

## 6. System Architecture

### 6.1 High-Level Flow
```
React (Vite) SPA
   │  REST calls (JWT in Authorization header)
   ▼
FastAPI (Python, served via Uvicorn)
   ├── /auth            → JWT issue/verify (python-jose), bcrypt hashing (passlib)
   ├── /quotes           → CRUD + line items (Pydantic request/response models)
   ├── /discount-engine   → blended risk score calc (deterministic)
   ├── /approvals         → approval chain state machine
   ├── /warehouses        → stock lookup + split algorithm
   ├── /subscriptions      → billing schedule + proration
   ├── /portal            → customer-scoped read/write (scope enforced via FastAPI Depends())
   ├── /dashboard          → stalled deal + anomaly detection
   └── /ai                → LangChain (Python) chains (upsell, anomaly narration)
   │
   ▼
PostgreSQL (Neon or Railway) via SQLModel + Alembic migrations
```

FastAPI also gives auto-generated interactive API docs at `/docs`, useful while frontend and backend teammates work in parallel.

### 6.2 Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + Vite | Fast dev loop, no framework opinions to fight |
| Styling/UI | Tailwind CSS + shadcn/ui | Pre-built tables/cards/dialogs for fast, polished screens |
| Data fetching | TanStack Query | Caching, loading states, polling for "live" feel |
| Backend | Python + FastAPI | Async, fast to write, Pydantic gives free request/response validation; scaffolded with stub routers so team edits business logic, not framework plumbing |
| Database | PostgreSQL (Neon or Railway) | Plain Postgres, no platform lock-in |
| ORM | SQLModel (or SQLAlchemy) + Alembic | Type-safe models shared between DB layer and Pydantic schemas; Alembic for migrations, seed script via a plain Python file |
| Auth | JWT via `python-jose` + `passlib[bcrypt]` | Role stored on `User.role`, enforced via FastAPI `Depends()` on each route |
| AI/Agentic | LangChain (Python) | Native ecosystem — simpler integration than LangChain.js; structured JSON in/out via Pydantic output parsers, not autonomous tool-calling loops |
| ASGI server | Uvicorn | Standard FastAPI runtime |
| PDF export | pdfkit (backend) or `@react-pdf/renderer` (frontend) | One quote/payslip-style PDF |
| Excel export | xlsx (SheetJS) | Drop-in, no backend dependency |
| Deployment | Vercel (frontend) + Railway (backend + DB) | Backend and DB co-located to minimize network config during demo |

### 6.3 Repository Structure
```
/client                 → Vite React app
  /src
    /pages              → QuotationBuilder, Approval, Warehouse, Subscription, Portal, Dashboard
    /components
    /hooks              → useQuotes, useApprovals, etc. (TanStack Query)
/server
  /app
    /routers             → auth.py, quotes.py, approvals.py, warehouses.py, subscriptions.py, portal.py, dashboard.py, ai.py
    /services
      deal_logic.py       → deterministic: risk score, approval routing, split calc, proration
      ai_agent.py         → LangChain chains invoked from deal_logic where relevant
    /agents
      upsell_agent.py
      anomaly_narrator_agent.py
    /models               → SQLModel table classes (User, Customer, Product, Quotation, etc.)
    /schemas              → Pydantic request/response models
    /core
      security.py          → JWT issue/verify, password hashing, role-check dependency
      config.py             → env vars, DB connection string
    main.py                → FastAPI app entrypoint, router registration
  /alembic
    versions/               → migration files
  seed.py                   → seeds tiers, products, warehouses, one subscription plan, demo users
```

---

## 7. Data Model

Core entities and relationships (SQLModel-style, simplified — actual files live under `/server/app/models`):

```python
class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    email: str = Field(unique=True)
    password_hash: str
    role: Role  # REP, MANAGER, FINANCE, CUSTOMER, ADMIN
    customer_id: Optional[UUID] = Field(default=None, foreign_key="customer.id")

class Customer(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    tier: Tier  # BRONZE, SILVER, GOLD

class Product(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    category: str  # Hardware, Services, Subscription
    price: float
    cost: float
    discount_ceiling: float  # category-level discount ceiling %

class DiscountTier(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tier: Tier = Field(unique=True)
    max_discount: float  # e.g. Gold = 15%

class Quotation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    customer_id: UUID = Field(foreign_key="customer.id")
    rep_id: UUID = Field(foreign_key="user.id")
    status: QuoteStatus  # DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, CONFIRMED
    blended_risk: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class QuotationLine(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id")
    product_id: UUID = Field(foreign_key="product.id")
    quantity: int
    discount_pct: float
    is_recurring: bool = False
    billing_cycle: Optional[str] = None  # MONTHLY, QUARTERLY, YEARLY

class ApprovalStep(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id")
    level: str  # MANAGER, FINANCE
    status: str  # PENDING, APPROVED, REJECTED, RETURNED
    reviewer_id: Optional[UUID] = None
    reason: Optional[str] = None
    acted_at: Optional[datetime] = None

class AuditEntry(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id")
    user_id: UUID = Field(foreign_key="user.id")
    action: str
    reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Warehouse(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    ship_cost_weight: float

class StockLevel(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    warehouse_id: UUID = Field(foreign_key="warehouse.id")
    product_id: UUID = Field(foreign_key="product.id")
    quantity: int

class FulfillmentSplit(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id")
    warehouse_id: UUID = Field(foreign_key="warehouse.id")
    quantity: int
    overridden: bool = False

class SubscriptionPlan(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    cycle: str  # MONTHLY, QUARTERLY, YEARLY
    proration_rule: str

class PortalMessage(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id")
    from_customer: bool
    message: str
    proposed_discount: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

Alembic auto-generates migrations from these models (`alembic revision --autogenerate`); Pydantic request/response schemas in `/server/app/schemas` mirror them for API validation.

---

## 8. Functional Requirements

### 8.1 Auth & Roles
- JWT issued on login, `role` embedded in token payload
- Middleware rejects requests where `req.user.role` lacks permission for the route
- Customer-role tokens additionally scoped to their own `customerId` — enforced in every `/portal` and `/quotes` query (`WHERE customerId = req.user.customerId`)

### 8.2 Quotation Builder
- Rep selects customer, adds product lines (Hardware, Services, Subscriptions), sets quantity and discount per line
- Live order total and margin recalculated on every change (client-side calc, confirmed server-side on save)
- "Confirm" triggers the discount engine (8.3) before moving the quote forward

### 8.3 Discount Governance & Blended Risk Score (Deterministic)
**Algorithm** (per original spec, must be implemented exactly):
1. For each line, compare its discount % to the *stricter* of: (a) the customer tier's max discount, (b) the product category's discount ceiling.
2. Compute each line's overage: `max(0, given_discount - allowed_discount)`.
3. Blended risk score = weighted sum of overages across all lines (not just the single worst line) — this catches many small violations that individually look fine.
4. Routing:
   - Score below Manager threshold → auto-approved, straight to fulfillment
   - Score above Manager threshold, below Finance threshold → Manager approval only
   - Score above Finance threshold → Manager, then Finance
5. Every approval, rejection, edit, and reason is written to `AuditEntry`.

**Example (from spec, use as a test case):** Gold customer (15% ceiling), Laptop (Hardware, 15% ceiling) discounted 12% = fine. Setup Service (Services, 10% ceiling) discounted 18% = 8 points over → whole quote flagged, regardless of the 15% "sounding fine" for a Gold customer.

### 8.4 Approval Workflow
- Approval screen shows blended risk score and the ordered list of required steps
- Reviewer actions: Approve / Reject / Return for revision, each requiring a reason
- On full approval, quote status → APPROVED and proceeds to warehouse split (8.6)

### 8.5 Upsell/Cross-Sell Panel (AI-assisted)
- See Section 9.1 for agent design
- Panel shows ranked suggestions with margin delta and promotion tag
- "Add to Quote" recalculates order margin immediately; "Dismiss" removes suggestion from view for this session

### 8.6 Warehouse Fulfillment Split (Deterministic)
- Given order lines and live `StockLevel` per warehouse, greedily minimize shipment count weighted by `shipCostWeight`
- Output: list of `{warehouse, quantity}` pairs plus estimated shipment count/cost
- "Accept Suggested Split" persists to `FulfillmentSplit`; "Manual Override" lets rep edit quantities directly
- If stock arrives mid-fulfillment for a backordered line, surface a "Consolidate Remaining Backorder" prompt

### 8.7 Subscription & Hybrid Billing (Deterministic)
- One-time and recurring lines displayed separately within the same order
- Recurring lines generate a `BillingSchedule` based on the attached `SubscriptionPlan.cycle`
- Mid-cycle quantity change triggers proration calculation per `prorationRule`
- Cancel/modify triggers automatic partial refund or credit note record

### 8.8 Customer Portal & Negotiation
- Customer-only view, separate route/auth guard from internal workspace — **not** a relabeled internal screen
- Shows quote status (Sent, Under Negotiation, Confirmed), line comments, and a counter-discount field
- "Submit Request" posts a `PortalMessage`; "Confirm Quotation" checks final terms against thresholds — if over threshold, quote status resets to PENDING_APPROVAL and re-enters 8.3/8.4; otherwise proceeds to fulfillment

### 8.9 Deal Health Dashboard
- **Deterministic detection:**
  - Stalled: `quotation.updatedAt` older than configurable N days while status is DRAFT/PENDING
  - Anomaly: line discount more than X standard deviations above that rep's historical average discount
- **AI-assisted narration:** LLM turns the flagged numbers into a plain-language explanation and a draft nudge/escalation message (Section 9.2)
- Clicking an alert opens the related quotation directly

---

## 9. AI / Agentic Layer Design

**Design principle:** keep every number a judge can hand-verify (risk score, split quantities, billing amounts) fully deterministic. Use AI only where it adds *suggestion* or *narrative* value, never as the sole authority on an approval or financial calculation.

### 9.1 Upsell/Cross-Sell Agent
- **Input (structured JSON):** current cart lines, customer tier, co-purchase history rows, margin threshold
- **Chain:** LangChain (Python) `RunnableSequence`/LCEL — prompt template → chat model → Pydantic output parser (pairs naturally with FastAPI's existing Pydantic schemas)
- **Output (structured JSON):** ranked list of `{productId, reasoning, marginDelta, promotionTag}`
- Called from `POST /ai/upsell` whenever the cart changes (debounced client-side)

### 9.2 Anomaly Narrator + Nudge Drafter
- Triggered only after the deterministic dashboard logic (8.9) has already flagged a deal
- **Input:** the flagged deal's numbers (discount vs. rep average, days stalled)
- **Output:** one-paragraph plain-language explanation + a draft nudge message the manager can edit and "send" (can just persist as a message record for demo purposes, no real email needed)

### 9.3 (Stretch) Negotiation Assistant
- On a customer counter-offer, checks the proposed discount against policy (reuses 8.3 logic) and drafts the rep's reply
- Build only if 8.1–8.9 are fully working with time to spare

### 9.4 Provider Note
Chosen LLM provider/key (OpenAI vs. Anthropic via `langchain-anthropic`) to be confirmed by the team before scaffolding — swappable with one config change since both plug into the same LangChain interface.

---

## 10. Representative API Endpoints

```
POST   /auth/login
POST   /auth/signup

GET    /quotes                 (rep: own; manager/finance: assigned/pending; customer: own)
POST   /quotes
PATCH  /quotes/:id
POST   /quotes/:id/confirm      → runs discount engine, sets status

GET    /quotes/:id/approvals
POST   /quotes/:id/approvals/:stepId/act   (approve/reject/return + reason)

GET    /warehouses/split?quotationId=
POST   /warehouses/split/:quotationId/accept
POST   /warehouses/split/:quotationId/override

GET    /subscriptions/schedule/:quotationId
POST   /subscriptions/:lineId/prorate

GET    /portal/quotes/:id        (customer-scoped)
POST   /portal/quotes/:id/message
POST   /portal/quotes/:id/confirm

GET    /dashboard/stalled
GET    /dashboard/anomalies

POST   /ai/upsell
POST   /ai/anomaly-narrative
```

---

## 11. Non-Functional Requirements
- **Determinism first:** all financial/approval calculations must be reproducible and traceable via `AuditEntry` — no AI in that path
- **Security (MVP level):** bcrypt-hashed passwords, JWT with short expiry, role + customer-scope checks on every route touching quote data
- **Performance:** demo-scale only (seed data in the dozens of rows); no load-testing needed
- **Resilience during demo:** if an AI call (`/ai/*`) fails or times out, the UI should degrade gracefully (hide the panel/show "suggestions unavailable") rather than blocking the core flow

---

## 12. Acceptance Criteria (mapped to original "Quick Test Flow")

| # | Test Step | Pass Condition |
|---|---|---|
| 1 | Seed a discount tier, warehouse, subscription plan | Data present via seed script, visible in relevant screens |
| 2 | Add a line with an above-limit discount | Quote auto-requests approval without rep action |
| 3 | Accept an upsell suggestion | Order total and margin update immediately |
| 4 | Approve the quote | Stock pulled from correct warehouse(s), split across two if needed |
| 5 | One-time + recurring line on same order | Billed correctly and separately, schedule visible |
| 6 | Customer requests bigger discount in portal | Quote automatically re-enters approval |
| 7 | Confirm order, record payment | Invoice/quote status updates correctly |
| 8 | Dashboard | Stalled/anomalous deal appears with AI-narrated explanation |

---

## 13. 24-Hour Build Timeline (Indicative)

| Hours | Focus |
|---|---|
| 0–2 | Repo scaffold (client+server), Prisma schema, seed script, deploy pipeline confirmed |
| 2–6 | Auth, Quotation Builder CRUD, discount engine + blended risk score |
| 6–9 | Approval workflow UI + API, audit log |
| 9–12 | Warehouse split logic + screen |
| 12–15 | Subscription/billing logic + screen |
| 15–17 | Customer portal (separate auth-scoped route) |
| 17–19 | Deal Health dashboard (deterministic detection) |
| 19–21 | AI layer: upsell agent, anomaly narrator |
| 21–23 | End-to-end run of Quick Test Flow, bug fixes, seed data polish |
| 23–24 | Demo script rehearsal, architecture diagram, "what's next" note |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Running out of time before AI layer | AI is additive — core flow (8.1–8.9 deterministic parts) works standalone without it |
| LLM call latency/failure during live demo | Graceful degradation (Section 11); pre-warm/cache a known-good response as fallback |
| Blended risk score edge cases | Use the worked example in Section 8.3 as an automated test before touching UI |
| Async SQLAlchemy/SQLModel patterns feel unfamiliar mid-hackathon | Use synchronous DB sessions for the MVP (simpler, fast enough at demo scale) — skip async DB calls unless the team is already comfortable with them |
| Scope creep into admin config screens | Explicitly deferred (4.2) — seeded data only |

---

## 15. Future Roadmap (Post-Hackathon)
- Full admin backend (product/price list/discount tier/warehouse/subscription CRUD UI)
- Multi-currency and multi-company support
- Real-time via Socket.io instead of polling
- Negotiation assistant agent (9.3) promoted from stretch to core
- Full reporting suite with PDF/XLS export and filterable dashboards

---

## 16. Reference
Original mockup: https://app.excalidraw.com/l/65VNwvy7c4X/7Fb5SR3WKu2
