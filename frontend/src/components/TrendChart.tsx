import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';

export interface ChartPoint {
  label: string;
  value: number;
  detail?: string;
}

interface TrendChartProps {
  data: ChartPoint[];
  height?: number;
  maxLabels?: number;
  formatValue?: (value: number) => string;
}

export default function TrendChart({ data, height = 140, maxLabels = 7, formatValue }: TrendChartProps) {
  const [selected, setSelected] = useState(data.length - 1);

  useEffect(() => {
    setSelected(data.length - 1);
  }, [data]);

  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const step = Math.ceil(data.length / maxLabels);
  const labelGroups = [];
  for (let i = 0; i < data.length; i += step) {
    labelGroups.push({ label: data[i].label, span: Math.min(step, data.length - i) });
  }
  const active = data[selected];

  return (
    <View>
      {formatValue && active ? (
        <Text style={styles.tooltip} numberOfLines={1}>
          {active.detail ?? active.label}: <Text style={styles.tooltipValue}>{formatValue(active.value)}</Text>
        </Text>
      ) : null}

      <View style={[styles.barsRow, { height }]}>
        {data.map((point, index) => {
          const isActive = formatValue ? index === selected : index === data.length - 1;
          return (
            <Pressable
              key={`${point.label}-${index}`}
              style={styles.column}
              disabled={!formatValue}
              onPress={() => setSelected(index)}
              accessibilityLabel={`${point.detail ?? point.label}`}
            >
              <View
                style={[
                  styles.bar,
                  {
                    width: data.length > 20 ? '80%' : '55%',
                    height: (point.value / maxValue) * height,
                    backgroundColor: isActive ? colors.primary : colors.barMuted,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.labelsRow}>
        {labelGroups.map((group, index) => (
          <Text
            key={`${group.label}-${index}`}
            style={[styles.label, { flex: group.span, textAlign: step === 1 ? 'center' : 'left' }]}
            numberOfLines={1}
          >
            {group.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.sm },
  tooltipValue: { color: colors.text, fontWeight: '700' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end' },
  column: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: { borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 3 },
  labelsRow: { flexDirection: 'row', marginTop: spacing.sm },
  label: { fontSize: fontSize.xs, color: colors.textMuted },
});
