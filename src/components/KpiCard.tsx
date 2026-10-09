import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { IconName } from '../types/icons';
import Card from './Card';
import ChangeBadge from './ChangeBadge';

interface KpiCardProps {
  label: string;
  value: string;
  changePercent: number;
  icon: IconName;
  style?: StyleProp<ViewStyle>;
}

export default function KpiCard({ label, value, changePercent, icon, style }: KpiCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={16} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <View style={styles.bottomRow}>
        <ChangeBadge changePercent={changePercent} />
        <Text style={styles.caption} numberOfLines={1}>
          vs last month
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginVertical: spacing.sm },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  caption: { fontSize: 11, color: colors.textMuted, flexShrink: 1 },
});
