from collections.abc import Iterator
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from app.core.config import settings


@dataclass(frozen=True)
class DateRange:
    start: date
    end: date

    @property
    def days(self) -> int:
        return (self.end - self.start).days + 1

    def previous(self) -> "DateRange":
        return DateRange(self.start - timedelta(days=self.days), self.start - timedelta(days=1))

    def each_day(self) -> Iterator[date]:
        for offset in range(self.days):
            yield self.start + timedelta(days=offset)


def today() -> date:
    return datetime.now(ZoneInfo(settings.timezone)).date()


def last_n_days(days: int, end: date | None = None) -> DateRange:
    end = end or today()
    return DateRange(end - timedelta(days=days - 1), end)
