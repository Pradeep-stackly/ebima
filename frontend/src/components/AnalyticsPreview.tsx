import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { Analytics } from '../types';
import { formatCurrencyCompact, formatDayLabel, formatNumber } from '../utils/format';
import Card from './Card';
import OrderStatusCard from './OrderStatusCard';
import TopCategoryCard from './TopCategoryCard';
import TrendChart from './TrendChart';

interface AnalyticsPreviewProps {
  analytics: Analytics;
}

export default function AnalyticsPreview({ analytics }: AnalyticsPreviewProps) {
  const { revenueTrend, ordersSummary, topCategory } = analytics;
  const trendRevenue = revenueTrend.reduce((sum, point) => sum + point.revenue, 0);
  const trendOrders = revenueTrend.reduce((sum, point) => sum + point.orders, 0);
  const chartData = revenueTrend.map((point) => ({ label: formatDayLabel(point.date), value: point.revenue }));

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.cardTitle}>Revenue trend</Text>
        {revenueTrend.length > 0 ? (
          <>
            <Text style={styles.trendValue}>{formatCurrencyCompact(trendRevenue)}</Text>
            <Text style={styles.caption}>
              {formatNumber(trendOrders)} orders · last {revenueTrend.length} days
            </Text>
            <View style={styles.chart}>
              <TrendChart data={chartData} />
            </View>
          </>
        ) : (
          <Text style={styles.empty}>No revenue data available</Text>
        )}
      </Card>

      <OrderStatusCard summary={ordersSummary} />

      {topCategory ? (
        <TopCategoryCard category={topCategory} />
      ) : (
        <Card>
          <Text style={styles.empty}>No category sales in this period</Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  cardTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  trendValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  caption: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  chart: { marginTop: spacing.lg },
  empty: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.md },
});
