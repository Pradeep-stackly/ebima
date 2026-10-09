
export type KpiId = 'revenue' | 'orders' | 'customers' | 'profit';

export type ValueFormat = 'currency' | 'number';

export interface KpiMetric {
  id: KpiId;
  label: string;
  value: number;
  format: ValueFormat;
  changePercent: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface TopCategory {
  name: string;
  revenue: number;
  sharePercent: number;
  changePercent: number;
}

export interface AnalyticsSummary {
  revenueTrend: ChartPoint[];
  totalSales: number;
  salesChangePercent: number;
  totalOrders: number;
  ordersChangePercent: number;
  topCategory: TopCategory;
}

export type ActivityType = 'order' | 'target' | 'customer' | 'payment' | 'alert';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  amount?: number;
  timestamp: string;
}

export interface User {
  name: string;
  role: string;
}

export interface DashboardData {
  user: User;
  unreadAlerts: number;
  kpis: KpiMetric[];
  analytics: AnalyticsSummary;
  recentActivity: ActivityItem[];
}
