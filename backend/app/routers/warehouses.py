from fastapi import APIRouter

router = APIRouter(prefix="/warehouses", tags=["warehouses"])

@router.get("")
def list_warehouses():
    return []
