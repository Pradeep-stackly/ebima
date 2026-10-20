import { useCallback, useEffect, useState } from 'react';
import { getDashboardData } from '../services/dashboardService';
import { DashboardData } from '../types';

const ERROR_MESSAGE = "We couldn't load the dashboard. Please check your connection and try again.";

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  retry: () => void;
  refresh: () => void;
}

export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);

    try {
      const result = await getDashboardData();
      setData(result);
      setError(null);
    } catch (err) {
      console.warn('Dashboard request failed:', err);
      setError(ERROR_MESSAGE);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load('initial');
  }, [load]);

  return {
    data,
    loading,
    refreshing,
    error,
    retry: () => load('initial'),
    refresh: () => load('refresh'),
  };
}
