from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field

class PortalNegotiation(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id")
    customer_note: str
    counter_discount: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
