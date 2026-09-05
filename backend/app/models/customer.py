from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field


class Tier(str, Enum):
    """Customer loyalty tier. Higher tiers are more trusted and lower risk,
    and are granted higher negotiated discount ceilings by the rule engine."""
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"


class Customer(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    tier: Tier = Field(default=Tier.BRONZE)
    email: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
