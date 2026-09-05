from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field

class AuditLog(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id")
    user_id: UUID = Field(foreign_key="user.id")
    action: str
    reason: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
