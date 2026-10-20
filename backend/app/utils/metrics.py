from decimal import Decimal

Number = int | float | Decimal


def percent_change(current: Number, previous: Number) -> float:
    if not previous:
        return 0.0
    return round(float((Decimal(current) - Decimal(previous)) / Decimal(previous) * 100), 1)


def share_percent(part: Number, total: Number) -> float:
    if not total:
        return 0.0
    return round(float(Decimal(part) / Decimal(total) * 100), 1)
