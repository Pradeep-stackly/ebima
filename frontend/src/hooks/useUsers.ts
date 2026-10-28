import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/apiClient';
import { getUsers } from '../services/userService';
import { ManagedUser } from '../types/auth';

const PAGE_SIZE = 20;

export function useUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFirstPage = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    try {
      const page = await getUsers(PAGE_SIZE, 0);
      setUsers(page.items);
      setTotal(page.total);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't load users. Please try again."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage('initial');
  }, [loadFirstPage]);

  async function loadMore() {
    if (loadingMore || users.length >= total) return;
    setLoadingMore(true);
    try {
      const page = await getUsers(PAGE_SIZE, users.length);
      setUsers((current) => [...current, ...page.items]);
      setTotal(page.total);
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't load more users."));
    } finally {
      setLoadingMore(false);
    }
  }

  function replaceUser(updated: ManagedUser) {
    setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)));
  }

  return {
    users,
    total,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore: users.length < total,
    retry: () => loadFirstPage('initial'),
    refresh: () => loadFirstPage('refresh'),
    loadMore,
    replaceUser,
  };
}
