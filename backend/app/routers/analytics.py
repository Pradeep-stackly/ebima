from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.analytics import AnalyticsOverviewResponse, ComparisonPeriod, RevenueTrendResponse
from app.services.analytics_service import get_overview, get_revenue_trend

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def read_overview(
    start_date: date | None = Query(None, description="YYYY-MM-DD, defaults to 30 days before end_date"),
    end_date: date | None = Query(None, description="YYYY-MM-DD, defaults to today (Asia/Kolkata)"),
    comparison_period: ComparisonPeriod = Query("previous", description="previous = same number of days just before start_date"),
    db: Session = Depends(get_db),
):
    return get_overview(db, start_date, end_date, comparison_period)


@router.get("/revenue-trend", response_model=RevenueTrendResponse)
def read_revenue_trend(
    start_date: date | None = Query(None, description="YYYY-MM-DD, defaults to 30 days before end_date"),
    end_date: date | None = Query(None, description="YYYY-MM-DD, defaults to today (Asia/Kolkata)"),
    db: Session = Depends(get_db),
):
    return get_revenue_trend(db, start_date, end_date)
