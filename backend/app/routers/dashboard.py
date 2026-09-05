from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_stats():
    return {"active_deals": 12, "stalled_deals": 2, "avg_discount": "11.4%"}
