from fastapi import APIRouter

router = APIRouter(prefix="/portal", tags=["portal"])

@router.get("/quotes/{quote_id}")
def get_customer_quote(quote_id: str):
    return {"quote_id": quote_id, "status": "DRAFT"}
