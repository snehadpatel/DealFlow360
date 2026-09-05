from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field

class SubscriptionPlan(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    monthly_rate: float
    annual_rate: float
    billing_frequency: str = "monthly"  # monthly, annually
