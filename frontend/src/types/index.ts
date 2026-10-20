export interface KpiData {
  value: number;
  change: number;
}

export interface DashboardKpis {
  revenue: KpiData;
  orders: KpiData;
  customers: KpiData;
  profit: KpiData;
}

export type KpiKey = keyof DashboardKpis;

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface StatusCount {
  status: OrderStatus;
  count: number;
}

export interface OrdersSummary {
  total: number;
  byStatus: StatusCount[];
}

export interface TopCategory {
  name: string;
  revenue: number;
  share: number;
  change: number;
}

export interface Analytics {
  revenueTrend: RevenuePoint[];
  ordersSummary: OrdersSummary;
  topCategory: TopCategory | null;
}

export type ActivityType = 'order' | 'target' | 'customer' | 'payment' | 'alert';

export interface Activity {
  id: number;
  type: ActivityType;
  title: string;
  subtitle: string;
  referenceId: string | null;
  amount: number | null;
  timestamp: string;
}

export interface User {
  name: string;
  role: string;
}

export interface ReportPeriod {
  startDate: string;
  endDate: string;
  days: number;
}

export interface DashboardData {
  user: User;
  unreadAlerts: number;
  period: ReportPeriod;
  kpis: DashboardKpis;
  analytics: Analytics;
  recentActivities: Activity[];
}
