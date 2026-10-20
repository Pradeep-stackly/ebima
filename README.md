# Enterprise Business Insights - Mobile App

Mobile BI dashboard built with React Native (Expo + TypeScript), FastAPI and PostgreSQL.

```
ebima/
  frontend/   React Native app (Expo, TypeScript)
  backend/    FastAPI app (Python, SQLAlchemy, Alembic)
```

```
Mobile app -> dashboardService -> GET /api/dashboard -> FastAPI router -> service -> repository (SQLAlchemy) -> PostgreSQL
```

The mobile app never talks to the database directly. All data goes through the FastAPI backend.

## 1. PostgreSQL setup (Mac)

```
brew install postgresql@16
brew services start postgresql@16
createdb ebima
```

With Homebrew, the database user is your Mac username and there is no password.

## 2. Backend setup

Requires Python 3.10 or above.

```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set your database connection:

```
DATABASE_URL=postgresql://<your-mac-username>@localhost:5432/ebima
REPORT_PERIOD_DAYS=30
```

`.env` is in `.gitignore`, so credentials are never committed. `.env.example` shows the format.

### Run migrations

```
alembic upgrade head
```

This creates all tables. To change the schema later, update the model in `app/models/`, then:

```
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

### Seed sample data

```
python -m scripts.seed_data
```

Inserts 5 categories, 15 products, 30 customers, about 265 orders over the last 60 days and recent activities. Order dates are relative to today, so the dashboard always shows recent data.

Running it again does not create duplicates. Every table has a unique natural key (category name, product SKU, customer email, order number) and rows are inserted with `ON CONFLICT DO NOTHING`. Activities are checked by type + reference before inserting.

To clear everything and seed again with fresh dates:

```
python -m scripts.seed_data --reset
```

### Start the API

```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger docs: http://localhost:8000/docs

## 3. Frontend setup

```
cd frontend
npm install
npm run dev
```

Scan the QR code with Expo Go (phone and laptop on the same Wi-Fi), or press `w` for browser. The app finds the backend automatically using the IP of the machine running Expo, on port 8000. To use a different URL, create `frontend/.env` with `EXPO_PUBLIC_API_URL=http://<ip>:8000`.

## Running everything

1. Make sure PostgreSQL is running: `brew services start postgresql@16`
2. Terminal 1: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
3. Terminal 2: `cd frontend && npm run dev`

## Database schema

| Table | Columns | Keys |
|---|---|---|
| categories | id, name | name unique |
| products | id, sku, name, category_id, unit_price, cost_price, status | sku unique, category_id -> categories |
| customers | id, name, email, registered_on, status | email unique |
| orders | id, order_number, order_date, customer_id, product_id, quantity, total_amount, status | order_number unique, customer_id -> customers, product_id -> products |
| activities | id, activity_type, title, description, reference_id, amount, created_at | |

- Category is not stored on the order. It comes from order -> product -> category.
- Money columns use `NUMERIC(12,2)`, not float.
- Check constraints: quantity > 0, prices >= 0, status values limited to the allowed list.
- Indexes on `orders.order_date`, `orders.status` and the foreign keys, since the dashboard filters and joins on them.
- Order statuses: pending, processing, shipped, delivered, cancelled.

## KPI rules

Reporting period: the last 30 days including today (`REPORT_PERIOD_DAYS`). Change % compares it with the 30 days before it. If the previous value is 0, change is 0.

Sales orders = orders with status processing, shipped or delivered. Pending and cancelled orders are not counted as sales.

| KPI | Calculation |
|---|---|
| Revenue | `SUM(orders.total_amount)` of sales orders in the period |
| Orders | `COUNT` of sales orders in the period |
| Customers | number of distinct customers with at least one sales order in the period |
| Profit | revenue - cost, where cost = `SUM(orders.quantity * products.cost_price)` of the same orders |
| Revenue trend | sales revenue grouped by `order_date`, last 7 days, days without sales shown as 0 |
| Orders summary | count of all orders in the period grouped by status |
| Top category | category with the highest sales revenue in the period, with its share of total revenue and change vs previous period |
| Recent activities | latest 5 activities ordered by `created_at` desc |

All of these are SQL queries (`SUM`, `COUNT`, `GROUP BY`, `WHERE`) in `app/repositories/order_repository.py`. Nothing is calculated by loading all rows into Python.

## API endpoints

| Method | Endpoint | Params |
|---|---|---|
| GET | /api/dashboard | - |
| GET | /api/orders | limit (1-100, default 20), offset (>= 0), status (optional) |
| GET | /api/customers | limit (1-100, default 20), offset (>= 0) |
| GET | /api/activities | limit (1-100, default 10), offset (>= 0) |
| GET | /api/analytics/revenue-trend | start_date, end_date (YYYY-MM-DD, default last 30 days, max 366 days) |

List endpoints return:

```json
{ "items": [], "total": 265, "limit": 20, "offset": 0 }
```

Example: `GET /api/analytics/revenue-trend?start_date=2026-10-12&end_date=2026-10-14`

```json
{
  "startDate": "2026-10-12",
  "endDate": "2026-10-14",
  "interval": "day",
  "totalRevenue": 146250.0,
  "totalOrders": 6,
  "points": [
    { "date": "2026-10-12", "revenue": 117900.0, "orders": 3 },
    { "date": "2026-10-13", "revenue": 1950.0, "orders": 1 },
    { "date": "2026-10-14", "revenue": 26400.0, "orders": 2 }
  ]
}
```

If no orders match, `points` still has one entry per day with 0 values, so the response shape is always the same.

`limit` and `offset` are applied in SQL (`LIMIT` / `OFFSET`), and date filters are applied in the `WHERE` clause.

## Error handling

| Case | Response |
|---|---|
| Invalid query param (e.g. limit=500, bad date) | 422 with validation details |
| start_date after end_date, or range too long | 400 with a message |
| PostgreSQL not reachable | 503 "Database is unavailable. Please try again later." |
| Other database error | 500 "Something went wrong while reading data." |
| No data | 200 with zeros, empty lists, `topCategory: null` |

Database errors are logged on the server only. The response never contains connection strings or stack traces. If PostgreSQL stops, the mobile app shows its error screen with Retry. Once the database is back, Retry or pull to refresh works again.

## Changes to the API response from Task 2

- `analytics.ordersSummary` is now `{ total, byStatus: [{ status, count }] }`. Task 3 asks for order counts by status, and sales and order totals were already in the KPIs.
- `analytics.revenueTrend` points are now `{ date, revenue, orders }`. The app turns the date into a day label.
- `analytics.topCategory` can be `null` when there are no sales in the period.
- Added `period` (start date, end date, days) so the app can show which period the KPIs cover.
- Activity `id` is now the database id (number), and `referenceId` was added.

The TypeScript types in `frontend/src/types/index.ts` were updated to match.
