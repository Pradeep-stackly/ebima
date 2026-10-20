from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.common import Page
from app.schemas.customer import CustomerOut
from app.services.customer_service import get_customers

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.get("", response_model=Page[CustomerOut])
def read_customers(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return get_customers(db, limit, offset)
