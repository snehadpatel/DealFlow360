from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field

class Product(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    category: str  # Hardware, Services, Subscription
    price: float
    cost: float
    discount_ceiling: float = Field(default=20.0)  # Max discount % allowed without escalation
