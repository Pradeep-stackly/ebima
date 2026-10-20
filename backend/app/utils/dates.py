from collections.abc import Iterator
from dataclasses import dataclass
from datetime import date, timedelta


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


def last_n_days(days: int, end: date | None = None) -> DateRange:
    end = end or date.today()
    return DateRange(end - timedelta(days=days - 1), end)
