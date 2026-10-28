from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import User
from app.repositories import activity_repository, order_repository
from app.schemas.dashboard import (
    Analytics,
    DashboardKpis,
    DashboardResponse,
    KpiData,
    TopCategory,
    UserInfo,
)
from app.services.activity_service import to_activity_out
from app.services.analytics_service import build_orders_summary, get_daily_points, to_report_period
from app.utils.dates import DateRange, last_n_days
from app.utils.metrics import percent_change, share_percent


def get_kpis(db: Session, period: DateRange) -> DashboardKpis:
    current, previous = order_repository.get_sales_totals(db, [period, period.previous()])

    profit = current.revenue - current.cost
    previous_profit = previous.revenue - previous.cost

    return DashboardKpis(
        revenue=KpiData(value=current.revenue, change=percent_change(current.revenue, previous.revenue)),
        orders=KpiData(value=current.orders, change=percent_change(current.orders, previous.orders)),
        customers=KpiData(value=current.customers, change=percent_change(current.customers, previous.customers)),
        profit=KpiData(value=profit, change=percent_change(profit, previous_profit)),
    )


def get_top_category(db: Session, period: DateRange) -> TopCategory | None:
    current = order_repository.get_category_sales(db, period.start, period.end)
    if not current:
        return None

    previous_period = period.previous()
    previous_sales = order_repository.get_category_sales(db, previous_period.start, previous_period.end)
    previous = {c.name: c.revenue for c in previous_sales}

    top = current[0]
    total_revenue = sum(c.revenue for c in current)
    return TopCategory(
        name=top.name,
        revenue=top.revenue,
        share=share_percent(top.revenue, total_revenue),
        change=percent_change(top.revenue, previous.get(top.name, 0)),
    )


def get_dashboard(db: Session, user: User) -> DashboardResponse:
    period = last_n_days(settings.report_period_days)
    trend_period = last_n_days(settings.trend_days)
    activities, _ = activity_repository.list_activities(db, limit=settings.recent_activity_limit, offset=0)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    return DashboardResponse(
        user=UserInfo(name=user.full_name, role=user.role.capitalize()),
        unread_alerts=activity_repository.count_activities_since(db, "alert", week_ago),
        period=to_report_period(period),
        kpis=get_kpis(db, period),
        analytics=Analytics(
            revenue_trend=get_daily_points(db, trend_period),
            orders_summary=build_orders_summary(order_repository.get_status_counts(db, period.start, period.end)),
            top_category=get_top_category(db, period),
        ),
        recent_activities=[to_activity_out(a) for a in activities],
    )
