"""SQLModel database models.

Importing this package registers every table on ``SQLModel.metadata`` so that
``init_db()`` and Alembic autogenerate see the complete schema.
"""
from app.models.user import User, Role
from app.models.customer import Customer, Tier
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

# Optional modules present in the wider scaffold; imported defensively so the
# core Member-1 backend still loads if a teammate's module is mid-development.
try:  # pragma: no cover - optional teammate modules
    from app.models.portal import *  # noqa: F401,F403
except Exception:  # pragma: no cover
    pass
try:  # pragma: no cover - optional teammate modules
    from app.models.subscription import *  # noqa: F401,F403
except Exception:  # pragma: no cover
    pass

__all__ = [
    "User",
    "Role",
    "Customer",
    "Tier",
    "Product",
    "Quotation",
    "QuotationLine",
    "QuotationVersion",
    "QuoteStatus",
    "RiskLevel",
    "ApprovalRequest",
    "ApprovalStatus",
    "AuditLog",
    "Warehouse",
    "StockInventory",
]
