import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { fontSize, radius, spacing } from '../constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  background: string;
  style?: StyleProp<ViewStyle>;
}

export default function Badge({ label, color, background, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: background }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  text: { fontSize: fontSize.xs, fontWeight: '700' },
});
