from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.activity import ActivityOut
from app.schemas.common import Page
from app.services.activity_service import get_activities

router = APIRouter(prefix="/api/activities", tags=["Activities"])


@router.get("", response_model=Page[ActivityOut])
def read_activities(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return get_activities(db, limit, offset)
