from datetime import date

from app.schemas.base import CamelModel
from app.schemas.common import OrderStatus


class OrderOut(CamelModel):
    id: int
    order_number: str
    order_date: date
    customer_name: str
    product_name: str
    category: str
    quantity: int
    total_amount: float
    status: OrderStatus
