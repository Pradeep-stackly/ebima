from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import ColumnElement, distinct, func, select
from sqlalchemy.orm import Session, joinedload

from app.models import Category, Order, Product
from app.models.order import SALES_STATUSES
from app.utils.dates import DateRange


@dataclass
class SalesTotals:
    revenue: Decimal
    cost: Decimal
    orders: int
    customers: int
    items: int


@dataclass
class CategorySales:
    name: str
    revenue: Decimal
    orders: int
    items: int


def _totals_columns(condition: ColumnElement[bool]) -> list:
    return [
        func.coalesce(func.sum(Order.total_amount).filter(condition), 0),
        func.coalesce(func.sum(Order.quantity * Product.cost_price).filter(condition), 0),
        func.count(Order.id).filter(condition),
        func.count(distinct(Order.customer_id)).filter(condition),
        func.coalesce(func.sum(Order.quantity).filter(condition), 0),
    ]


# one query for all periods, each period's numbers come from a FILTER clause
def get_sales_totals(db: Session, periods: list[DateRange]) -> list[SalesTotals]:
    columns = []
    for period in periods:
        columns.extend(_totals_columns(Order.order_date.between(period.start, period.end)))

    stmt = (
        select(*columns)
        .join(Product, Order.product_id == Product.id)
        .where(
            Order.status.in_(SALES_STATUSES),
            Order.order_date.between(min(p.start for p in periods), max(p.end for p in periods)),
        )
    )
    row = db.execute(stmt).one()
    size = len(columns) // len(periods)
    return [SalesTotals(*row[i * size:(i + 1) * size]) for i in range(len(periods))]


def get_daily_revenue(db: Session, start: date, end: date) -> list[tuple[date, Decimal, int]]:
    stmt = (
        select(Order.order_date, func.sum(Order.total_amount), func.count(Order.id))
        .where(Order.order_date.between(start, end), Order.status.in_(SALES_STATUSES))
        .group_by(Order.order_date)
        .order_by(Order.order_date)
    )
    return [tuple(row) for row in db.execute(stmt)]


def get_status_counts(db: Session, start: date, end: date) -> dict[str, int]:
    stmt = (
        select(Order.status, func.count(Order.id))
        .where(Order.order_date.between(start, end))
        .group_by(Order.status)
    )
    return {status: count for status, count in db.execute(stmt)}


def get_category_sales(db: Session, start: date, end: date) -> list[CategorySales]:
    revenue = func.sum(Order.total_amount)
    stmt = (
        select(Category.name, revenue, func.count(Order.id), func.sum(Order.quantity))
        .join(Product, Product.category_id == Category.id)
        .join(Order, Order.product_id == Product.id)
        .where(Order.order_date.between(start, end), Order.status.in_(SALES_STATUSES))
        .group_by(Category.name)
        .order_by(revenue.desc(), Category.name)
    )
    return [CategorySales(*row) for row in db.execute(stmt)]


def list_orders(db: Session, limit: int, offset: int, status: str | None = None) -> tuple[list[Order], int]:
    filters = [Order.status == status] if status else []

    total = db.scalar(select(func.count(Order.id)).where(*filters))
    stmt = (
        select(Order)
        .options(joinedload(Order.customer), joinedload(Order.product).joinedload(Product.category))
        .where(*filters)
        .order_by(Order.order_date.desc(), Order.id.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(stmt)), total or 0
