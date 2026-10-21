import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { formatCurrency } from '../utils/format';
import Card from './Card';

interface ProfitSummaryCardProps {
  revenue: number;
  profit: number;
  margin: number;
}

export default function ProfitSummaryCard({ revenue, profit, margin }: ProfitSummaryCardProps) {
  const rows = [
    { label: 'Revenue', value: formatCurrency(revenue) },
    { label: 'Cost of goods sold', value: `− ${formatCurrency(revenue - profit)}` },
  ];

  return (
    <Card>
      <Text style={styles.title}>Profit summary</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Profit</Text>
        <Text style={[styles.totalValue, { color: profit < 0 ? colors.danger : colors.success }]}>
          {formatCurrency(profit)}
        </Text>
      </View>
      <Text style={styles.margin}>{margin}% profit margin</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  label: { fontSize: fontSize.sm, color: colors.textMuted },
  value: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  totalRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: fontSize.md, fontWeight: '700' },
  margin: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },
});
