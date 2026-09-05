"""Notification service — create and manage in-app notifications."""
from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select

from app.models.notification import Notification


def create_notification(session: Session, user_id: UUID, title: str, body: str,
                         category: Optional[str] = None, reference_id: Optional[str] = None) -> Notification:
    n = Notification(user_id=user_id, title=title, body=body, category=category, reference_id=reference_id)
    session.add(n)
    session.commit()
    session.refresh(n)
    return n


def list_notifications(session: Session, user_id: UUID, unread_only: bool = False) -> List[Notification]:
    stmt = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    if unread_only:
        stmt = stmt.where(Notification.is_read == False)
    return session.exec(stmt).all()


def mark_read(session: Session, notification_id: UUID) -> Notification:
    n = session.get(Notification, notification_id)
    if n:
        n.is_read = True
        session.add(n)
        session.commit()
        session.refresh(n)
    return n


def mark_all_read(session: Session, user_id: UUID):
    notifs = session.exec(
        select(Notification).where(Notification.user_id == user_id).where(Notification.is_read == False)
    ).all()
    for n in notifs:
        n.is_read = True
        session.add(n)
    session.commit()


def unread_count(session: Session, user_id: UUID) -> int:
    return len(session.exec(
        select(Notification).where(Notification.user_id == user_id).where(Notification.is_read == False)
    ).all())
