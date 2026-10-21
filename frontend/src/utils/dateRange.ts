import { DateRange } from '../types/analytics';
import { addDays, businessToday, daysBetween, isValidISODate, startOfMonth } from './dates';

export type RangePreset = 'today' | 'last7' | 'last30' | 'thisMonth' | 'custom';

export const PRESETS: { key: RangePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'last30', label: 'Last 30 Days' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
];

export const MAX_RANGE_DAYS = 366;

export function getPresetRange(preset: Exclude<RangePreset, 'custom'>, today: string = businessToday()): DateRange {
  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today };
    case 'last7':
      return { startDate: addDays(today, -6), endDate: today };
    case 'last30':
      return { startDate: addDays(today, -29), endDate: today };
    case 'thisMonth':
      return { startDate: startOfMonth(today), endDate: today };
  }
}

export function validateRange({ startDate, endDate }: DateRange): string | null {
  if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
    return 'Please enter valid dates (YYYY-MM-DD).';
  }
  if (startDate > endDate) {
    return 'Start date cannot be after end date.';
  }
  if (daysBetween(startDate, endDate) > MAX_RANGE_DAYS) {
    return `Please choose a range of ${MAX_RANGE_DAYS} days or less.`;
  }
  return null;
}

export function rangeKey({ startDate, endDate }: DateRange): string {
  return `${startDate}_${endDate}`;
}
