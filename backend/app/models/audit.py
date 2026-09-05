from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text


class AuditLog(SQLModel, table=True):
    """Append-only trail of every material action taken on a quotation:
    creation, edits, discount changes, approvals, rejections, negotiations,
    and automatic re-approvals. Old/new values make changes fully traceable."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quotation_id: Optional[UUID] = Field(default=None, foreign_key="quotation.id", index=True)
    user_id: Optional[UUID] = Field(default=None, foreign_key="user.id")
    action: str                                    # e.g. DISCOUNT_CHANGED (see audit_service)
    reason: Optional[str] = Field(default=None)
    old_value: Optional[str] = Field(default=None, sa_column=Column(Text))
    new_value: Optional[str] = Field(default=None, sa_column=Column(Text))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
