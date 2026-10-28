import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { UserRole } from '../types/auth';
import { capitalize } from '../utils/format';

const ROLES: UserRole[] = ['admin', 'analyst', 'viewer'];

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export default function RoleSelector({ value, onChange, disabled = false }: RoleSelectorProps) {
  return (
    <View style={styles.row}>
      {ROLES.map((role) => {
        const active = role === value;
        return (
          <Pressable
            key={role}
            onPress={() => onChange(role)}
            disabled={disabled || active}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled }}
            style={[styles.option, active && styles.active, disabled && !active && styles.disabled]}
          >
            <Text style={[styles.text, active && styles.activeText]}>{capitalize(role)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  disabled: { opacity: 0.5 },
  text: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  activeText: { color: '#fff' },
});
