# DealFlow360

DealFlow360 is a self-governing B2B sales operations platform that enforces pricing discipline through automated discount approval routing, splits orders across warehouses based on live stock, reconciles one-time and recurring billing on a single order, and lets customers negotiate quotations directly in a portal.

## Architecture

- **Client (`client/`)**: React (Vite) + Tailwind CSS + TanStack Query
- **Server (`server/`)**: FastAPI + SQLModel + PostgreSQL / SQLite + LangChain AI agents
- **Docs (`docs/`)**: Product Requirements Document (PRD)

## Project Structure

```
dealflow360/
│
├── client/                          ← React (Vite) frontend
│   ├── public/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api/                     ← thin fetch/axios wrappers, one per module
│   │   │   ├── client.js             (base fetch config, attaches JWT header)
│   │   │   ├── quotes.js
│   │   │   ├── approvals.js
│   │   │   ├── warehouses.js
│   │   │   ├── subscriptions.js
│   │   │   ├── portal.js
│   │   │   ├── dashboard.js
│   │   │   └── ai.js                 (calls /ai/upsell, /ai/anomaly-narrative)
│   │   ├── hooks/                   ← TanStack Query hooks, one per module
│   │   │   ├── useQuotes.js
│   │   │   ├── useApprovals.js
│   │   │   ├── useWarehouseSplit.js
│   │   │   ├── useUpsell.js
│   │   │   └── useDashboard.js
│   │   ├── pages/                   ← one screen per module in the PRD
│   │   │   ├── Login.jsx
│   │   │   ├── QuotationBuilder.jsx
│   │   │   ├── ApprovalScreen.jsx
│   │   │   ├── WarehouseSplitScreen.jsx
│   │   │   ├── SubscriptionBillingScreen.jsx
│   │   │   ├── CustomerPortal.jsx     (separate auth-guarded route)
│   │   │   └── DealHealthDashboard.jsx
│   │   ├── components/              ← shared UI (shadcn components live here)
│   │   ├── context/
│   │   │   └── AuthContext.jsx       (JWT + role, gates routes)
│   │   └── lib/
│   │       └── utils.js
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          ← FastAPI backend
│   ├── app/
│   │   ├── main.py                  ← entrypoint, registers all routers
│   │   ├── db.py                    ← SQLModel engine/session setup
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── llm.py
│   │   │   └── security.py          ← JWT issue/verify, role-check dependency
│   │   ├── models/                  ← SQLModel table classes
│   │   │   ├── user.py, customer.py, product.py
│   │   │   ├── quotation.py, approval.py
│   │   │   ├── warehouse.py, subscription.py
│   │   │   └── portal.py, audit.py
│   │   ├── schemas/                 ← Pydantic request/response models
│   │   │   ├── ai_schemas.py
│   │   │   ├── auth_schemas.py
│   │   │   └── quote_schemas.py
│   │   ├── routers/                 ← one router per module
│   │   │   ├── auth.py
│   │   │   ├── quotes.py
│   │   │   ├── approvals.py
│   │   │   ├── warehouses.py
│   │   │   ├── subscriptions.py
│   │   │   ├── portal.py
│   │   │   ├── dashboard.py
│   │   │   └── ai_router.py
│   │   ├── services/
│   │   │   └── deal_logic.py        ← deterministic engine
│   │   └── agents/
│   │       ├── upsell_agent.py
│   │       ├── anomaly_narrator_agent.py
│   │       └── demo_run.py
│   ├── alembic/
│   │   └── versions/                ← migration files
│   ├── seed.py                      ← seeds tiers, products, warehouses, plans, demo users
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic.ini
│
├── docs/
│   └── DealFlow360_PRD.md
├── README.md
└── .gitignore
```
