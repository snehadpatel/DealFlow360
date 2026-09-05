from datetime import datetime, timedelta
from typing import Optional, List
from uuid import UUID
from jose import jwt
import bcrypt
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from app.core.config import settings
from app.db import get_session
from app.models.user import User, Role

# Use the bcrypt library directly. passlib 1.7.4's bcrypt backend is broken
# against bcrypt >= 4.1 (its version-detection probe raises "password cannot be
# longer than 72 bytes"), so we call bcrypt ourselves. Hashes are the standard
# $2b$ format, so any previously-seeded passlib hashes still verify.
security_scheme = HTTPBearer(auto_error=False)

# bcrypt hard-caps the input at 72 bytes; truncate so long passwords don't raise.
def _to_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:72]

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_to_bytes(plain_password), hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(_to_bytes(password), bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    """Return the user when the email exists, is active, and the password matches."""
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def token_for_user(user: User) -> str:
    """Issue a signed JWT carrying the user id (subject), role and name."""
    return create_access_token({"sub": str(user.id), "role": user.role.value, "name": user.name})

from fastapi import HTTPException, Security, Depends, status, Request

def get_current_user(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
    session: Session = Depends(get_session),
) -> User:
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required",
        )

    payload = decode_token(auth.credentials)
    subject = payload.get("sub")
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload",
        )

    # Token subject is the stringified user UUID.
    try:
        user_id = UUID(str(subject))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token subject",
        )

    user = session.get(User, user_id)
    # 401 (not 404) so the frontend's interceptor clears the session and re-logs in.
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
        
    from app.core.context import current_user_id, client_ip
    current_user_id.set(user.id)
    if request.client:
        client_ip.set(request.client.host)
        
    return user

def require_roles(allowed_roles: List[Role]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != Role.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role {current_user.role.value}",
            )
        return current_user
    return role_checker
