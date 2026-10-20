from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Activity


def list_activities(db: Session, limit: int, offset: int) -> tuple[list[Activity], int]:
    total = db.scalar(select(func.count(Activity.id)))
    stmt = select(Activity).order_by(Activity.created_at.desc(), Activity.id.desc()).limit(limit).offset(offset)
    return list(db.scalars(stmt)), total or 0


def count_activities_since(db: Session, activity_type: str, since: datetime) -> int:
    stmt = select(func.count(Activity.id)).where(
        Activity.activity_type == activity_type,
        Activity.created_at >= since,
    )
    return db.scalar(stmt) or 0
