from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order import ORDER_STATUSES
from app.repositories import activity_repository, order_repository
from app.schemas.dashboard import (
    Analytics,
    DashboardKpis,
    DashboardResponse,
    KpiData,
    OrdersSummary,
    ReportPeriod,
    StatusCount,
    TopCategory,
    UserInfo,
)
from app.services.activity_service import to_activity_out
from app.services.analytics_service import get_daily_points
from app.utils.dates import DateRange, last_n_days
from app.utils.metrics import percent_change, share_percent


def get_kpis(db: Session, period: DateRange) -> DashboardKpis:
    current = order_repository.get_sales_totals(db, period.start, period.end)
    previous_period = period.previous()
    previous = order_repository.get_sales_totals(db, previous_period.start, previous_period.end)

    profit = current.revenue - current.cost
    previous_profit = previous.revenue - previous.cost

    return DashboardKpis(
        revenue=KpiData(value=current.revenue, change=percent_change(current.revenue, previous.revenue)),
        orders=KpiData(value=current.orders, change=percent_change(current.orders, previous.orders)),
        customers=KpiData(value=current.customers, change=percent_change(current.customers, previous.customers)),
        profit=KpiData(value=profit, change=percent_change(profit, previous_profit)),
    )


def get_orders_summary(db: Session, period: DateRange) -> OrdersSummary:
    counts = order_repository.get_status_counts(db, period.start, period.end)
    return OrdersSummary(
        total=sum(counts.values()),
        by_status=[StatusCount(status=status, count=counts.get(status, 0)) for status in ORDER_STATUSES],
    )


def get_top_category(db: Session, period: DateRange) -> TopCategory | None:
    current = order_repository.get_revenue_by_category(db, period.start, period.end)
    if not current:
        return None

    previous_period = period.previous()
    previous = dict(order_repository.get_revenue_by_category(db, previous_period.start, previous_period.end))

    name, revenue = current[0]
    total_revenue = sum(value for _, value in current)
    return TopCategory(
        name=name,
        revenue=revenue,
        share=share_percent(revenue, total_revenue),
        change=percent_change(revenue, previous.get(name, 0)),
    )


def get_dashboard(db: Session) -> DashboardResponse:
    period = last_n_days(settings.report_period_days)
    trend_period = last_n_days(settings.trend_days)
    activities, _ = activity_repository.list_activities(db, limit=settings.recent_activity_limit, offset=0)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    return DashboardResponse(
        user=UserInfo(name="Pradeep", role="Business Analyst"),
        unread_alerts=activity_repository.count_activities_since(db, "alert", week_ago),
        period=ReportPeriod(start_date=period.start, end_date=period.end, days=period.days),
        kpis=get_kpis(db, period),
        analytics=Analytics(
            revenue_trend=get_daily_points(db, trend_period),
            orders_summary=get_orders_summary(db, period),
            top_category=get_top_category(db, period),
        ),
        recent_activities=[to_activity_out(a) for a in activities],
    )
