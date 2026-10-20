import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { Activity } from '../types';
import ActivityListItem from './ActivityListItem';
import Card from './Card';

interface ActivityListProps {
  items: Activity[];
  emptyMessage?: string;
}

export default function ActivityList({ items, emptyMessage = 'No recent activity' }: ActivityListProps) {
  return (
    <Card style={styles.card}>
      {items.length === 0 ? (
        <Text style={styles.empty}>{emptyMessage}</Text>
      ) : (
        items.map((item, index) => (
          <View key={item.id} style={index > 0 && styles.divider}>
            <ActivityListItem item={item} />
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: spacing.xs },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  empty: { fontSize: fontSize.sm, color: colors.textMuted, paddingVertical: spacing.lg, textAlign: 'center' },
});
