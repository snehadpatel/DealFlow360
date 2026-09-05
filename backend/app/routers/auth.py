from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
def login():
    return {"access_token": "demo-token", "token_type": "bearer", "role": "REP", "name": "Alex Rep"}
