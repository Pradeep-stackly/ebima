from typing import Generic, Literal, TypeVar

from app.schemas.base import CamelModel

T = TypeVar("T")

OrderStatus = Literal["pending", "processing", "shipped", "delivered", "cancelled"]


class Page(CamelModel, Generic[T]):
    items: list[T]
    total: int
    limit: int
    offset: int
