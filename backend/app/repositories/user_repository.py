from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.permissions import AccountStatus, UserRole
from app.models import User


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(func.lower(User.email) == email.lower()))


def list_users(db: Session, limit: int, offset: int) -> tuple[list[User], int]:
    total = db.scalar(select(func.count(User.id)))
    stmt = select(User).order_by(User.created_at, User.id).limit(limit).offset(offset)
    return list(db.scalars(stmt)), total or 0


def count_active_admins(db: Session) -> int:
    stmt = select(func.count(User.id)).where(
        User.role == UserRole.ADMIN.value,
        User.status == AccountStatus.ACTIVE.value,
    )
    return db.scalar(stmt) or 0


def add(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def save(db: Session, user: User) -> User:
    db.commit()
    db.refresh(user)
    return user
