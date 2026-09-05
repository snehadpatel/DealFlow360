from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import SQLModel, Field


class ApprovalStatus(str, Enum):
    PENDING = "PENDING"          # Awaiting approver action
    APPROVED = "APPROVED"        # Approver signed off
    REJECTED = "REJECTED"        # Approver rejected the quote
    RETURNED = "RETURNED"        # Sent back to the rep for revision
    INVALIDATED = "INVALIDATED"  # Superseded by a re-approval / new version


class ApprovalRequest(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: UUID = Field(foreign_key="quotation.id", index=True)
    approver_role: str                       # MANAGER, FINANCE, ...
    approval_level: int = Field(default=1)    # Ordering within the chain (1 acts first)
    status: ApprovalStatus = Field(default=ApprovalStatus.PENDING)
    # The quote version this approval was requested for. Used to detect when an
    # approved quote has been materially changed and needs re-approval.
    quote_version: int = Field(default=1)
    approver_id: Optional[UUID] = Field(default=None, foreign_key="user.id")
    reason: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = Field(default=None)
