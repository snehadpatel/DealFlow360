from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field

class ApprovalStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ApprovalRequest(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id")
    approver_role: str  # MANAGER, FINANCE
    status: ApprovalStatus = Field(default=ApprovalStatus.PENDING)
    reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
