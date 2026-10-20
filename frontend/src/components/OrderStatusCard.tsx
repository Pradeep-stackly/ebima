import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { OrdersSummary, OrderStatus } from '../types';
import { capitalize, formatNumber } from '../utils/format';
import Card from './Card';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#D97706',
  processing: colors.primary,
  shipped: '#0891B2',
  delivered: colors.success,
  cancelled: colors.danger,
};

interface OrderStatusCardProps {
  summary: OrdersSummary;
}

export default function OrderStatusCard({ summary }: OrderStatusCardProps) {
  const visible = summary.byStatus.filter((item) => item.count > 0);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Orders by status</Text>
        <Text style={styles.total}>{formatNumber(summary.total)}</Text>
      </View>

      {summary.total === 0 ? (
        <Text style={styles.empty}>No orders in this period</Text>
      ) : (
        <>
          <View style={styles.bar}>
            {visible.map((item) => (
              <View key={item.status} style={{ flex: item.count, backgroundColor: STATUS_COLORS[item.status] }} />
            ))}
          </View>

          {summary.byStatus.map((item) => (
            <View key={item.status} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLORS[item.status] }]} />
              <Text style={styles.label}>{capitalize(item.status)}</Text>
              <Text style={styles.count}>{formatNumber(item.count)}</Text>
            </View>
          ))}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  total: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    gap: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  label: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted },
  count: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  empty: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.md },
});
