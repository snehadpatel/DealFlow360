"""Customers router — CRUD for customer management."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.schemas.admin_schemas import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services import admin_service

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=List[CustomerResponse])
def list_customers(
    rep_id: Optional[UUID] = Query(default=None),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    # Reps can only see their customers
    filter_rep = user.id if user.role == Role.REP else rep_id
    return admin_service.list_customers(session, rep_id=filter_rep)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: UUID, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return admin_service.get_customer_or_404(session, customer_id)


@router.post("", response_model=CustomerResponse, status_code=201)
def create_customer(
    payload: CustomerCreate,
    session: Session = Depends(get_session),
    user: User = Depends(require_roles([Role.ADMIN, Role.MANAGER]))
):
    return admin_service.create_customer(session, **payload.model_dump())


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: UUID,
    payload: CustomerUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(require_roles([Role.ADMIN, Role.MANAGER, Role.REP]))
):
    return admin_service.update_customer(session, customer_id, **payload.model_dump(exclude_none=True))
