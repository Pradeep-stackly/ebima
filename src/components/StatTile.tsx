import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import Card from './Card';
import ChangeBadge from './ChangeBadge';

interface StatTileProps {
  label: string;
  value: string;
  changePercent: number;
  style?: StyleProp<ViewStyle>;
}

export default function StatTile({ label, value, changePercent, style }: StatTileProps) {
  return (
    <Card style={[styles.card, style]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <ChangeBadge changePercent={changePercent} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md },
  label: { fontSize: fontSize.sm, color: colors.textMuted },
  value: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginVertical: spacing.xs },
});
