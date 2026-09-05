from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import (
    auth,
    quotes,
    approvals,
    warehouses,
    subscriptions,
    portal,
    dashboard,
    ai_router,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Self-governing B2B sales operations platform API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all module routers
app.include_router(auth.router)
app.include_router(quotes.router)
app.include_router(approvals.router)
app.include_router(warehouses.router)
app.include_router(subscriptions.router)
app.include_router(portal.router)
app.include_router(dashboard.router)
app.include_router(ai_router.router)

@app.get("/")
def root():
    return {"message": "DealFlow360 API is active", "version": "1.0.0"}
