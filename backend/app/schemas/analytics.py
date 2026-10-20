import datetime as dt
from typing import Literal

from app.schemas.base import CamelModel
from app.schemas.common import OrdersSummary, ReportPeriod

ComparisonPeriod = Literal["previous", "none"]


class RevenuePoint(CamelModel):
    date: dt.date
    revenue: float
    orders: int


class RevenueTrendResponse(CamelModel):
    start_date: dt.date
    end_date: dt.date
    interval: Literal["day"] = "day"
    total_revenue: float
    total_orders: int
    points: list[RevenuePoint]


class MetricComparison(CamelModel):
    value: float
    previous: float | None
    change: float | None


class OverviewMetrics(CamelModel):
    revenue: MetricComparison
    orders: MetricComparison
    profit: MetricComparison
    customers: MetricComparison


class SalesIndicators(CamelModel):
    average_order_value: float
    items_sold: int
    profit_margin: float
    cancellation_rate: float


class CategoryPerformance(CamelModel):
    name: str
    revenue: float
    orders: int
    items_sold: int
    share: float


class AnalyticsOverviewResponse(CamelModel):
    period: ReportPeriod
    comparison_period: ReportPeriod | None
    has_data: bool
    metrics: OverviewMetrics
    indicators: SalesIndicators
    revenue_trend: list[RevenuePoint]
    order_status: OrdersSummary
    top_category: CategoryPerformance | None
