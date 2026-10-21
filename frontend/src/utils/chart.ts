import { ChartPoint } from '../components/TrendChart';
import { RevenuePoint } from '../types';
import { formatMonth, formatShortDate } from './dates';
import { formatDayLabel } from './format';

export type ChartInterval = 'day' | 'week' | 'month';

export function getChartInterval(days: number): ChartInterval {
  if (days <= 31) return 'day';
  if (days <= 92) return 'week';
  return 'month';
}

// long ranges are grouped so bars and labels still fit on a phone screen
export function buildRevenueChart(points: RevenuePoint[]): ChartPoint[] {
  const interval = getChartInterval(points.length);

  if (interval === 'day') {
    return points.map((point) => ({
      label: points.length <= 7 ? formatDayLabel(point.date) : formatShortDate(point.date),
      value: point.revenue,
      detail: formatShortDate(point.date),
    }));
  }

  if (interval === 'week') {
    const weeks: ChartPoint[] = [];
    for (let i = 0; i < points.length; i += 7) {
      const chunk = points.slice(i, i + 7);
      const end = chunk[chunk.length - 1].date;
      weeks.push({
        label: formatShortDate(chunk[0].date),
        value: chunk.reduce((sum, point) => sum + point.revenue, 0),
        detail: `${formatShortDate(chunk[0].date)} – ${formatShortDate(end)}`,
      });
    }
    return weeks;
  }

  const months = new Map<string, number>();
  for (const point of points) {
    const key = point.date.slice(0, 7);
    months.set(key, (months.get(key) ?? 0) + point.revenue);
  }
  return [...months.entries()].map(([key, value]) => ({
    label: formatMonth(`${key}-01`),
    value,
    detail: `${formatMonth(`${key}-01`)} ${key.slice(0, 4)}`,
  }));
}
