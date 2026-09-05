"""Users router — Admin user management CRUD."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.schemas.admin_schemas import UserCreate, UserUpdate, UserResponse, PasswordReset
from app.services import admin_service

router = APIRouter(prefix="/users", tags=["users"])
admin_guard = require_roles([Role.ADMIN])


@router.get("", response_model=List[UserResponse])
def list_users(session: Session = Depends(get_session), _: User = Depends(admin_guard)):
    return admin_service.list_users(session)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(payload: UserCreate, session: Session = Depends(get_session), _: User = Depends(admin_guard)):
    return admin_service.create_user(session, payload.name, payload.email, payload.password, payload.role)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: UUID, payload: UserUpdate, session: Session = Depends(get_session), _: User = Depends(admin_guard)):
    return admin_service.update_user(session, user_id, **payload.model_dump(exclude_none=True))


@router.post("/{user_id}/disable", response_model=UserResponse)
def disable_user(user_id: UUID, session: Session = Depends(get_session), _: User = Depends(admin_guard)):
    return admin_service.toggle_user_active(session, user_id, False)


@router.post("/{user_id}/enable", response_model=UserResponse)
def enable_user(user_id: UUID, session: Session = Depends(get_session), _: User = Depends(admin_guard)):
    return admin_service.toggle_user_active(session, user_id, True)


@router.post("/{user_id}/reset-password")
def reset_password(user_id: UUID, payload: PasswordReset, session: Session = Depends(get_session), _: User = Depends(admin_guard)):
    admin_service.reset_password(session, user_id, payload.new_password)
    return {"message": "Password reset successfully"}


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: UUID, session: Session = Depends(get_session), _: User = Depends(admin_guard)):
    admin_service.delete_user(session, user_id)
