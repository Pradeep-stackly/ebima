from decimal import Decimal

Number = int | float | Decimal


def percent_change(current: Number, previous: Number) -> float | None:
    if not previous:
        return None
    change = (Decimal(current) - Decimal(previous)) / abs(Decimal(previous)) * 100
    return round(float(change), 1)


def share_percent(part: Number, total: Number) -> float:
    if not total:
        return 0.0
    return round(float(Decimal(part) / Decimal(total) * 100), 1)
