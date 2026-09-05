"""SQLModel database models.

Importing this package registers every table on ``SQLModel.metadata`` so that
``init_db()`` and Alembic autogenerate see the complete schema.
"""
from app.models.user import User, Role
from app.models.customer import Customer, Tier, CustomerStatus
from app.models.product import Product
from app.models.quotation import (
    Quotation,
    QuotationLine,
    QuotationVersion,
    QuoteStatus,
    RiskLevel,
)
from app.models.approval import ApprovalRequest, ApprovalStatus
from app.models.audit import AuditLog
from app.models.warehouse import Warehouse, StockInventory
from app.models.price_list import PriceList, PriceListItem
from app.models.discount_rule import DiscountRule, UpsellRule
from app.models.order import Order, OrderLine, Shipment, Backorder, OrderStatus, ShipmentStatus
from app.models.invoice import Invoice, Payment, CreditNote, InvoiceStatus
from app.models.subscription import SubscriptionPlan, CustomerSubscription, BillingCycle, SubscriptionStatus
from app.models.negotiation import Negotiation, NegotiationMessage, NegotiationStatus
from app.models.notification import Notification

try:  # pragma: no cover - optional teammate modules
    from app.models.portal import *  # noqa: F401,F403
except Exception:  # pragma: no cover
    pass

__all__ = [
    "User", "Role",
    "Customer", "Tier", "CustomerStatus",
    "Product",
    "Quotation", "QuotationLine", "QuotationVersion", "QuoteStatus", "RiskLevel",
    "ApprovalRequest", "ApprovalStatus",
    "AuditLog",
    "Warehouse", "StockInventory",
    "PriceList", "PriceListItem",
    "DiscountRule", "UpsellRule",
    "Order", "OrderLine", "Shipment", "Backorder", "OrderStatus", "ShipmentStatus",
    "Invoice", "Payment", "CreditNote", "InvoiceStatus",
    "SubscriptionPlan", "CustomerSubscription", "BillingCycle", "SubscriptionStatus",
    "Negotiation", "NegotiationMessage", "NegotiationStatus",
    "Notification",
]
