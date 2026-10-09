import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { AnalyticsSummary } from '../types';
import { formatCurrencyCompact, formatNumber } from '../utils/format';
import Card from './Card';
import ChangeBadge from './ChangeBadge';
import StatTile from './StatTile';
import TopCategoryCard from './TopCategoryCard';
import TrendChart from './TrendChart';

interface AnalyticsPreviewProps {
  analytics: AnalyticsSummary;
}

export default function AnalyticsPreview({ analytics }: AnalyticsPreviewProps) {
  const { revenueTrend } = analytics;
  const latest = revenueTrend[revenueTrend.length - 1];
  const previous = revenueTrend[revenueTrend.length - 2];
  const trendChange = previous ? ((latest.value - previous.value) / previous.value) * 100 : 0;

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.cardTitle}>Revenue trend</Text>
        <View style={styles.trendHeader}>
          <Text style={styles.trendValue}>{formatCurrencyCompact(latest.value)}</Text>
          <ChangeBadge changePercent={trendChange} />
        </View>
        <Text style={styles.caption}>Last {revenueTrend.length} months</Text>
        <View style={styles.chart}>
          <TrendChart data={revenueTrend} />
        </View>
      </Card>

      <View style={styles.row}>
        <StatTile
          style={styles.flex}
          label="Total sales"
          value={formatCurrencyCompact(analytics.totalSales)}
          changePercent={analytics.salesChangePercent}
        />
        <StatTile
          style={styles.flex}
          label="Total orders"
          value={formatNumber(analytics.totalOrders)}
          changePercent={analytics.ordersChangePercent}
        />
      </View>

      <TopCategoryCard category={analytics.topCategory} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  cardTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  trendHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  trendValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  caption: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  chart: { marginTop: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
});
