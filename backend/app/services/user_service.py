from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.core.permissions import AccountStatus, UserRole
from app.core.security import hash_password
from app.models import User
from app.repositories import user_repository
from app.schemas.common import Page
from app.schemas.user import UserCreate, UserOut


def get_users(db: Session, limit: int, offset: int) -> Page[UserOut]:
    users, total = user_repository.list_users(db, limit, offset)
    return Page[UserOut](items=[UserOut.model_validate(u) for u in users], total=total, limit=limit, offset=offset)


def create_user(db: Session, data: UserCreate) -> UserOut:
    if user_repository.get_by_email(db, data.email):
        raise ConflictError("A user with this email already exists")

    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role.value,
        status=AccountStatus.ACTIVE.value,
    )
    return UserOut.model_validate(user_repository.add(db, user))


def get_user_or_404(db: Session, user_id: int) -> User:
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return user


def ensure_admin_remains(db: Session, user: User, new_role: str, new_status: str) -> None:
    removes_admin = (
        user.role == UserRole.ADMIN.value
        and user.is_active
        and (new_role != UserRole.ADMIN.value or new_status != AccountStatus.ACTIVE.value)
    )
    if removes_admin and user_repository.count_active_admins(db) <= 1:
        raise ConflictError("At least one active admin is required")


def change_role(db: Session, user_id: int, role: UserRole) -> UserOut:
    user = get_user_or_404(db, user_id)
    ensure_admin_remains(db, user, role.value, user.status)
    user.role = role.value
    return UserOut.model_validate(user_repository.save(db, user))


def change_status(db: Session, user_id: int, status: AccountStatus, current_user: User) -> UserOut:
    user = get_user_or_404(db, user_id)
    if user.id == current_user.id and status == AccountStatus.DISABLED:
        raise ConflictError("You cannot disable your own account")
    ensure_admin_remains(db, user, user.role, status.value)
    user.status = status.value
    return UserOut.model_validate(user_repository.save(db, user))
