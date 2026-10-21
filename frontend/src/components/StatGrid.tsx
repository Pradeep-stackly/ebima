import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import Card from './Card';

export interface StatItem {
  label: string;
  value: string;
}

interface StatGridProps {
  items: StatItem[];
}

export default function StatGrid({ items }: StatGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.cell}>
          <Card style={styles.card}>
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
              {item.value}
            </Text>
          </Card>
        </View>
      ))}
    </View>
  );
}

const GAP = spacing.md;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -GAP / 2 },
  cell: { width: '50%', paddingHorizontal: GAP / 2, paddingBottom: GAP },
  card: { padding: spacing.md },
  label: { fontSize: fontSize.xs, color: colors.textMuted },
  value: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
});
