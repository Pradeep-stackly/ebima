import { DashboardData } from '../types';
import { mockDashboardData } from './mockData';

// set to false when FastAPI backend is ready
const USE_MOCK_DATA = true;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDashboardData(): Promise<DashboardData> {
  if (USE_MOCK_DATA) {
    await delay(400); // fake delay like a real API
    return mockDashboardData;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard`);
  if (!response.ok) {
    throw new Error(`Failed to load dashboard (${response.status})`);
  }
  return (await response.json()) as DashboardData;
}
