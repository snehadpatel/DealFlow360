from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db import init_db
from app.routers import (
    auth,
    quotes,
    approvals,
    warehouses,
    subscriptions,
    portal,
    dashboard,
    ai_router,
    billing,
    users,
    customers,
    products,
    operations,
    finance,
    negotiations,
    notifications,
)
from app.routers.admin_rules import (
    discount_router,
    upsell_router,
    audit_router,
    price_list_router,
)
from app.routers.operations import (
    orders_router,
    shipments_router,
    backorders_router,
    inventory_router,
)
from app.routers.finance import (
    invoices_router,
    payments_router,
    credit_notes_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and database is seeded idempotently once
    init_db()
    try:
        from seed import seed
        seed(force=False)
    except Exception as e:
        print(f"Auto-seed check notice: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Self-governing B2B sales operations platform API",
    version="2.0.0",
    lifespan=lifespan,
)
#middleware
# Capture actor + client IP for the audit listener. Added before CORS so CORS
# stays the outermost middleware (preflight/error responses keep CORS headers).
from app.core.audit_middleware import AuditContextMiddleware
app.add_middleware(AuditContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Core ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(quotes.router)
app.include_router(approvals.router)
app.include_router(dashboard.router)

# ─── Admin ───────────────────────────────────────────────────────────────────
app.include_router(users.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(warehouses.router)
app.include_router(discount_router)
app.include_router(upsell_router)
app.include_router(audit_router)
app.include_router(price_list_router)

# ─── Operations ───────────────────────────────────────────────────────────────
app.include_router(orders_router)
app.include_router(shipments_router)
app.include_router(backorders_router)
app.include_router(inventory_router)

# ─── Finance ──────────────────────────────────────────────────────────────────
app.include_router(invoices_router)
app.include_router(payments_router)
app.include_router(credit_notes_router)

# ─── Collaboration ────────────────────────────────────────────────────────────
app.include_router(subscriptions.router)
app.include_router(negotiations.router)
app.include_router(notifications.router)

# ─── Legacy / AI ─────────────────────────────────────────────────────────────
app.include_router(billing.router)
app.include_router(billing.router, prefix="/api")
app.include_router(portal.router)
app.include_router(ai_router.router)


@app.get("/")
def root():
    return {"message": "DealFlow360 API is active", "version": "2.0.0"}
