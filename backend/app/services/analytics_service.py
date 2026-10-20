from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import InvalidDateRangeError
from app.repositories import order_repository
from app.schemas.analytics import RevenuePoint, RevenueTrendResponse
from app.utils.dates import DateRange, last_n_days

DEFAULT_RANGE_DAYS = 30
MAX_RANGE_DAYS = 366


def resolve_date_range(start_date: date | None, end_date: date | None) -> DateRange:
    end = end_date or date.today()
    start = start_date or last_n_days(DEFAULT_RANGE_DAYS, end).start

    if start > end:
        raise InvalidDateRangeError("start_date must be on or before end_date")
    if (end - start).days + 1 > MAX_RANGE_DAYS:
        raise InvalidDateRangeError(f"Date range cannot be longer than {MAX_RANGE_DAYS} days")
    return DateRange(start, end)


def get_daily_points(db: Session, period: DateRange) -> list[RevenuePoint]:
    rows = order_repository.get_daily_revenue(db, period.start, period.end)
    totals = {day: (revenue, orders) for day, revenue, orders in rows}

    points = []
    for day in period.each_day():
        revenue, orders = totals.get(day, (0, 0))
        points.append(RevenuePoint(date=day, revenue=revenue, orders=orders))
    return points


def get_revenue_trend(db: Session, start_date: date | None, end_date: date | None) -> RevenueTrendResponse:
    period = resolve_date_range(start_date, end_date)
    points = get_daily_points(db, period)
    return RevenueTrendResponse(
        start_date=period.start,
        end_date=period.end,
        total_revenue=sum(point.revenue for point in points),
        total_orders=sum(point.orders for point in points),
        points=points,
    )
