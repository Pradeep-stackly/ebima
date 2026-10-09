import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { ActivityItem, ActivityType } from '../types';
import { IconName } from '../types/icons';
import { formatCurrency, formatRelativeTime } from '../utils/format';

const ACTIVITY_ICONS: Record<ActivityType, { icon: IconName; color: string; background: string }> = {
  order: { icon: 'bag-handle-outline', color: colors.primary, background: colors.primarySoft },
  target: { icon: 'flag-outline', color: '#7C3AED', background: '#EDE9FE' },
  customer: { icon: 'person-add-outline', color: colors.success, background: colors.successSoft },
  payment: { icon: 'card-outline', color: '#0891B2', background: '#CFFAFE' },
  alert: { icon: 'warning-outline', color: colors.danger, background: colors.dangerSoft },
};

interface ActivityListItemProps {
  item: ActivityItem;
}

export default function ActivityListItem({ item }: ActivityListItemProps) {
  const style = ACTIVITY_ICONS[item.type];

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: style.background }]}>
        <Ionicons name={style.icon} size={18} color={style.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <View style={styles.meta}>
        {item.amount !== undefined ? <Text style={styles.amount}>{formatCurrency(item.amount)}</Text> : null}
        <Text style={styles.time}>{formatRelativeTime(item.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, minHeight: 56 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, marginHorizontal: spacing.md },
  title: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  meta: { alignItems: 'flex-end', maxWidth: '40%' },
  amount: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  time: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
