from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field

class Tier(str, Enum):
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"

class Customer(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    tier: Tier = Field(default=Tier.BRONZE)
