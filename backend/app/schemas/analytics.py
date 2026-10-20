import datetime as dt
from typing import Literal

from app.schemas.base import CamelModel


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
