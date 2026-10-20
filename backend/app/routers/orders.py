from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.common import OrderStatus, Page
from app.schemas.order import OrderOut
from app.services.order_service import get_orders

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("", response_model=Page[OrderOut])
def read_orders(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: OrderStatus | None = None,
    db: Session = Depends(get_db),
):
    return get_orders(db, limit, offset, status)
