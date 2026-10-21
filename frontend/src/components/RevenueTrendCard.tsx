import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { RevenuePoint } from '../types';
import { buildRevenueChart, getChartInterval } from '../utils/chart';
import { formatCurrency, formatCurrencyCompact, formatNumber } from '../utils/format';
import Card from './Card';
import TrendChart from './TrendChart';

const INTERVAL_TEXT = { day: 'Daily revenue', week: 'Weekly revenue', month: 'Monthly revenue' };

interface RevenueTrendCardProps {
  points: RevenuePoint[];
  interactive?: boolean;
}

export default function RevenueTrendCard({ points, interactive = false }: RevenueTrendCardProps) {
  const chartData = useMemo(() => buildRevenueChart(points), [points]);
  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = points.reduce((sum, point) => sum + point.orders, 0);

  return (
    <Card>
      <Text style={styles.title}>Revenue trend</Text>
      {points.length === 0 ? (
        <Text style={styles.empty}>No revenue data available</Text>
      ) : (
        <>
          <Text style={styles.total}>{formatCurrencyCompact(totalRevenue)}</Text>
          <Text style={styles.caption}>
            {INTERVAL_TEXT[getChartInterval(points.length)]} · {formatNumber(totalOrders)} orders · {points.length}{' '}
            {points.length === 1 ? 'day' : 'days'}
          </Text>
          {totalRevenue === 0 ? (
            <Text style={styles.empty}>No sales in this period</Text>
          ) : (
            <View style={styles.chart}>
              <TrendChart data={chartData} formatValue={interactive ? formatCurrency : undefined} />
            </View>
          )}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  total: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  caption: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  chart: { marginTop: spacing.lg },
  empty: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.md },
});
