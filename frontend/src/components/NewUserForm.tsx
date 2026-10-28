import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';
import { getErrorMessage } from '../services/apiClient';
import { createUser } from '../services/userService';
import { ManagedUser, UserRole } from '../types/auth';
import { validateEmail, validatePassword } from '../utils/validation';
import Button from './Button';
import Card from './Card';
import RoleSelector from './RoleSelector';
import TextField from './TextField';

interface NewUserFormProps {
  onCreated: (user: ManagedUser) => void;
  onCancel: () => void;
}

export default function NewUserForm({ onCreated, onCancel }: NewUserFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const nextErrors = {
      fullName: fullName.trim().length < 2 ? 'Enter the full name.' : null,
      email: validateEmail(email),
      password: validatePassword(password, 8),
    };
    setErrors(nextErrors);
    setFormError(null);
    if (Object.values(nextErrors).some(Boolean) || saving) return;

    setSaving(true);
    try {
      const user = await createUser({ fullName: fullName.trim(), email: email.trim(), password, role });
      onCreated(user);
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't create this user. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>New user</Text>
      <TextField label="Full name" value={fullName} onChangeText={setFullName} error={errors.fullName} autoCapitalize="words" />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextField
        label="Temporary password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        placeholder="At least 8 characters"
      />
      <View style={styles.roleField}>
        <Text style={styles.label}>Role</Text>
        <RoleSelector value={role} onChange={setRole} />
      </View>
      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      <View style={styles.actions}>
        <Button title="Cancel" variant="outline" onPress={onCancel} style={styles.flex} />
        <Button title="Create user" onPress={handleCreate} loading={saving} style={styles.flex} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  title: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  roleField: { gap: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  error: { fontSize: fontSize.sm, color: colors.danger },
  actions: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1, paddingHorizontal: spacing.md },
});
