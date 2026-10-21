import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { IconName } from '../types/icons';
import Card from './Card';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: IconName;
}

export default function EmptyState({ title, message, icon = 'calendar-clear-outline' }: EmptyStateProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: spacing.xl },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  message: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
});
