from sqlalchemy.orm import Session

from app.models import Order
from app.repositories import order_repository
from app.schemas.common import Page
from app.schemas.order import OrderOut


def to_order_out(order: Order) -> OrderOut:
    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        order_date=order.order_date,
        customer_name=order.customer.name,
        product_name=order.product.name,
        category=order.product.category.name,
        quantity=order.quantity,
        total_amount=order.total_amount,
        status=order.status,
    )


def get_orders(db: Session, limit: int, offset: int, status: str | None) -> Page[OrderOut]:
    orders, total = order_repository.list_orders(db, limit, offset, status)
    return Page[OrderOut](items=[to_order_out(o) for o in orders], total=total, limit=limit, offset=offset)
