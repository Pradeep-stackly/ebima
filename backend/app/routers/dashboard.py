from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_permission
from app.core.permissions import Permission
from app.db.session import get_db
from app.models import User
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import get_dashboard

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def read_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission(Permission.VIEW_DASHBOARD)),
):
    return get_dashboard(db, user)
