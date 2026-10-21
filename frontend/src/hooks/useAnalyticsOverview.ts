import { useCallback, useEffect, useRef, useState } from 'react';
import { getAnalyticsOverview } from '../services/analyticsService';
import { AnalyticsOverview, DateRange } from '../types/analytics';
import { rangeKey } from '../utils/dateRange';

const ERROR_MESSAGE = "We couldn't load analytics for this period. Please try again.";

interface UseAnalyticsOverviewResult {
  data: AnalyticsOverview | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  retry: () => void;
  refresh: () => void;
}

export function useAnalyticsOverview(range: DateRange): UseAnalyticsOverviewResult {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestRequest = useRef(0);
  const loadedKey = useRef<string | null>(null);

  const load = useCallback(async (target: DateRange, mode: 'change' | 'refresh') => {
    const requestId = ++latestRequest.current;
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);

    try {
      const result = await getAnalyticsOverview(target);
      if (requestId !== latestRequest.current) return;
      setData(result);
      setError(null);
      loadedKey.current = rangeKey(target);
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      console.warn('Analytics request failed:', err);
      setError(ERROR_MESSAGE);
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const { startDate, endDate } = range;

  useEffect(() => {
    const target = { startDate, endDate };
    if (rangeKey(target) === loadedKey.current) {
      // already showing this range, drop any slower request still running
      latestRequest.current++;
      setLoading(false);
      setError(null);
      return;
    }
    load(target, 'change');
  }, [startDate, endDate, load]);

  return {
    data,
    loading,
    refreshing,
    error,
    retry: () => load({ startDate, endDate }, 'change'),
    refresh: () => load({ startDate, endDate }, 'refresh'),
  };
}
