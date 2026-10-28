from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.auth import require_permission
from app.core.permissions import Permission
from app.db.session import get_db
from app.models import User
from app.schemas.common import Page
from app.schemas.user import RoleUpdate, StatusUpdate, UserCreate, UserOut
from app.services import user_service

router = APIRouter(prefix="/api/users", tags=["Users"])

manage_users = require_permission(Permission.MANAGE_USERS)


@router.get("", response_model=Page[UserOut], dependencies=[Depends(manage_users)])
def read_users(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return user_service.get_users(db, limit, offset)


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(manage_users)])
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, data)


@router.patch(
    "/{user_id}/role",
    response_model=UserOut,
    dependencies=[Depends(require_permission(Permission.CHANGE_USER_ROLES))],
)
def update_role(user_id: int, data: RoleUpdate, db: Session = Depends(get_db)):
    return user_service.change_role(db, user_id, data.role)


@router.patch("/{user_id}/status", response_model=UserOut)
def update_status(
    user_id: int,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manage_users),
):
    return user_service.change_status(db, user_id, data.status, current_user)
