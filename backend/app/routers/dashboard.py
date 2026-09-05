"""Role-aware dashboard router — replaces static stub with real DB stats."""
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db import get_session
from app.core.security import get_current_user
from app.models.user import User, Role
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_stats(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    """Returns role-specific dashboard KPIs computed from the DB."""
    if user.role == Role.ADMIN:
        return dashboard_service.admin_dashboard(session)
    elif user.role == Role.REP:
        return dashboard_service.rep_dashboard(session, user.id)
    elif user.role == Role.MANAGER:
        return dashboard_service.manager_dashboard(session)
    elif user.role == Role.FINANCE:
        return dashboard_service.finance_dashboard(session)
    elif user.role == Role.OPERATIONS:
        return dashboard_service.operations_dashboard(session)
    elif user.role == Role.CUSTOMER:
        customer_id = user.customer_id
        if customer_id:
            return dashboard_service.customer_dashboard(session, customer_id)
        return {}
    return {}
