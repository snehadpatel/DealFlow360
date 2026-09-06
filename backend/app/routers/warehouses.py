"""Replaces stub warehouse router with full CRUD + inventory management."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.schemas.admin_schemas import (
    WarehouseCreate, WarehouseUpdate, WarehouseResponse,
    StockUpdateRequest, StockResponse
)
from app.services import admin_service

router = APIRouter(prefix="/warehouses", tags=["warehouses"])


@router.get("", response_model=List[WarehouseResponse])
def list_warehouses(session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return admin_service.list_warehouses(session)


@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(warehouse_id: UUID, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return admin_service.get_warehouse_or_404(session, warehouse_id)


@router.post("", response_model=WarehouseResponse, status_code=201)
def create_warehouse(
    payload: WarehouseCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN]))
):
    return admin_service.create_warehouse(session, **payload.model_dump())


@router.put("/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(
    warehouse_id: UUID,
    payload: WarehouseUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN]))
):
    return admin_service.update_warehouse(session, warehouse_id, **payload.model_dump(exclude_none=True))


@router.delete("/{warehouse_id}", status_code=204)
def delete_warehouse(
    warehouse_id: UUID,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN]))
):
    """Soft-delete (deactivate) a warehouse."""
    admin_service.delete_warehouse(session, warehouse_id)


@router.get("/{warehouse_id}/stock", response_model=List[StockResponse])
def get_warehouse_stock(warehouse_id: UUID, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return admin_service.list_stock(session, warehouse_id=warehouse_id)


@router.put("/{warehouse_id}/stock/{product_id}", response_model=StockResponse)
def update_stock(
    warehouse_id: UUID,
    product_id: UUID,
    payload: StockUpdateRequest,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles([Role.ADMIN, Role.OPERATIONS]))
):
    return admin_service.upsert_stock(session, warehouse_id, product_id, **payload.model_dump(exclude_none=True))
