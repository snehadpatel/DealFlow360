from fastapi import APIRouter

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.get("/plans")
def list_plans():
    return []
