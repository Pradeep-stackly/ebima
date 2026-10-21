import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, radius, spacing, TOUCH_TARGET } from '../constants/theme';
import { formatDateRange, isoToLocalDate, isValidISODate, localDateToISO } from '../utils/dates';

interface DateFieldProps {
  label: string;
  value: string;
  maximumDate: string;
  onChange: (value: string) => void;
}

export default function DateField({ label, value, maximumDate, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'set' && date) onChange(localDateToISO(date));
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          style={[styles.input, styles.inputText]}
          accessibilityLabel={label}
        />
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}`}
        style={styles.input}
      >
        <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
        <Text style={styles.inputText}>{isValidISODate(value) ? formatDateRange(value, value) : value}</Text>
      </Pressable>

      {open ? (
        <View>
          <DateTimePicker
            value={isValidISODate(value) ? isoToLocalDate(value) : isoToLocalDate(maximumDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            maximumDate={isoToLocalDate(maximumDate)}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={() => setOpen(false)} style={styles.done} accessibilityRole="button">
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  inputText: { fontSize: fontSize.md, color: colors.text },
  done: { alignSelf: 'flex-end', padding: spacing.sm },
  doneText: { color: colors.primary, fontWeight: '600', fontSize: fontSize.md },
});
