"""Products router — Admin CRUD for product catalog."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.schemas.admin_schemas import ProductCreate, ProductUpdate, ProductResponse
from app.services import admin_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductResponse])
def list_products(
    include_archived: bool = Query(default=False),
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user)
):
    return admin_service.list_products(session, include_archived)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: UUID, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return admin_service.get_product_or_404(session, product_id)


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    payload: ProductCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN]))
):
    return admin_service.create_product(session, **payload.model_dump())


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID,
    payload: ProductUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN]))
):
    return admin_service.update_product(session, product_id, **payload.model_dump(exclude_none=True))


@router.delete("/{product_id}", status_code=204)
def archive_product(
    product_id: UUID,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN]))
):
    admin_service.archive_product(session, product_id)
