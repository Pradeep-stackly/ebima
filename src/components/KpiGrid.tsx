import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { spacing } from '../constants/theme';
import { KpiId, KpiMetric } from '../types';
import { IconName } from '../types/icons';
import { formatCurrencyCompact, formatNumber } from '../utils/format';
import KpiCard from './KpiCard';

const KPI_ICONS: Record<KpiId, IconName> = {
  revenue: 'wallet-outline',
  orders: 'cart-outline',
  customers: 'people-outline',
  profit: 'trending-up-outline',
};

interface KpiGridProps {
  metrics: KpiMetric[];
}

export default function KpiGrid({ metrics }: KpiGridProps) {
  const { width } = useWindowDimensions();
  const columns = width >= 600 ? 4 : 2;
  const cardWidth = `${100 / columns}%` as const;

  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <View key={metric.id} style={[styles.cell, { width: cardWidth }]}>
          <KpiCard
            label={metric.label}
            value={metric.format === 'currency' ? formatCurrencyCompact(metric.value) : formatNumber(metric.value)}
            changePercent={metric.changePercent}
            icon={KPI_ICONS[metric.id]}
          />
        </View>
      ))}
    </View>
  );
}

const GAP = spacing.md;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -GAP / 2 },
  cell: { paddingHorizontal: GAP / 2, paddingBottom: GAP },
});
