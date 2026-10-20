import datetime as dt
from typing import Generic, Literal, TypeVar

from app.schemas.base import CamelModel

T = TypeVar("T")

OrderStatus = Literal["pending", "processing", "shipped", "delivered", "cancelled"]


class Page(CamelModel, Generic[T]):
    items: list[T]
    total: int
    limit: int
    offset: int


class ReportPeriod(CamelModel):
    start_date: dt.date
    end_date: dt.date
    days: int


class StatusCount(CamelModel):
    status: OrderStatus
    count: int


class OrdersSummary(CamelModel):
    total: int
    by_status: list[StatusCount]
