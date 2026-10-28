import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { validateEmail, validatePassword } from '../utils/validation';

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Incorrect email or password.';
    if (error.status === 403) return 'This account has been disabled. Please contact your administrator.';
    if (error.status === 422) return 'Please check your email and password.';
    if (error.status === 0) return "Can't reach the server. Check your connection and try again.";
  }
  return 'Something went wrong. Please try again.';
}

export default function LoginScreen() {
  const { signIn, notice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const passwordRef = useRef<TextInput>(null);

  async function handleSubmit() {
    if (submittingRef.current) return;

    const nextErrors = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(nextErrors);
    setFormError(null);
    if (nextErrors.email || nextErrors.password) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setFormError(loginErrorMessage(error));
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="stats-chart" size={30} color="#fff" />
            </View>
            <Text style={styles.appName}>Enterprise Business Insights</Text>
            <Text style={styles.subtitle}>Sign in to view your business dashboard</Text>
          </View>

          {notice || formError ? (
            <View style={styles.alert} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
              <Text style={styles.alertText}>{formError ?? notice}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              placeholder="you@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!submitting}
            />
            <TextField
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder="Your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              editable={!submitting}
              right={
                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  hitSlop={10}
                  style={styles.eye}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </Pressable>
              }
            />
            <Button title="Log in" onPress={handleSubmit} loading={submitting} style={styles.button} />
          </View>

          <Text style={styles.footer}>Accounts are created by your administrator.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  appName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    marginBottom: spacing.lg,
  },
  alertText: { flex: 1, color: colors.danger, fontSize: fontSize.sm },
  form: { gap: spacing.lg },
  eye: { paddingLeft: spacing.sm },
  button: { marginTop: spacing.sm },
  footer: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xl },
});
