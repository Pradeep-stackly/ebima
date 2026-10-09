import { DashboardData } from '../types';

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const mockDashboardData: DashboardData = {
  user: {
    name: 'Pradeep',
    role: 'Business Analyst',
  },
  unreadAlerts: 3,
  kpis: [
    { id: 'revenue', label: 'Revenue', value: 1245000, format: 'currency', changePercent: 12.4 },
    { id: 'orders', label: 'Orders', value: 3482, format: 'number', changePercent: 8.1 },
    { id: 'customers', label: 'Customers', value: 1294, format: 'number', changePercent: -2.3 },
    { id: 'profit', label: 'Profit', value: 312000, format: 'currency', changePercent: 5.6 },
  ],
  analytics: {
    revenueTrend: [
      { label: 'Apr', value: 820000 },
      { label: 'May', value: 910000 },
      { label: 'Jun', value: 870000 },
      { label: 'Jul', value: 1020000 },
      { label: 'Aug', value: 1108000 },
      { label: 'Sep', value: 1245000 },
    ],
    totalSales: 5973000,
    salesChangePercent: 9.8,
    totalOrders: 18240,
    ordersChangePercent: 6.4,
    topCategory: {
      name: 'Electronics',
      revenue: 482000,
      sharePercent: 38.7,
      changePercent: 14.2,
    },
  },
  recentActivity: [
    { id: 'a1', type: 'order', title: 'New order received', subtitle: 'Order #ORD1024', amount: 24500, timestamp: minutesAgo(5) },
    { id: 'a2', type: 'target', title: 'Sales target updated', subtitle: 'North Region', timestamp: minutesAgo(120) },
    { id: 'a3', type: 'payment', title: 'Payment received', subtitle: 'Invoice #INV2291', amount: 118000, timestamp: minutesAgo(190) },
    { id: 'a4', type: 'customer', title: 'New enterprise customer', subtitle: 'Acme Retail Pvt Ltd', timestamp: minutesAgo(300) },
    { id: 'a5', type: 'alert', title: 'Low stock warning', subtitle: 'SKU EL-2201 · Chennai warehouse', timestamp: minutesAgo(60 * 26) },
  ],
};
