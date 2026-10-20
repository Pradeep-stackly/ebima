from app.schemas.activity import ActivityOut
from app.schemas.analytics import RevenuePoint
from app.schemas.base import CamelModel
from app.schemas.common import OrdersSummary, ReportPeriod


class KpiData(CamelModel):
    value: float
    change: float


class DashboardKpis(CamelModel):
    revenue: KpiData
    orders: KpiData
    customers: KpiData
    profit: KpiData


class TopCategory(CamelModel):
    name: str
    revenue: float
    share: float
    change: float


class Analytics(CamelModel):
    revenue_trend: list[RevenuePoint]
    orders_summary: OrdersSummary
    top_category: TopCategory | None


class UserInfo(CamelModel):
    name: str
    role: str


class DashboardResponse(CamelModel):
    user: UserInfo
    unread_alerts: int
    period: ReportPeriod
    kpis: DashboardKpis
    analytics: Analytics
    recent_activities: list[ActivityOut]
