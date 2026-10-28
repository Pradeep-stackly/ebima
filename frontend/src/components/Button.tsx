import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fontSize, radius, spacing, TOUCH_TARGET } from '../constants/theme';

type Variant = 'primary' | 'outline' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }: ButtonProps) {
  const inactive = disabled || loading;
  const textColor = variant === 'primary' ? '#fff' : variant === 'danger' ? colors.danger : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [styles.button, styles[variant], inactive && styles.inactive, pressed && styles.pressed, style]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.text, { color: textColor }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH_TARGET + 4,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  outline: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  danger: { borderWidth: 1, borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  inactive: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
  text: { fontSize: fontSize.md, fontWeight: '700' },
});
