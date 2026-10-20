from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Customer


def list_customers(db: Session, limit: int, offset: int) -> tuple[list[Customer], int]:
    total = db.scalar(select(func.count(Customer.id)))
    stmt = select(Customer).order_by(Customer.registered_on.desc(), Customer.id).limit(limit).offset(offset)
    return list(db.scalars(stmt)), total or 0
