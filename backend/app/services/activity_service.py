from sqlalchemy.orm import Session

from app.models import Activity
from app.repositories import activity_repository
from app.schemas.activity import ActivityOut
from app.schemas.common import Page


def to_activity_out(activity: Activity) -> ActivityOut:
    return ActivityOut(
        id=activity.id,
        type=activity.activity_type,
        title=activity.title,
        subtitle=activity.description,
        reference_id=activity.reference_id,
        amount=activity.amount,
        timestamp=activity.created_at,
    )


def get_activities(db: Session, limit: int, offset: int) -> Page[ActivityOut]:
    activities, total = activity_repository.list_activities(db, limit, offset)
    return Page[ActivityOut](
        items=[to_activity_out(a) for a in activities],
        total=total,
        limit=limit,
        offset=offset,
    )
