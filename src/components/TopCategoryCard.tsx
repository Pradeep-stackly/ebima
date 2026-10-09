import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { TopCategory } from '../types';
import { formatCurrencyCompact } from '../utils/format';
import Card from './Card';
import ChangeBadge from './ChangeBadge';

interface TopCategoryCardProps {
  category: TopCategory;
}

export default function TopCategoryCard({ category }: TopCategoryCardProps) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="trophy-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.caption}>Top performing category</Text>
          <Text style={styles.name} numberOfLines={1}>
            {category.name}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.revenue}>{formatCurrencyCompact(category.revenue)}</Text>
          <ChangeBadge changePercent={category.changePercent} />
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(category.sharePercent, 100)}%` }]} />
      </View>
      <Text style={styles.share}>{category.sharePercent}% of total revenue</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, marginHorizontal: spacing.md },
  caption: { fontSize: fontSize.xs, color: colors.textMuted },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: spacing.xs },
  revenue: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  share: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },
});
