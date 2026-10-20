import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { spacing } from '../constants/theme';
import { DashboardKpis, KpiKey } from '../types';
import { IconName } from '../types/icons';
import { formatCurrencyCompact, formatNumber } from '../utils/format';
import KpiCard from './KpiCard';

interface KpiItem {
  key: KpiKey;
  label: string;
  icon: IconName;
  format: (value: number) => string;
}

const KPI_ITEMS: KpiItem[] = [
  { key: 'revenue', label: 'Revenue', icon: 'wallet-outline', format: formatCurrencyCompact },
  { key: 'orders', label: 'Orders', icon: 'cart-outline', format: formatNumber },
  { key: 'customers', label: 'Customers', icon: 'people-outline', format: formatNumber },
  { key: 'profit', label: 'Profit', icon: 'trending-up-outline', format: formatCurrencyCompact },
];

interface KpiGridProps {
  kpis: DashboardKpis;
}

export default function KpiGrid({ kpis }: KpiGridProps) {
  const { width } = useWindowDimensions();
  const columns = width >= 600 ? 4 : 2;
  const cardWidth = `${100 / columns}%` as const;

  return (
    <View style={styles.grid}>
      {KPI_ITEMS.map((item) => (
        <View key={item.key} style={[styles.cell, { width: cardWidth }]}>
          <KpiCard
            label={item.label}
            value={item.format(kpis[item.key].value)}
            changePercent={kpis[item.key].change}
            icon={item.icon}
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
