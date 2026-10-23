from datetime import date

URL = "/api/analytics/overview"
WEEK = {"start_date": "2026-03-09", "end_date": "2026-03-15"}


def get_overview(client, **params):
    response = client.get(URL, params={**WEEK, **params})
    assert response.status_code == 200, response.text
    return response.json()


def test_range_with_sales(client, shop):
    shop.order(date(2026, 3, 9), shop.laptop, quantity=2, customer=0)
    shop.order(date(2026, 3, 10), shop.chair, quantity=1, customer=1, status="processing")
    shop.order(date(2026, 3, 15), shop.chair, quantity=3, customer=0, status="shipped")

    data = get_overview(client)
    metrics = data["metrics"]

    assert data["hasData"] is True
    assert metrics["revenue"]["value"] == 2000 + 500 + 1500
    assert metrics["orders"]["value"] == 3
    assert metrics["customers"]["value"] == 2
    # profit = revenue - quantity * cost price
    assert metrics["profit"]["value"] == 4000 - (2 * 600 + 1 * 300 + 3 * 300)
    assert data["indicators"]["itemsSold"] == 6
    assert data["indicators"]["averageOrderValue"] == round(4000 / 3, 2)
    assert data["indicators"]["profitMargin"] == 40.0


def test_pending_and_cancelled_orders_are_not_sales(client, shop):
    shop.order(date(2026, 3, 10), shop.laptop, status="delivered")
    shop.order(date(2026, 3, 10), shop.laptop, status="pending")
    shop.order(date(2026, 3, 11), shop.laptop, status="cancelled")

    data = get_overview(client)

    assert data["metrics"]["revenue"]["value"] == 1000
    assert data["metrics"]["orders"]["value"] == 1
    assert data["orderStatus"]["total"] == 3
    assert data["indicators"]["cancellationRate"] == 33.3


def test_start_and_end_dates_are_inclusive(client, shop):
    shop.order(date(2026, 3, 8), shop.laptop)
    shop.order(date(2026, 3, 9), shop.laptop)
    shop.order(date(2026, 3, 15), shop.laptop)
    shop.order(date(2026, 3, 16), shop.laptop)

    data = get_overview(client, comparison_period="none")

    assert data["metrics"]["orders"]["value"] == 2
    assert data["orderStatus"]["total"] == 2


def test_range_with_no_sales(client, shop):
    shop.order(date(2026, 1, 5), shop.laptop)

    data = get_overview(client)

    assert data["hasData"] is False
    assert data["metrics"]["revenue"] == {"value": 0, "previous": 0, "change": None}
    assert data["topCategory"] is None
    assert data["orderStatus"]["total"] == 0
    assert len(data["revenueTrend"]) == 7
    assert all(point["revenue"] == 0 for point in data["revenueTrend"])


def test_previous_period_comparison(client, shop):
    shop.order(date(2026, 3, 3), shop.laptop)
    shop.order(date(2026, 3, 4), shop.laptop)
    shop.order(date(2026, 3, 10), shop.laptop, quantity=3)

    data = get_overview(client)
    revenue = data["metrics"]["revenue"]
    orders = data["metrics"]["orders"]

    assert data["comparisonPeriod"] == {"startDate": "2026-03-02", "endDate": "2026-03-08", "days": 7}
    assert revenue == {"value": 3000, "previous": 2000, "change": 50.0}
    assert orders == {"value": 1, "previous": 2, "change": -50.0}
    assert data["metrics"]["profit"]["change"] == 50.0


def test_previous_period_zero_gives_null_change(client, shop):
    shop.order(date(2026, 3, 10), shop.laptop)

    data = get_overview(client)

    for key in ("revenue", "orders", "profit", "customers"):
        assert data["metrics"][key]["previous"] == 0
        assert data["metrics"][key]["change"] is None


def test_comparison_none(client, shop):
    shop.order(date(2026, 3, 10), shop.laptop)

    data = get_overview(client, comparison_period="none")

    assert data["comparisonPeriod"] is None
    assert data["metrics"]["revenue"] == {"value": 1000, "previous": None, "change": None}


def test_top_category_by_sales_amount(client, shop):
    shop.order(date(2026, 3, 10), shop.chair, quantity=1)
    shop.order(date(2026, 3, 11), shop.chair, quantity=1)
    shop.order(date(2026, 3, 11), shop.chair, quantity=1)
    shop.order(date(2026, 3, 12), shop.laptop, quantity=2)
    shop.order(date(2026, 3, 12), shop.laptop, quantity=5, status="cancelled")

    top = get_overview(client)["topCategory"]

    assert top == {"name": "Electronics", "revenue": 2000, "orders": 1, "itemsSold": 2, "share": 57.1}


def test_top_category_tie_uses_name_order(client, shop):
    shop.order(date(2026, 3, 10), shop.laptop, quantity=1)
    shop.order(date(2026, 3, 10), shop.chair, quantity=2)

    assert get_overview(client)["topCategory"]["name"] == "Electronics"


def test_order_status_breakdown(client, shop):
    for status in ["pending", "processing", "processing", "shipped", "delivered", "delivered", "delivered", "cancelled"]:
        shop.order(date(2026, 3, 12), shop.chair, status=status)
    shop.order(date(2026, 3, 1), shop.chair, status="pending")

    summary = get_overview(client)["orderStatus"]
    counts = {item["status"]: item["count"] for item in summary["byStatus"]}

    assert summary["total"] == 8
    assert counts == {"pending": 1, "processing": 2, "shipped": 1, "delivered": 3, "cancelled": 1}


def test_revenue_trend_has_every_day(client, shop):
    shop.order(date(2026, 3, 9), shop.laptop)
    shop.order(date(2026, 3, 9), shop.chair)
    shop.order(date(2026, 3, 12), shop.chair, quantity=2)

    trend = get_overview(client)["revenueTrend"]

    assert [p["date"] for p in trend] == [f"2026-03-{d:02d}" for d in range(9, 16)]
    assert trend[0] == {"date": "2026-03-09", "revenue": 1500, "orders": 2}
    assert trend[1]["revenue"] == 0
    assert trend[3] == {"date": "2026-03-12", "revenue": 1000, "orders": 1}


def test_single_day_range(client, shop):
    shop.order(date(2026, 3, 14), shop.laptop)
    shop.order(date(2026, 3, 15), shop.chair)

    data = get_overview(client, start_date="2026-03-15", end_date="2026-03-15")

    assert data["period"]["days"] == 1
    assert data["metrics"]["revenue"] == {"value": 500, "previous": 1000, "change": -50.0}


def test_start_after_end_is_rejected(client):
    response = client.get(URL, params={"start_date": "2026-03-15", "end_date": "2026-03-01"})
    assert response.status_code == 400
    assert response.json()["detail"] == "start_date must be on or before end_date"


def test_range_longer_than_limit_is_rejected(client):
    response = client.get(URL, params={"start_date": "2024-01-01", "end_date": "2026-03-01"})
    assert response.status_code == 400


def test_invalid_date_format_is_rejected(client):
    assert client.get(URL, params={"start_date": "2026-13-45"}).status_code == 422
    assert client.get(URL, params={"start_date": "yesterday"}).status_code == 422


def test_invalid_comparison_period_is_rejected(client):
    assert client.get(URL, params={**WEEK, "comparison_period": "year"}).status_code == 422
