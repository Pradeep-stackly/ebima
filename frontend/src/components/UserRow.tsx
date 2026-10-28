import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { getErrorMessage } from '../services/apiClient';
import { updateUserRole, updateUserStatus } from '../services/userService';
import { ManagedUser, UserRole } from '../types/auth';
import { capitalize } from '../utils/format';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';
import RoleSelector from './RoleSelector';

interface UserRowProps {
  user: ManagedUser;
  isCurrentUser: boolean;
  onUpdated: (user: ManagedUser) => void;
}

export default function UserRow({ user, isCurrentUser, onUpdated }: UserRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = user.status === 'active';

  async function run(action: () => Promise<ManagedUser>) {
    setSaving(true);
    setError(null);
    try {
      onUpdated(await action());
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't update this user. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card style={styles.card}>
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={`${user.fullName}, ${user.role}, ${user.status}`}
        style={styles.header}
      >
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {user.fullName}
            {isCurrentUser ? <Text style={styles.you}> (you)</Text> : null}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
        <View style={styles.badges}>
          <Badge label={capitalize(user.role)} color={colors.primary} background={colors.primarySoft} />
          <Badge
            label={active ? 'Active' : 'Disabled'}
            color={active ? colors.success : colors.danger}
            background={active ? colors.successSoft : colors.dangerSoft}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          <Text style={styles.label}>Role</Text>
          <RoleSelector
            value={user.role}
            disabled={saving}
            onChange={(role: UserRole) => run(() => updateUserRole(user.id, role))}
          />
          {!isCurrentUser ? (
            <Button
              title={active ? 'Disable account' : 'Enable account'}
              variant={active ? 'danger' : 'outline'}
              loading={saving}
              onPress={() => run(() => updateUserStatus(user.id, active ? 'disabled' : 'active'))}
            />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 },
  info: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  you: { color: colors.textMuted, fontWeight: '400' },
  email: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  badges: { alignItems: 'flex-end', gap: spacing.xs },
  details: { marginTop: spacing.md, gap: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  error: { fontSize: fontSize.sm, color: colors.danger },
});
