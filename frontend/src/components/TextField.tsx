import { forwardRef, ReactNode, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fontSize, radius, spacing, TOUCH_TARGET } from '../constants/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  right?: ReactNode;
}

const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, right, style, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputFocused, error ? styles.inputError : null, focused && error ? styles.errorFocused : null]}>
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH_TARGET + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.primary,
    boxShadow: `0 0 0 3px ${colors.primarySoft}`,
  },
  inputError: { borderColor: colors.danger },
  errorFocused: { boxShadow: `0 0 0 3px ${colors.dangerSoft}` },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm,
    // browsers draw their own focus ring inside our border (Safari ignores width 0 when the style is "auto"),
    // so the ring is turned off here and the wrapper above shows focus instead
    ...(Platform.OS === 'web' ? { outlineStyle: 'solid' as const, outlineWidth: 0, outlineColor: 'transparent' } : null),
  },
  error: { fontSize: fontSize.xs, color: colors.danger },
});
