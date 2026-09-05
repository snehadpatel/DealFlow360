"""In-app notification model."""
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text


class Notification(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    title: str
    body: str = Field(sa_column=Column(Text))
    category: Optional[str] = Field(default=None)        # APPROVAL, ORDER, NEGOTIATION, etc.
    reference_id: Optional[str] = Field(default=None)    # Quote ID / Order ID / etc.
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
