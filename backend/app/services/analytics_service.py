from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import InvalidDateRangeError
from app.models.order import ORDER_STATUSES
from app.repositories import order_repository
from app.repositories.order_repository import CategorySales, SalesTotals
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    CategoryPerformance,
    ComparisonPeriod,
    MetricComparison,
    OverviewMetrics,
    RevenuePoint,
    RevenueTrendResponse,
    SalesIndicators,
)
from app.schemas.common import OrdersSummary, ReportPeriod, StatusCount
from app.utils.dates import DateRange, last_n_days, today
from app.utils.metrics import percent_change, share_percent

DEFAULT_RANGE_DAYS = 30
MAX_RANGE_DAYS = 366


def resolve_date_range(start_date: date | None, end_date: date | None) -> DateRange:
    end = end_date or today()
    start = start_date or last_n_days(DEFAULT_RANGE_DAYS, end).start

    if start > end:
        raise InvalidDateRangeError("start_date must be on or before end_date")
    if (end - start).days + 1 > MAX_RANGE_DAYS:
        raise InvalidDateRangeError(f"Date range cannot be longer than {MAX_RANGE_DAYS} days")
    return DateRange(start, end)


def to_report_period(period: DateRange) -> ReportPeriod:
    return ReportPeriod(start_date=period.start, end_date=period.end, days=period.days)


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


def build_orders_summary(counts: dict[str, int]) -> OrdersSummary:
    return OrdersSummary(
        total=sum(counts.values()),
        by_status=[StatusCount(status=status, count=counts.get(status, 0)) for status in ORDER_STATUSES],
    )


def build_metric(value: Decimal | int, previous: Decimal | int | None) -> MetricComparison:
    return MetricComparison(
        value=value,
        previous=previous,
        change=None if previous is None else percent_change(value, previous),
    )


def build_metrics(current: SalesTotals, previous: SalesTotals | None) -> OverviewMetrics:
    profit = current.revenue - current.cost
    previous_profit = previous.revenue - previous.cost if previous else None
    return OverviewMetrics(
        revenue=build_metric(current.revenue, previous.revenue if previous else None),
        orders=build_metric(current.orders, previous.orders if previous else None),
        profit=build_metric(profit, previous_profit),
        customers=build_metric(current.customers, previous.customers if previous else None),
    )


def build_indicators(totals: SalesTotals, status: OrdersSummary) -> SalesIndicators:
    cancelled = next((s.count for s in status.by_status if s.status == "cancelled"), 0)
    average = totals.revenue / totals.orders if totals.orders else 0
    return SalesIndicators(
        average_order_value=round(average, 2),
        items_sold=totals.items,
        profit_margin=share_percent(totals.revenue - totals.cost, totals.revenue),
        cancellation_rate=share_percent(cancelled, status.total),
    )


def build_top_category(categories: list[CategorySales], total_revenue: Decimal) -> CategoryPerformance | None:
    if not categories:
        return None
    top = categories[0]
    return CategoryPerformance(
        name=top.name,
        revenue=top.revenue,
        orders=top.orders,
        items_sold=top.items,
        share=share_percent(top.revenue, total_revenue),
    )


def get_overview(
    db: Session,
    start_date: date | None,
    end_date: date | None,
    comparison_period: ComparisonPeriod,
) -> AnalyticsOverviewResponse:
    period = resolve_date_range(start_date, end_date)
    previous_period = period.previous() if comparison_period == "previous" else None

    periods = [period, previous_period] if previous_period else [period]
    totals = order_repository.get_sales_totals(db, periods)
    current = totals[0]
    previous = totals[1] if previous_period else None

    order_status = build_orders_summary(order_repository.get_status_counts(db, period.start, period.end))
    categories = order_repository.get_category_sales(db, period.start, period.end)

    return AnalyticsOverviewResponse(
        period=to_report_period(period),
        comparison_period=to_report_period(previous_period) if previous_period else None,
        has_data=order_status.total > 0,
        metrics=build_metrics(current, previous),
        indicators=build_indicators(current, order_status),
        revenue_trend=get_daily_points(db, period),
        order_status=order_status,
        top_category=build_top_category(categories, current.revenue),
    )
