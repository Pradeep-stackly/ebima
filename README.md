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

The mobile app never talks to the database directly. All data goes through the FastAPI backend. Every API except `/api/auth/login` needs a logged-in user (see [Authentication and roles](#authentication-and-roles)).

## 1. PostgreSQL setup (Mac)

Either install [Postgres.app](https://postgresapp.com) (click Initialize, then add its tools to the PATH as shown on their site), or use Homebrew:

```
brew install postgresql@16
brew services start postgresql@16
```

Then create the database:

```
createdb ebima
```

With Postgres.app or Homebrew, the database user is your Mac username and there is no password.

## 2. Backend setup

Requires Python 3.10 or above.

```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set your database connection and a JWT secret:

```
DATABASE_URL=postgresql://<your-mac-username>@localhost:5432/ebima
JWT_SECRET_KEY=<long random value>
ACCESS_TOKEN_EXPIRE_MINUTES=60
REPORT_PERIOD_DAYS=30
```

Generate the secret with:

```
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

`.env` is in `.gitignore`, so the database password and JWT secret are never committed. `.env.example` shows the format. The app will not start without `JWT_SECRET_KEY`.

### Run migrations

```
alembic upgrade head
```

This creates all tables. To change the schema later, update the model in `app/models/`, then:

```
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

### Create the first admin

There is no public sign-up. The first admin is created from the terminal, and the admin then creates every other account in the app (User Management tab) or with `POST /api/users`.

```
python -m scripts.create_user --email you@company.com --name "Your Name"
```

It asks for the password twice (minimum 8 characters), so the password is never typed into the command or saved in shell history. Use `--role analyst` or `--role viewer` to create other roles the same way.

### Seed sample data

```
python -m scripts.seed_data
```

Inserts 5 categories, 15 products, 30 customers, about 265 orders over the last 60 days and recent activities. Order dates are relative to today, so the dashboard always shows recent data.

The seed script does not create users and `--reset` does not delete them.

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

## Authentication and roles

### Roles

Roles are stored in the `users` table and checked by the backend on every request. The app hides screens a role can't use, but that is only for convenience. The API refuses the request either way.

| Feature | Admin | Analyst | Viewer |
|---|---|---|---|
| View dashboard | Yes | Yes | Yes |
| View analytics, orders, customers | Yes | Yes | Yes |
| View recent activities | Yes | Yes | Yes |
| Manage user accounts (list, create, enable/disable) | Yes | No | No |
| Change user roles | Yes | No | No |

Analyst and Viewer have the same permissions for now. They are separate roles so analyst-only features (exports, saved reports) can be added later without changing anyone's account.

Permissions are defined once in `backend/app/core/permissions.py`. Routes use a reusable dependency instead of checking roles themselves:

```python
router = APIRouter(dependencies=[Depends(require_permission(Permission.VIEW_ANALYTICS))])
```

- No token, a bad token or an expired token: **401**
- Logged in but the role doesn't allow it: **403**

### How login works

1. The app sends email and password to `POST /api/auth/login`.
2. The backend finds the user by email (case-insensitive) and checks the password against the Argon2 hash.
3. It returns a signed JWT (HS256) and basic profile info. The token only holds the user id (`sub`), issue time and expiry, with no role or personal data.
4. The app saves the token in **Expo SecureStore** (iOS Keychain / Android Keystore), then calls `GET /api/auth/me` to load the profile and permissions.
5. Every API call goes through `frontend/src/services/apiClient.ts`, which adds `Authorization: Bearer <token>`. No screen or service handles the token itself.
6. On each request the backend checks the signature and expiry, then loads the user from PostgreSQL. A disabled account or a changed role takes effect on the very next request, even if the token hasn't expired.

### Session and expiry

- Tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (default 60). There are no refresh tokens, so after expiry the user logs in again.
- On app start, the stored token is read from SecureStore. If it has already expired it is deleted straight away; otherwise `/api/auth/me` confirms it and the user goes straight to the Dashboard.
- The app also sets a timer for the token's expiry time and logs out when it runs out.
- If any API call returns 401, `apiClient` tells the auth state to end the session. The token is deleted and the Login screen shows "Your session has expired. Please log in again." A 403 is shown as a permission error and does not log the user out.

### Logout

Profile → Log out deletes the token from SecureStore and from memory, clears the user from the auth state and returns to Login. The tab screens are unmounted, so no dashboard or user data stays on screen.

### API messages

- Wrong password and unknown email return the same 401 "Incorrect email or password", so the API doesn't reveal which emails have accounts. For unknown emails the server still runs a hash check so both cases take about the same time.
- A disabled account gets 403 "This account has been disabled", but only after the correct password is entered.
- Password hashes are never included in any response. Response models only list safe fields, and a test checks every user endpoint for this.

### Admin safety rules

- The system always keeps at least one active admin. Demoting or disabling the last active admin returns 409.
- An admin cannot disable their own account (409).
- Emails are unique (case-insensitive). A duplicate returns 409.
- Role and status values are validated; anything other than `admin`/`analyst`/`viewer` or `active`/`disabled` returns 422.

### Security assumptions

- In development the API runs over plain HTTP on the local network. In production it must be served over HTTPS, otherwise tokens and passwords can be read on the network.
- Logout is client-side: the token is deleted on the phone but stays technically valid until it expires (max 60 minutes). Disabling the account cuts it off immediately, because the user is checked on every request.
- On web (`npm run web`) SecureStore isn't available, so the token is kept in memory only and a page reload means logging in again. Phones always use SecureStore.
- CORS allows all origins for development. It should be limited to the real app domains in production.
- Not included in this task (as instructed): sign-up, password reset, social login, multi-factor authentication, login rate limiting.

## Database schema

| Table | Columns | Keys |
|---|---|---|
| categories | id, name | name unique |
| products | id, sku, name, category_id, unit_price, cost_price, status | sku unique, category_id -> categories |
| customers | id, name, email, registered_on, status | email unique |
| orders | id, order_number, order_date, customer_id, product_id, quantity, total_amount, status | order_number unique, customer_id -> customers, product_id -> products |
| activities | id, activity_type, title, description, reference_id, amount, created_at | |
| users | id, full_name, email, password_hash, role, status, created_at, updated_at | email unique; role in admin/analyst/viewer; status in active/disabled |

- Category is not stored on the order. It comes from order -> product -> category.
- Money columns use `NUMERIC(12,2)`, not float.
- Check constraints: quantity > 0, prices >= 0, status values limited to the allowed list.
- Indexes on `orders.order_date`, `orders.status` and the foreign keys, since the dashboard filters and joins on them.
- Order statuses: pending, processing, shipped, delivered, cancelled.

## KPI rules

Reporting period: the last 30 days including today (`REPORT_PERIOD_DAYS`). Change % compares it with the 30 days before it. If the previous value is 0, change is `null` and the app shows N/A.

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

## Analytics rules (Analytics screen)

These rules apply to `GET /api/analytics/overview`. Every number on the Analytics screen uses the same selected date range.

**Date range**
- Dates are calendar dates in India time (`Asia/Kolkata`, set with `TIMEZONE`). `order_date` is a `DATE` column, so there is no time-of-day boundary to handle.
- `start_date` and `end_date` are both included. Default is the last 30 days, maximum 366 days.
- The app builds the presets in India time too (UTC+5:30, see `frontend/src/utils/dates.ts`), so "Today" means the same day on the phone and on the server.

| Filter | Start date | End date |
|---|---|---|
| Today | today | today |
| Last 7 Days | today - 6 days | today |
| Last 30 Days | today - 29 days | today |
| This Month | 1st of this month | today |
| Custom | chosen start date | chosen end date |

**Metrics**

Sales orders = processing, shipped and delivered. **Cancelled and pending orders are excluded from revenue, orders, customers, profit, items sold and top category.** They are still counted in the order status breakdown and the cancellation rate.

| Metric | Rule |
|---|---|
| Revenue | `SUM(total_amount)` of sales orders |
| Orders | `COUNT` of sales orders |
| Customers | distinct customers with at least one sales order in the range |
| Profit | revenue - `SUM(quantity * products.cost_price)` |
| Profit margin | profit / revenue x 100 |
| Average order value | revenue / orders (0 when there are no orders) |
| Items sold | `SUM(quantity)` of sales orders |
| Cancellation rate | cancelled orders / all orders in the range x 100 |
| Revenue trend | sales revenue per day, every day in the range, days without sales are 0 |
| Order status | count of **all** orders in the range grouped by status |
| Top category | category with the highest sales revenue. Ties go to the category name in A-Z order. Shows revenue, number of sales orders, items sold and share of total revenue. `null` when there are no sales. |

Profit uses the product's current `cost_price`. The orders table has no cost-at-time-of-sale column, so if a cost price changes later, past profit changes too. This is a known limitation. A `unit_cost` column on orders would fix it, but the task asked not to change the schema unless needed.

**Previous-period comparison**
- The comparison period has the same number of days and ends the day before `start_date`. Last 7 days is compared with the 7 days before it; Today is compared with yesterday.
- `change = (current - previous) / |previous| x 100`, rounded to 1 decimal.
- If the previous value is 0, `change` is `null` (the app shows N/A). It never returns infinity or a fake 0% or 100%.
- The app only displays `change`; it never calculates comparisons itself.

**Performance**
- The overview endpoint runs 4 SQL queries: one for current and previous totals together (using `FILTER (WHERE ...)` per period), one for daily revenue, one for status counts, and one for category sales. Each metric is calculated once per request.
- Date and status filters are in the SQL `WHERE` clause, with a composite index on `orders (order_date, status)` (Alembic migration `1d3a9ebbf0a1`).
- No caching. Analytics should show new orders straight away, and the queries are already aggregated in PostgreSQL. Caching would add stale data to manage without a real need at this size.

## Analytics screen

`frontend/src/screens/AnalyticsScreen.tsx`

- Filter chips: Today, Last 7 Days, Last 30 Days, This Month, Custom. Custom opens a start and end date picker. If the start is after the end, or the range is longer than 366 days, a message is shown and Apply is disabled.
- Data flow: `AnalyticsScreen` -> `useAnalyticsOverview` -> `analyticsService.getAnalyticsOverview()` -> `apiClient` -> `GET /api/analytics/overview`.
- **Stale responses:** each request gets an id. If you switch filters quickly, only the latest request is allowed to update the screen.
- **Duplicate requests:** selecting the range that is already loaded does not send a new request.
- **While a new period loads**, the previous numbers stay on screen (faded) with a small spinner, so the screen never goes blank. This is intentional. If the new period fails, a banner says which period is still shown, with Retry.
- **States:** loading spinner on first load, error screen with Retry, "No orders in this period" when the range has no orders, pull to refresh.
- **Chart:** daily bars for up to 31 days, weekly for up to 92 days, monthly after that, so bars and labels fit on small screens. Labels are thinned to about 7. Tap a bar to see its date and amount. Days with no sales show as 0, and a range with no sales shows "No sales in this period".

## Tests

### Backend

Backend tests are in `backend/tests/` and use pytest.

```
cd backend
source venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

- Tests use a separate database, `ebima_test` (your database name + `_test`). It is created automatically if missing, and tables are created fresh for each run. Your real `ebima` data is never touched. To use another database, set `TEST_DATABASE_URL`.
- Each test inserts its own orders and runs inside a transaction that is rolled back afterwards, so tests don't depend on each other or on seed data.

Covered cases:
- range with sales: revenue, orders, customers, profit, items sold, average order value, profit margin
- pending and cancelled orders excluded from sales but included in the status breakdown
- start and end dates are inclusive, and orders outside the range are ignored
- range with no sales: zeros, `hasData: false`, no top category, a trend with 0 for every day
- previous-period comparison, and `null` change when the previous value is 0
- `comparison_period=none`
- top category selection, including cancelled orders ignored and ties
- order status breakdown
- single-day range compared with the day before
- invalid ranges: start after end (400), longer than 366 days (400), bad date format (422), bad comparison value (422)
- unit tests for `percent_change`, `share_percent` and the previous-period dates

Authentication and roles (`test_auth.py`, `test_users.py`):
- login with valid credentials, wrong password, unknown email (same message), disabled account, invalid input
- `/api/auth/me` with no token, invalid token, expired token, token signed with another secret, token of a disabled user
- every protected endpoint returns 401 without a token
- all three roles can view dashboard and analytics
- admin can list, create, change role and disable users
- analyst and viewer get 403 on user management, and viewer cannot change roles
- duplicate email (409), invalid role/password/email (422), unknown user (404)
- last active admin cannot be demoted, admin cannot disable themselves
- a role change and a disabled account apply on the next request
- password hashes never appear in any auth or user response

Test users are created inside each test with a test-only password. No real credentials or tokens are stored in the repository.

### Frontend

```
cd frontend
npm test
```

`src/__tests__/session.test.ts` (Jest, SecureStore and `fetch` mocked):
- login stores the token in SecureStore and in the API client
- logout clears the token from SecureStore and from the API client
- requests send the `Authorization` header only while logged in
- a 401 response ends the session and throws, so it is never shown as data
- a 403 response is an error but does not log the user out
- reading the expiry time from a token

## API endpoints

All endpoints except `POST /api/auth/login` and `GET /` need the header `Authorization: Bearer <token>`. In Swagger, log in with `POST /api/auth/login`, copy `accessToken`, click **Authorize** and paste it.

| Method | Endpoint | Who | Params / body |
|---|---|---|---|
| POST | /api/auth/login | anyone | `{ "email", "password" }` |
| GET | /api/auth/me | logged in | - |
| GET | /api/users | admin | limit (1-100, default 20), offset (>= 0) |
| POST | /api/users | admin | `{ "fullName", "email", "password" (min 8), "role" }` |
| PATCH | /api/users/{id}/role | admin | `{ "role": "admin" \| "analyst" \| "viewer" }` |
| PATCH | /api/users/{id}/status | admin | `{ "status": "active" \| "disabled" }` |

| Method | Endpoint | Params |
|---|---|---|
| GET | /api/dashboard | - |
| GET | /api/orders | limit (1-100, default 20), offset (>= 0), status (optional) |
| GET | /api/customers | limit (1-100, default 20), offset (>= 0) |
| GET | /api/activities | limit (1-100, default 10), offset (>= 0) |
| GET | /api/analytics/revenue-trend | start_date, end_date (YYYY-MM-DD, default last 30 days, max 366 days) |
| GET | /api/analytics/overview | start_date, end_date, comparison_period (`previous` or `none`, default `previous`) |

List endpoints return:

```json
{ "items": [], "total": 265, "limit": 20, "offset": 0 }
```

Login response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "fullName": "Pradeep Admin",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "permissions": ["change_user_roles", "manage_users", "view_activities", "view_analytics", "view_dashboard"]
  }
}
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

### GET /api/analytics/overview

All analytics for one date range, used by the Analytics screen.

Example: `GET /api/analytics/overview?start_date=2026-10-14&end_date=2026-10-20`

```json
{
  "period": { "startDate": "2026-10-14", "endDate": "2026-10-20", "days": 7 },
  "comparisonPeriod": { "startDate": "2026-10-07", "endDate": "2026-10-13", "days": 7 },
  "hasData": true,
  "metrics": {
    "revenue": { "value": 336200.0, "previous": 1028400.0, "change": -67.3 },
    "orders": { "value": 14.0, "previous": 28.0, "change": -50.0 },
    "profit": { "value": 107420.0, "previous": 295880.0, "change": -63.7 },
    "customers": { "value": 11.0, "previous": 16.0, "change": -31.2 }
  },
  "indicators": { "averageOrderValue": 24014.29, "itemsSold": 34, "profitMargin": 32.0, "cancellationRate": 28.0 },
  "revenueTrend": [{ "date": "2026-10-14", "revenue": 121350.0, "orders": 4 }],
  "orderStatus": { "total": 25, "byStatus": [{ "status": "pending", "count": 4 }] },
  "topCategory": { "name": "Furniture", "revenue": 211500.0, "orders": 5, "itemsSold": 9, "share": 62.9 }
}
```

- Dates are calendar dates in `Asia/Kolkata` (`TIMEZONE` in `.env`). Both `start_date` and `end_date` are included.
- Comparison period = the same number of days just before `start_date`. Last 7 days is compared with the 7 days before it.
- `change` is `null` when the previous value is 0 or when `comparison_period=none`. It never returns infinity or a fake 0%.
- `hasData` is `false` when there are no orders at all in the range. Metrics are 0 and `topCategory` is `null`.
- Current and previous period totals come from a single SQL query using `FILTER (WHERE ...)` for each period.

`limit` and `offset` are applied in SQL (`LIMIT` / `OFFSET`), and date filters are applied in the `WHERE` clause.

## Error handling

| Case | Response |
|---|---|
| No token, invalid token or expired token | 401 |
| Wrong email or password | 401 "Incorrect email or password" |
| Disabled account at login | 403 "This account has been disabled" |
| Logged in but role not allowed | 403 "You do not have permission to perform this action" |
| Duplicate email, removing the last admin, disabling yourself | 409 with a message |
| User not found | 404 |
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
- (Task 5) `user` in the dashboard response is now the logged-in user instead of a fixed name.

The TypeScript types in `frontend/src/types/index.ts` were updated to match.
