import os
from datetime import date
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import Category, Customer, Order, Product, User

TEST_PASSWORD = "Password123"


def get_test_database_url():
    url = os.getenv("TEST_DATABASE_URL")
    if url:
        return make_url(url)
    real = make_url(settings.database_url)
    return real.set(database=f"{real.database}_test")


def create_database_if_missing(url):
    server = create_engine(url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with server.connect() as conn:
        exists = conn.scalar(text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": url.database})
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{url.database}"'))
    server.dispose()


@pytest.fixture(scope="session")
def engine():
    url = get_test_database_url()
    assert url.database.endswith("_test"), "tests must never run against the real database"
    create_database_if_missing(url)

    engine = create_engine(url)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


# every test runs inside a transaction that is rolled back, so tests never see each other's data
@pytest.fixture
def db(engine):
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    yield session
    session.close()
    transaction.rollback()
    connection.close()


def make_user(db: Session, email: str, role: str = "viewer", status: str = "active") -> User:
    user = User(
        full_name=f"{role.title()} User",
        email=email,
        password_hash=hash_password(TEST_PASSWORD),
        role=role,
        status=status,
    )
    db.add(user)
    db.flush()
    return user


def auth_headers(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


@pytest.fixture
def users(db):
    return {role: make_user(db, f"{role}@example.com", role) for role in ("admin", "analyst", "viewer")}


# client without a token
@pytest.fixture
def api(db):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# client logged in as a viewer, used by the analytics tests
@pytest.fixture
def client(api, users):
    api.headers.update(auth_headers(users["viewer"]))
    return api


class Shop:
    """Small catalog plus a helper to add orders on specific dates."""

    def __init__(self, db: Session):
        self.db = db
        self.next_number = 1
        electronics = Category(name="Electronics")
        furniture = Category(name="Furniture")
        self.laptop = Product(sku="T-1", name="Laptop", category=electronics, unit_price=Decimal("1000"), cost_price=Decimal("600"))
        self.chair = Product(sku="T-2", name="Chair", category=furniture, unit_price=Decimal("500"), cost_price=Decimal("300"))
        self.customers = [
            Customer(name=f"Customer {i}", email=f"c{i}@test.com", registered_on=date(2026, 1, 1))
            for i in range(1, 4)
        ]
        db.add_all([electronics, furniture, self.laptop, self.chair, *self.customers])
        db.flush()

    def order(self, day: date, product: Product, quantity: int = 1, status: str = "delivered", customer: int = 0) -> Order:
        order = Order(
            order_number=f"T{self.next_number}",
            order_date=day,
            customer=self.customers[customer],
            product=product,
            quantity=quantity,
            total_amount=product.unit_price * quantity,
            status=status,
        )
        self.next_number += 1
        self.db.add(order)
        self.db.flush()
        return order


@pytest.fixture
def shop(db):
    return Shop(db)
