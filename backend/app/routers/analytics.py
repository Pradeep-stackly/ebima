from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.analytics import RevenueTrendResponse
from app.services.analytics_service import get_revenue_trend

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/revenue-trend", response_model=RevenueTrendResponse)
def read_revenue_trend(
    start_date: date | None = Query(None, description="YYYY-MM-DD, defaults to 30 days before end_date"),
    end_date: date | None = Query(None, description="YYYY-MM-DD, defaults to today"),
    db: Session = Depends(get_db),
):
    return get_revenue_trend(db, start_date, end_date)
