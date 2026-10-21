import { AnalyticsOverview, ComparisonPeriod, DateRange } from '../types/analytics';
import { apiGet } from './apiClient';

export function getAnalyticsOverview(
  range: DateRange,
  comparisonPeriod: ComparisonPeriod = 'previous',
): Promise<AnalyticsOverview> {
  const query = [
    `start_date=${encodeURIComponent(range.startDate)}`,
    `end_date=${encodeURIComponent(range.endDate)}`,
    `comparison_period=${comparisonPeriod}`,
  ].join('&');
  return apiGet<AnalyticsOverview>(`/api/analytics/overview?${query}`);
}
