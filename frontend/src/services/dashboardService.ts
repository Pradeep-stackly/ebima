import { DashboardData } from '../types';
import { apiGet } from './apiClient';

export function getDashboardData(): Promise<DashboardData> {
  return apiGet<DashboardData>('/api/dashboard');
}
