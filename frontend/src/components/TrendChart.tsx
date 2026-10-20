import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
export interface ChartPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  data: ChartPoint[];
  height?: number;
}

export default function TrendChart({ data, height = 140 }: TrendChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), 1);

  return (
    <View>
      <View style={[styles.barsRow, { height }]}>
        {data.map((point, index) => {
          const isLatest = index === data.length - 1;
          return (
            <View key={`${point.label}-${index}`} style={styles.column}>
              <View
                style={[
                  styles.bar,
                  {
                    height: (point.value / maxValue) * height,
                    backgroundColor: isLatest ? colors.primary : colors.barMuted,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {data.map((point, index) => (
          <Text key={`${point.label}-${index}`} style={styles.label} numberOfLines={1}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barsRow: { flexDirection: 'row', alignItems: 'flex-end' },
  column: { flex: 1, alignItems: 'center' },
  bar: { width: '55%', borderTopLeftRadius: 6, borderTopRightRadius: 6, minHeight: 4 },
  labelsRow: { flexDirection: 'row', marginTop: spacing.sm },
  label: { flex: 1, textAlign: 'center', fontSize: fontSize.xs, color: colors.textMuted },
});
