from sqlalchemy.orm import Session

from app.repositories import customer_repository
from app.schemas.common import Page
from app.schemas.customer import CustomerOut


def get_customers(db: Session, limit: int, offset: int) -> Page[CustomerOut]:
    customers, total = customer_repository.list_customers(db, limit, offset)
    return Page[CustomerOut](
        items=[CustomerOut.model_validate(c) for c in customers],
        total=total,
        limit=limit,
        offset=offset,
    )
