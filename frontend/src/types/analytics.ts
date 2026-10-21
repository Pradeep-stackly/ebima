import { OrdersSummary, ReportPeriod, RevenuePoint } from './index';

export type ComparisonPeriod = 'previous' | 'none';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface MetricComparison {
  value: number;
  previous: number | null;
  change: number | null;
}

export interface OverviewMetrics {
  revenue: MetricComparison;
  orders: MetricComparison;
  profit: MetricComparison;
  customers: MetricComparison;
}

export interface SalesIndicators {
  averageOrderValue: number;
  itemsSold: number;
  profitMargin: number;
  cancellationRate: number;
}

export interface CategoryPerformance {
  name: string;
  revenue: number;
  orders: number;
  itemsSold: number;
  share: number;
}

export interface AnalyticsOverview {
  period: ReportPeriod;
  comparisonPeriod: ReportPeriod | null;
  hasData: boolean;
  metrics: OverviewMetrics;
  indicators: SalesIndicators;
  revenueTrend: RevenuePoint[];
  orderStatus: OrdersSummary;
  topCategory: CategoryPerformance | null;
}
