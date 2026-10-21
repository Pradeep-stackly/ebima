const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// business dates follow India time (UTC+5:30, no daylight saving), same as the backend
const BUSINESS_UTC_OFFSET_MINUTES = 330;

const pad = (value: number) => String(value).padStart(2, '0');

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toISODate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function businessToday(): string {
  return toISODate(new Date(Date.now() + BUSINESS_UTC_OFFSET_MINUTES * 60 * 1000));
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toISODate(date);
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function daysBetween(startIso: string, endIso: string): number {
  return Math.round((parseISODate(endIso).getTime() - parseISODate(startIso).getTime()) / 86400000) + 1;
}

export function isValidISODate(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && toISODate(parseISODate(iso)) === iso;
}

export function formatShortDate(iso: string): string {
  const date = parseISODate(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

export function formatMonth(iso: string): string {
  return MONTHS[parseISODate(iso).getUTCMonth()];
}

export function formatDateRange(startIso: string, endIso: string): string {
  const endYear = endIso.slice(0, 4);
  if (startIso === endIso) return `${formatShortDate(endIso)} ${endYear}`;
  if (startIso.slice(0, 4) !== endYear) {
    return `${formatShortDate(startIso)} ${startIso.slice(0, 4)} – ${formatShortDate(endIso)} ${endYear}`;
  }
  return `${formatShortDate(startIso)} – ${formatShortDate(endIso)} ${endYear}`;
}

export function localDateToISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isoToLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}
