import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import { colors, fontSize, MAX_CONTENT_WIDTH, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { Permission } from '../types/auth';
import { capitalize, getInitials } from '../utils/format';

const PERMISSION_LABELS: Record<Permission, string> = {
  view_dashboard: 'View dashboard',
  view_analytics: 'View analytics',
  view_activities: 'View recent activities',
  manage_users: 'Manage user accounts',
  change_user_roles: 'Change user roles',
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.fullName)}</Text>
          </View>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Badge
            label={capitalize(user.role)}
            color={colors.primary}
            background={colors.primarySoft}
            style={styles.centered}
          />
        </Card>

        <Card style={styles.permissions}>
          <Text style={styles.sectionTitle}>What you can do</Text>
          {(Object.keys(PERMISSION_LABELS) as Permission[]).map((permission) => {
            const allowed = user.permissions.includes(permission);
            return (
              <View key={permission} style={styles.permissionRow}>
                <Ionicons
                  name={allowed ? 'checkmark-circle' : 'close-circle-outline'}
                  size={18}
                  color={allowed ? colors.success : colors.textMuted}
                />
                <Text style={[styles.permissionText, !allowed && styles.notAllowed]}>{PERMISSION_LABELS[permission]}</Text>
              </View>
            );
          })}
        </Card>

        <Button title="Log out" variant="danger" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, paddingTop: spacing.sm },
  userCard: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: '#fff', fontSize: fontSize.xl, fontWeight: '700' },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  email: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.xs },
  permissions: { gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  permissionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  permissionText: { fontSize: fontSize.sm, color: colors.text },
  notAllowed: { color: colors.textMuted },
  centered: { alignSelf: 'center' },
});
