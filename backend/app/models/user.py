from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field


class Role(str, Enum):
    """Application roles used for authentication and role-based access control."""
    REP = "REP"                 # Sales representative (creates/edits quotes)
    MANAGER = "MANAGER"         # Sales manager (first approval tier)
    FINANCE = "FINANCE"         # Finance (second approval tier)
    OPERATIONS = "OPERATIONS"   # Operations / warehouse fulfilment
    CUSTOMER = "CUSTOMER"       # External buyer (portal access only)
    ADMIN = "ADMIN"             # Full administrative access


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: Role = Field(default=Role.REP)
    is_active: bool = Field(default=True)
    # A CUSTOMER user is linked to the customer account it can view in the portal.
    customer_id: Optional[UUID] = Field(default=None, foreign_key="customer.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
