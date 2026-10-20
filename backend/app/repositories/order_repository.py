from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import distinct, func, select
from sqlalchemy.orm import Session, joinedload

from app.models import Category, Order, Product
from app.models.order import SALES_STATUSES


@dataclass
class SalesTotals:
    revenue: Decimal
    cost: Decimal
    orders: int
    customers: int


def get_sales_totals(db: Session, start: date, end: date) -> SalesTotals:
    stmt = (
        select(
            func.coalesce(func.sum(Order.total_amount), 0),
            func.coalesce(func.sum(Order.quantity * Product.cost_price), 0),
            func.count(Order.id),
            func.count(distinct(Order.customer_id)),
        )
        .join(Product, Order.product_id == Product.id)
        .where(Order.order_date.between(start, end), Order.status.in_(SALES_STATUSES))
    )
    revenue, cost, orders, customers = db.execute(stmt).one()
    return SalesTotals(revenue=revenue, cost=cost, orders=orders, customers=customers)


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


def get_revenue_by_category(db: Session, start: date, end: date) -> list[tuple[str, Decimal]]:
    revenue = func.sum(Order.total_amount)
    stmt = (
        select(Category.name, revenue)
        .join(Product, Product.category_id == Category.id)
        .join(Order, Order.product_id == Product.id)
        .where(Order.order_date.between(start, end), Order.status.in_(SALES_STATUSES))
        .group_by(Category.name)
        .order_by(revenue.desc())
    )
    return [tuple(row) for row in db.execute(stmt)]


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
