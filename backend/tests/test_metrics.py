from datetime import date

from app.utils.dates import DateRange
from app.utils.metrics import percent_change, share_percent


def test_percent_change_up_and_down():
    assert percent_change(150, 100) == 50.0
    assert percent_change(50, 100) == -50.0
    assert percent_change(100, 100) == 0.0


def test_percent_change_previous_zero_returns_none():
    assert percent_change(500, 0) is None
    assert percent_change(0, 0) is None


def test_percent_change_negative_previous_uses_absolute_base():
    # profit going from -100 to +50 is an improvement, not a decline
    assert percent_change(50, -100) == 150.0


def test_share_percent():
    assert share_percent(25, 200) == 12.5
    assert share_percent(10, 0) == 0.0


def test_previous_period_has_same_length_and_ends_day_before():
    period = DateRange(date(2026, 3, 9), date(2026, 3, 15))
    previous = period.previous()
    assert previous == DateRange(date(2026, 3, 2), date(2026, 3, 8))
    assert previous.days == period.days == 7


def test_single_day_previous_period_is_yesterday():
    assert DateRange(date(2026, 3, 1), date(2026, 3, 1)).previous() == DateRange(date(2026, 2, 28), date(2026, 2, 28))
