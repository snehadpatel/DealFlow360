from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db import get_session
from app.models.user import User, Role
from app.schemas.auth_schemas import (
    LoginRequest,
    SignupRequest,
    GoogleAuthRequest,
    TokenResponse,
    UserResponse,
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, session: Session = Depends(get_session)):
    # Check if user email already exists
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists",
        )
    
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role or Role.REP,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        name=user.name,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            customer_id=user.customer_id,
        ),
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        name=user.name,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            customer_id=user.customer_id,
        ),
    )

@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleAuthRequest, session: Session = Depends(get_session)):
    # Mock/development Google auth handler
    demo_email = "google.user@example.com"
    user = session.exec(select(User).where(User.email == demo_email)).first()
    if not user:
        user = User(
            name="Google User",
            email=demo_email,
            password_hash=get_password_hash("google_oauth_fallback_pwd"),
            role=Role.REP,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
    
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        name=user.name,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            customer_id=user.customer_id,
        ),
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        customer_id=current_user.customer_id,
    )

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
