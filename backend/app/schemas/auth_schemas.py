from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr
from app.models.user import Role

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[Role] = Role.REP

class GoogleAuthRequest(BaseModel):
    token: str

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: Role
    customer_id: Optional[UUID] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    user: Optional[UserResponse] = None
