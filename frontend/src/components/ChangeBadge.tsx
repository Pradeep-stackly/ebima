import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { formatPercent } from '../utils/format';

interface ChangeBadgeProps {
  changePercent: number | null;
}

export default function ChangeBadge({ changePercent }: ChangeBadgeProps) {
  if (changePercent === null || changePercent === 0) {
    return (
      <View style={[styles.badge, { backgroundColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.textMuted }]}>
          {changePercent === null ? 'N/A' : '0.0%'}
        </Text>
      </View>
    );
  }

  const isUp = changePercent > 0;
  const color = isUp ? colors.success : colors.danger;

  return (
    <View
      style={[styles.badge, { backgroundColor: isUp ? colors.successSoft : colors.dangerSoft }]}
      accessibilityLabel={`${isUp ? 'Up' : 'Down'} ${Math.abs(changePercent)} percent`}
    >
      <Ionicons name={isUp ? 'arrow-up' : 'arrow-down'} size={12} color={color} />
      <Text style={[styles.text, { color }]}>{formatPercent(changePercent)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    gap: 2,
  },
  text: { fontSize: fontSize.xs, fontWeight: '600' },
});
