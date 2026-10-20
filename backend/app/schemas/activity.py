from datetime import datetime
from typing import Literal

from app.schemas.base import CamelModel

ActivityType = Literal["order", "target", "customer", "payment", "alert"]


class ActivityOut(CamelModel):
    id: int
    type: ActivityType
    title: str
    subtitle: str
    reference_id: str | None
    amount: float | None
    timestamp: datetime
