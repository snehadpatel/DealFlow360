"""Pydantic schemas for Admin CRUD operations."""
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel, EmailStr


# ─── Users ──────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "REP"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    manager_id: Optional[UUID] = None

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True

class PasswordReset(BaseModel):
    new_password: str


# ─── Customers ───────────────────────────────────────────────────────────────

class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    tier: str = "BRONZE"
    address_billing: Optional[str] = None
    address_shipping: Optional[str] = None
    tax_id: Optional[str] = None
    rep_id: Optional[UUID] = None
    credit_limit: float = 0.0
    payment_terms: Optional[str] = "Net 30"

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    tier: Optional[str] = None
    address_billing: Optional[str] = None
    address_shipping: Optional[str] = None
    tax_id: Optional[str] = None
    rep_id: Optional[UUID] = None
    status: Optional[str] = None
    credit_limit: Optional[float] = None
    payment_terms: Optional[str] = None

class CustomerResponse(BaseModel):
    id: UUID
    name: str
    email: Optional[str]
    phone: Optional[str]
    tier: str
    address_billing: Optional[str]
    address_shipping: Optional[str]
    tax_id: Optional[str]
    rep_id: Optional[UUID]
    status: str
    credit_limit: float
    payment_terms: Optional[str]
    created_at: datetime
    class Config: from_attributes = True


# ─── Products ────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: str
    description: Optional[str] = None
    price: float
    cost: float
    discount_ceiling: float = 20.0
    tax_rate: float = 0.0
    unit: str = "unit"
    variants: Optional[str] = None
    image_url: Optional[str] = None
    stock: Optional[int] = 0

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    discount_ceiling: Optional[float] = None
    tax_rate: Optional[float] = None
    unit: Optional[str] = None
    variants: Optional[str] = None
    image_url: Optional[str] = None
    active: Optional[bool] = None
    is_archived: Optional[bool] = None
    stock: Optional[int] = None

class ProductResponse(BaseModel):
    id: UUID
    name: str
    sku: Optional[str]
    category: str
    description: Optional[str]
    price: float
    cost: float
    discount_ceiling: float
    tax_rate: float
    unit: str
    active: bool
    is_archived: bool
    stock: Optional[int] = 0
    class Config: from_attributes = True


# ─── Price Lists ─────────────────────────────────────────────────────────────

class PriceListCreate(BaseModel):
    name: str
    tier: Optional[str] = None
    currency: str = "INR"
    effective_from: Optional[date] = None
    expires_at: Optional[date] = None

class PriceListItemCreate(BaseModel):
    product_id: UUID
    price: float

class PriceListResponse(BaseModel):
    id: UUID
    name: str
    tier: Optional[str]
    currency: str
    effective_from: Optional[date]
    expires_at: Optional[date]
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True


# ─── Discount Rules ───────────────────────────────────────────────────────────

class DiscountRuleCreate(BaseModel):
    tier: Optional[str] = None
    category: Optional[str] = None
    max_discount: float = 20.0
    min_margin: float = 12.0
    manager_approval_threshold: float = 15.0
    finance_approval_threshold: float = 20.0

class DiscountRuleResponse(BaseModel):
    id: UUID
    tier: Optional[str]
    category: Optional[str]
    max_discount: float
    min_margin: float
    manager_approval_threshold: float
    finance_approval_threshold: float
    created_at: datetime
    class Config: from_attributes = True


# ─── Upsell Rules ─────────────────────────────────────────────────────────────

class UpsellRuleCreate(BaseModel):
    product_id: UUID
    recommended_product_id: UUID
    promotion: Optional[str] = None
    priority: int = 1
    min_margin_impact: float = 0.0

class UpsellRuleResponse(BaseModel):
    id: UUID
    product_id: UUID
    recommended_product_id: UUID
    promotion: Optional[str]
    priority: int
    min_margin_impact: float
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True


# ─── Warehouses ───────────────────────────────────────────────────────────────

class WarehouseCreate(BaseModel):
    name: str
    location: str
    city: Optional[str] = None
    replenishment_threshold: int = 10
    shipping_cost: float = 0.0
    priority: int = 1

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    is_active: Optional[bool] = None
    replenishment_threshold: Optional[int] = None
    shipping_cost: Optional[float] = None
    priority: Optional[int] = None

class WarehouseResponse(BaseModel):
    id: UUID
    name: str
    location: str
    city: Optional[str]
    is_active: bool
    replenishment_threshold: int
    shipping_cost: float
    priority: int
    class Config: from_attributes = True

class StockUpdateRequest(BaseModel):
    available_units: Optional[int] = None
    reserved_units: Optional[int] = None
    incoming_units: Optional[int] = None
    reorder_level: Optional[int] = None

class StockResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    product_id: UUID
    available_units: int
    reserved_units: int
    incoming_units: int
    reorder_level: int
    class Config: from_attributes = True


# ─── Audit Logs ───────────────────────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    id: UUID
    quotation_id: Optional[UUID]
    user_id: Optional[UUID]
    action: str
    reason: Optional[str]
    old_value: Optional[str]
    new_value: Optional[str]
    timestamp: datetime
    class Config: from_attributes = True
