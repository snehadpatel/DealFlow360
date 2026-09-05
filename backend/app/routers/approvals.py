from fastapi import APIRouter

router = APIRouter(prefix="/approvals", tags=["approvals"])

@router.get("/pending")
def list_pending():
    return []
