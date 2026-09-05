from fastapi import APIRouter

router = APIRouter(prefix="/quotes", tags=["quotes"])

@router.get("")
def list_quotes():
    return []

@router.post("")
def create_quote():
    return {"message": "Quote created"}
