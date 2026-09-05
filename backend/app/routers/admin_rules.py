"""Price lists, discount rules, upsell rules, and audit logs routers."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user, require_roles
from app.models.user import Role, User
from app.schemas.admin_schemas import (
    DiscountRuleCreate, DiscountRuleResponse,
    UpsellRuleCreate, UpsellRuleResponse,
    AuditLogResponse
)
from app.services import admin_service

# ─── Discount Rules ───────────────────────────────────────────────────────────
discount_router = APIRouter(prefix="/discount-rules", tags=["discount-rules"])

@discount_router.get("", response_model=List[DiscountRuleResponse])
def list_rules(session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return admin_service.list_discount_rules(session)

@discount_router.post("", response_model=DiscountRuleResponse, status_code=201)
def create_rule(payload: DiscountRuleCreate, session: Session = Depends(get_session), _: User = Depends(require_roles([Role.ADMIN]))):
    return admin_service.create_discount_rule(session, **payload.model_dump())

@discount_router.put("/{rule_id}", response_model=DiscountRuleResponse)
def update_rule(rule_id: UUID, payload: DiscountRuleCreate, session: Session = Depends(get_session), _: User = Depends(require_roles([Role.ADMIN]))):
    return admin_service.update_discount_rule(session, rule_id, **payload.model_dump(exclude_none=True))

@discount_router.delete("/{rule_id}", status_code=204)
def delete_rule(rule_id: UUID, session: Session = Depends(get_session), _: User = Depends(require_roles([Role.ADMIN]))):
    admin_service.delete_discount_rule(session, rule_id)


# ─── Upsell Rules ─────────────────────────────────────────────────────────────
upsell_router = APIRouter(prefix="/upsell-rules", tags=["upsell-rules"])

@upsell_router.get("", response_model=List[UpsellRuleResponse])
def list_upsell(session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return admin_service.list_upsell_rules(session)

@upsell_router.post("", response_model=UpsellRuleResponse, status_code=201)
def create_upsell(payload: UpsellRuleCreate, session: Session = Depends(get_session), _: User = Depends(require_roles([Role.ADMIN]))):
    return admin_service.create_upsell_rule(session, **payload.model_dump())

@upsell_router.delete("/{rule_id}", status_code=204)
def delete_upsell(rule_id: UUID, session: Session = Depends(get_session), _: User = Depends(require_roles([Role.ADMIN]))):
    admin_service.delete_upsell_rule(session, rule_id)


# ─── Audit Logs ───────────────────────────────────────────────────────────────
audit_router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])

@audit_router.get("", response_model=List[AuditLogResponse])
def list_audit_logs(session: Session = Depends(get_session), _: User = Depends(require_roles([Role.ADMIN, Role.MANAGER]))):
    return admin_service.list_audit_logs(session)


# ─── Price Lists ─────────────────────────────────────────────────────────────
from app.schemas.admin_schemas import PriceListCreate, PriceListResponse, PriceListItemCreate

price_list_router = APIRouter(prefix="/price-lists", tags=["price-lists"])

@price_list_router.get("", response_model=List[PriceListResponse])
def list_price_lists(session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return admin_service.list_price_lists(session)

@price_list_router.post("", response_model=PriceListResponse, status_code=201)
def create_price_list(payload: PriceListCreate, session: Session = Depends(get_session), _: User = Depends(require_roles([Role.ADMIN]))):
    return admin_service.create_price_list(session, **payload.model_dump())

@price_list_router.post("/{price_list_id}/items", status_code=201)
def add_item(price_list_id: UUID, payload: PriceListItemCreate, session: Session = Depends(get_session), _: User = Depends(require_roles([Role.ADMIN]))):
    return admin_service.add_price_list_item(session, price_list_id, payload.product_id, payload.price)

@price_list_router.get("/{price_list_id}/items")
def list_items(price_list_id: UUID, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    return admin_service.list_price_list_items(session, price_list_id)
