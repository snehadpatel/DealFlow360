"""Admin service — CRUD for Users, Customers, Products, Price Lists, Discount Rules, Warehouses, Upsell Rules."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.security import get_password_hash
from app.models.user import User, Role
from app.models.customer import Customer
from app.models.product import Product
from app.models.price_list import PriceList, PriceListItem
from app.models.discount_rule import DiscountRule, UpsellRule
from app.models.warehouse import Warehouse, StockInventory
from app.models.audit import AuditLog


# ─── Users ───────────────────────────────────────────────────────────────────

def list_users(session: Session) -> List[User]:
    return session.exec(select(User).order_by(User.created_at.desc())).all()

def get_user_or_404(session: Session, user_id: UUID) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def create_user(session: Session, name: str, email: str, password: str, role: str) -> User:
    existing = session.exec(select(User).where(User.email == email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(name=name, email=email, password_hash=get_password_hash(password), role=Role(role))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def update_user(session: Session, user_id: UUID, **kwargs) -> User:
    user = get_user_or_404(session, user_id)
    for key, val in kwargs.items():
        if val is not None and hasattr(user, key):
            if key == "role":
                setattr(user, key, Role(val))
            else:
                setattr(user, key, val)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def reset_password(session: Session, user_id: UUID, new_password: str) -> User:
    user = get_user_or_404(session, user_id)
    user.password_hash = get_password_hash(new_password)
    session.add(user)
    session.commit()
    return user

def toggle_user_active(session: Session, user_id: UUID, is_active: bool) -> User:
    user = get_user_or_404(session, user_id)
    user.is_active = is_active
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user_id: UUID) -> None:
    u = session.get(User, user_id)
    if u:
        session.delete(u)
        session.commit()


# ─── Customers ───────────────────────────────────────────────────────────────

def list_customers(session: Session, rep_id: Optional[UUID] = None) -> List[Customer]:
    stmt = select(Customer).order_by(Customer.created_at.desc())
    if rep_id:
        stmt = stmt.where(Customer.rep_id == rep_id)
    return session.exec(stmt).all()

def get_customer_or_404(session: Session, customer_id: UUID) -> Customer:
    c = session.get(Customer, customer_id)
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return c

def create_customer(session: Session, **kwargs) -> Customer:
    customer = Customer(**kwargs)
    customer.updated_at = datetime.utcnow()
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

def update_customer(session: Session, customer_id: UUID, **kwargs) -> Customer:
    c = get_customer_or_404(session, customer_id)
    for key, val in kwargs.items():
        if val is not None and hasattr(c, key):
            setattr(c, key, val)
    c.updated_at = datetime.utcnow()
    session.add(c)
    session.commit()
    session.refresh(c)
    return c

def delete_customer(session: Session, customer_id: UUID) -> None:
    c = session.get(Customer, customer_id)
    if c:
        session.delete(c)
        session.commit()


# ─── Products ────────────────────────────────────────────────────────────────

def list_products(session: Session, include_archived: bool = False) -> List[Product]:
    stmt = select(Product)
    if not include_archived:
        stmt = stmt.where(Product.is_archived == False)
    return session.exec(stmt.order_by(Product.name)).all()

def get_product_or_404(session: Session, product_id: UUID) -> Product:
    p = session.get(Product, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p

def create_product(session: Session, **kwargs) -> Product:
    product = Product(**kwargs)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

def update_product(session: Session, product_id: UUID, **kwargs) -> Product:
    p = get_product_or_404(session, product_id)
    for key, val in kwargs.items():
        if val is not None and hasattr(p, key):
            setattr(p, key, val)
    session.add(p)
    session.commit()
    session.refresh(p)
    return p

def archive_product(session: Session, product_id: UUID) -> Product:
    p = get_product_or_404(session, product_id)
    p.is_archived = True
    p.active = False
    session.add(p)
    session.commit()
    session.refresh(p)
    return p


# ─── Price Lists ─────────────────────────────────────────────────────────────

def list_price_lists(session: Session) -> List[PriceList]:
    return session.exec(select(PriceList).order_by(PriceList.created_at.desc())).all()

def get_price_list_or_404(session: Session, price_list_id: UUID) -> PriceList:
    pl = session.get(PriceList, price_list_id)
    if not pl:
        raise HTTPException(status_code=404, detail="Price list not found")
    return pl

def create_price_list(session: Session, **kwargs) -> PriceList:
    pl = PriceList(**kwargs)
    session.add(pl)
    session.commit()
    session.refresh(pl)
    return pl

def add_price_list_item(session: Session, price_list_id: UUID, product_id: UUID, price: float) -> PriceListItem:
    item = PriceListItem(price_list_id=price_list_id, product_id=product_id, price=price)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

def list_price_list_items(session: Session, price_list_id: UUID) -> List[PriceListItem]:
    return session.exec(select(PriceListItem).where(PriceListItem.price_list_id == price_list_id)).all()


# ─── Discount Rules ───────────────────────────────────────────────────────────

def list_discount_rules(session: Session) -> List[DiscountRule]:
    return session.exec(select(DiscountRule).order_by(DiscountRule.created_at.desc())).all()

def create_discount_rule(session: Session, **kwargs) -> DiscountRule:
    rule = DiscountRule(**kwargs)
    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule

def update_discount_rule(session: Session, rule_id: UUID, **kwargs) -> DiscountRule:
    rule = session.get(DiscountRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Discount rule not found")
    for key, val in kwargs.items():
        if val is not None and hasattr(rule, key):
            setattr(rule, key, val)
    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule

def delete_discount_rule(session: Session, rule_id: UUID):
    rule = session.get(DiscountRule, rule_id)
    if rule:
        session.delete(rule)
        session.commit()


# ─── Upsell Rules ─────────────────────────────────────────────────────────────

def list_upsell_rules(session: Session) -> List[UpsellRule]:
    return session.exec(select(UpsellRule).order_by(UpsellRule.priority)).all()

def create_upsell_rule(session: Session, **kwargs) -> UpsellRule:
    rule = UpsellRule(**kwargs)
    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule

def delete_upsell_rule(session: Session, rule_id: UUID):
    rule = session.get(UpsellRule, rule_id)
    if rule:
        session.delete(rule)
        session.commit()


# ─── Warehouses ───────────────────────────────────────────────────────────────

def list_warehouses(session: Session) -> List[Warehouse]:
    return session.exec(select(Warehouse).order_by(Warehouse.priority)).all()

def get_warehouse_or_404(session: Session, warehouse_id: UUID) -> Warehouse:
    w = session.get(Warehouse, warehouse_id)
    if not w:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return w

def create_warehouse(session: Session, **kwargs) -> Warehouse:
    w = Warehouse(**kwargs)
    session.add(w)
    session.commit()
    session.refresh(w)
    return w

def update_warehouse(session: Session, warehouse_id: UUID, **kwargs) -> Warehouse:
    w = get_warehouse_or_404(session, warehouse_id)
    for key, val in kwargs.items():
        if val is not None and hasattr(w, key):
            setattr(w, key, val)
    session.add(w)
    session.commit()
    session.refresh(w)
    return w

def list_stock(session: Session, warehouse_id: Optional[UUID] = None, product_id: Optional[UUID] = None) -> List[StockInventory]:
    stmt = select(StockInventory)
    if warehouse_id:
        stmt = stmt.where(StockInventory.warehouse_id == warehouse_id)
    if product_id:
        stmt = stmt.where(StockInventory.product_id == product_id)
    return session.exec(stmt).all()

def upsert_stock(session: Session, warehouse_id: UUID, product_id: UUID, **kwargs) -> StockInventory:
    stock = session.exec(
        select(StockInventory).where(
            StockInventory.warehouse_id == warehouse_id,
            StockInventory.product_id == product_id
        )
    ).first()
    if not stock:
        stock = StockInventory(warehouse_id=warehouse_id, product_id=product_id)
    for key, val in kwargs.items():
        if val is not None and hasattr(stock, key):
            setattr(stock, key, val)
    session.add(stock)
    session.commit()
    session.refresh(stock)
    return stock


# ─── Audit Logs ───────────────────────────────────────────────────────────────

def list_audit_logs(session: Session, limit: int = 200) -> List[AuditLog]:
    return session.exec(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)).all()
