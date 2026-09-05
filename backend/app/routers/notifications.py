"""Notifications router — in-app notifications for all roles."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.services import notification_service
from pydantic import BaseModel

router = APIRouter(prefix="/notifications", tags=["notifications"])

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    body: str
    category: str | None
    reference_id: str | None
    is_read: bool
    created_at: str
    class Config: from_attributes = True


@router.get("", response_model=List[NotificationResponse])
def list_notifications(
    unread_only: bool = Query(default=False),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    notifs = notification_service.list_notifications(session, user.id, unread_only)
    return [NotificationResponse(
        id=n.id, user_id=n.user_id, title=n.title, body=n.body,
        category=n.category, reference_id=n.reference_id,
        is_read=n.is_read, created_at=n.created_at.isoformat()
    ) for n in notifs]


@router.get("/count")
def unread_count(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    return {"unread": notification_service.unread_count(session, user.id)}


@router.post("/{notification_id}/read")
def mark_read(notification_id: UUID, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    notification_service.mark_read(session, notification_id)
    return {"message": "Marked as read"}


@router.post("/read-all")
def mark_all_read(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    notification_service.mark_all_read(session, user.id)
    return {"message": "All notifications marked as read"}
