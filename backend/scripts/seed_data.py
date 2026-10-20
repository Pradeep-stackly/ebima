import argparse
import random
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Activity, Category, Customer, Order, Product
from app.utils.dates import today as business_today

DAYS_OF_HISTORY = 60

CATEGORIES = ["Electronics", "Furniture", "Office Supplies", "Apparel", "Home & Kitchen"]

# sku, name, category, unit price, cost price
PRODUCTS = [
    ("EL-1001", "Laptop Pro 14", "Electronics", 72000, 58000),
    ("EL-1002", "Wireless Mouse", "Electronics", 1200, 650),
    ("EL-1003", "27 inch Monitor", "Electronics", 18500, 14200),
    ("EL-1004", "Noise Cancelling Headphones", "Electronics", 9800, 6900),
    ("FU-2001", "Ergonomic Office Chair", "Furniture", 14500, 9800),
    ("FU-2002", "Standing Desk", "Furniture", 28000, 19500),
    ("FU-2003", "Bookshelf", "Furniture", 6500, 4100),
    ("OS-3001", "A4 Paper Box", "Office Supplies", 1450, 980),
    ("OS-3002", "Whiteboard", "Office Supplies", 3200, 2100),
    ("OS-3003", "Printer Ink Pack", "Office Supplies", 2600, 1700),
    ("AP-4001", "Corporate T-Shirt", "Apparel", 650, 380),
    ("AP-4002", "Formal Blazer", "Apparel", 5400, 3300),
    ("HK-5001", "Coffee Machine", "Home & Kitchen", 12500, 8700),
    ("HK-5002", "Water Purifier", "Home & Kitchen", 15800, 11200),
    ("HK-5003", "Microwave Oven", "Home & Kitchen", 8900, 6400),
]

FIRST_NAMES = ["Arjun", "Priya", "Rahul", "Ananya", "Vikram", "Divya", "Karthik", "Sneha", "Rohan", "Meera"]
LAST_NAMES = ["Sharma", "Iyer", "Reddy", "Nair", "Gupta", "Menon"]


def reset_tables(db: Session) -> None:
    db.execute(text("TRUNCATE activities, orders, products, customers, categories RESTART IDENTITY CASCADE"))


def seed_categories(db: Session) -> dict[str, int]:
    db.execute(
        insert(Category)
        .values([{"name": name} for name in CATEGORIES])
        .on_conflict_do_nothing(index_elements=["name"])
    )
    return {c.name: c.id for c in db.scalars(select(Category))}


def seed_products(db: Session, category_ids: dict[str, int]) -> dict[str, Product]:
    rows = [
        {
            "sku": sku,
            "name": name,
            "category_id": category_ids[category],
            "unit_price": Decimal(price),
            "cost_price": Decimal(cost),
            "status": "active",
        }
        for sku, name, category, price, cost in PRODUCTS
    ]
    db.execute(insert(Product).values(rows).on_conflict_do_nothing(index_elements=["sku"]))
    return {p.sku: p for p in db.scalars(select(Product))}


def seed_customers(db: Session, rng: random.Random, today: date) -> dict[str, int]:
    rows = []
    for i, (first, last) in enumerate((f, l) for l in LAST_NAMES for f in FIRST_NAMES[:5]):
        rows.append(
            {
                "name": f"{first} {last}",
                "email": f"{first.lower()}.{last.lower()}{i}@example.com",
                "registered_on": today - timedelta(days=rng.randint(1, 365)),
                "status": "inactive" if i % 9 == 8 else "active",
            }
        )
    db.execute(insert(Customer).values(rows).on_conflict_do_nothing(index_elements=["email"]))
    return {c.email: c.id for c in db.scalars(select(Customer))}


def pick_status(rng: random.Random, age_days: int) -> str:
    if age_days <= 1:
        return rng.choice(["pending", "pending", "processing"])
    if age_days <= 5:
        return rng.choice(["processing", "shipped", "shipped", "cancelled"])
    return rng.choices(["delivered", "cancelled"], weights=[9, 1])[0]


def seed_orders(
    db: Session,
    rng: random.Random,
    today: date,
    products: dict[str, Product],
    customer_ids: dict[str, int],
) -> None:
    product_list = sorted(products.values(), key=lambda p: p.sku)
    customer_list = sorted(customer_ids.values())
    rows = []
    number = 1001

    for age_days in range(DAYS_OF_HISTORY, -1, -1):
        for _ in range(rng.randint(2, 6)):
            product = rng.choice(product_list)
            quantity = rng.randint(1, 4)
            rows.append(
                {
                    "order_number": f"ORD{number}",
                    "order_date": today - timedelta(days=age_days),
                    "customer_id": rng.choice(customer_list),
                    "product_id": product.id,
                    "quantity": quantity,
                    "total_amount": product.unit_price * quantity,
                    "status": pick_status(rng, age_days),
                }
            )
            number += 1

    db.execute(insert(Order).values(rows).on_conflict_do_nothing(index_elements=["order_number"]))


def seed_activities(db: Session, now: datetime) -> None:
    latest_orders = db.scalars(select(Order).order_by(Order.order_date.desc(), Order.id.desc()).limit(3)).all()
    last_delivered = db.scalars(
        select(Order).where(Order.status == "delivered").order_by(Order.order_date.desc(), Order.id.desc())
    ).first()
    newest_customer = db.scalars(select(Customer).order_by(Customer.registered_on.desc())).first()

    activities = []
    for minutes, order in zip([5, 40, 95], latest_orders):
        activities.append(
            Activity(
                activity_type="order",
                title="New order received",
                description=f"Order #{order.order_number}",
                reference_id=order.order_number,
                amount=order.total_amount,
                created_at=now - timedelta(minutes=minutes),
            )
        )
    if last_delivered:
        activities.append(
            Activity(
                activity_type="payment",
                title="Payment received",
                description=f"Order #{last_delivered.order_number}",
                reference_id=last_delivered.order_number,
                amount=last_delivered.total_amount,
                created_at=now - timedelta(minutes=150),
            )
        )
    activities.append(
        Activity(
            activity_type="target",
            title="Sales target updated",
            description="North Region",
            reference_id="TARGET-NORTH",
            created_at=now - timedelta(hours=4),
        )
    )
    if newest_customer:
        activities.append(
            Activity(
                activity_type="customer",
                title="New customer registered",
                description=newest_customer.name,
                reference_id=newest_customer.email,
                created_at=now - timedelta(hours=7),
            )
        )
    activities.append(
        Activity(
            activity_type="alert",
            title="Low stock warning",
            description="SKU EL-1003 · Chennai warehouse",
            reference_id="EL-1003",
            created_at=now - timedelta(hours=26),
        )
    )

    existing = {tuple(row) for row in db.execute(select(Activity.activity_type, Activity.reference_id))}
    db.add_all(a for a in activities if (a.activity_type, a.reference_id) not in existing)


def print_counts(db: Session) -> None:
    for model in (Category, Product, Customer, Order, Activity):
        count = db.scalar(select(func.count()).select_from(model))
        print(f"{model.__tablename__:<12} {count}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Insert sample data into the database")
    parser.add_argument("--reset", action="store_true", help="delete all existing data first")
    args = parser.parse_args()

    rng = random.Random(42)
    today = business_today()
    now = datetime.now(timezone.utc)

    with SessionLocal() as db:
        if args.reset:
            reset_tables(db)
        category_ids = seed_categories(db)
        products = seed_products(db, category_ids)
        customer_ids = seed_customers(db, rng, today)
        seed_orders(db, rng, today, products, customer_ids)
        seed_activities(db, now)
        db.commit()
        print_counts(db)


if __name__ == "__main__":
    main()
