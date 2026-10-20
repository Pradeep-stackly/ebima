from datetime import date
from typing import Literal

from app.schemas.base import CamelModel


class CustomerOut(CamelModel):
    id: int
    name: str
    email: str
    registered_on: date
    status: Literal["active", "inactive"]
