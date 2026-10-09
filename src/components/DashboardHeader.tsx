import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing, TOUCH_TARGET } from '../constants/theme';
import { getGreeting, getInitials } from '../utils/format';
import IconButton from './IconButton';

interface DashboardHeaderProps {
  userName: string;
  unreadAlerts: number;
  onNotificationPress: () => void;
  onProfilePress: () => void;
}

export default function DashboardHeader({
  userName,
  unreadAlerts,
  onNotificationPress,
  onProfilePress,
}: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.name} numberOfLines={1}>
          {userName}
        </Text>
      </View>

      <View style={styles.actions}>
        <IconButton
          icon="notifications-outline"
          onPress={onNotificationPress}
          accessibilityLabel="Notifications"
          badgeCount={unreadAlerts}
        />
        <Pressable
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.avatarText}>{getInitials(userName)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  textBlock: { flex: 1, marginRight: spacing.md },
  greeting: { fontSize: fontSize.sm, color: colors.textMuted },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },
});
