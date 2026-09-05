from typing import Optional
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field

class Role(str, Enum):
    REP = "REP"
    MANAGER = "MANAGER"
    FINANCE = "FINANCE"
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"

class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: Role = Field(default=Role.REP)
    customer_id: Optional[UUID] = Field(default=None, foreign_key="customer.id")
