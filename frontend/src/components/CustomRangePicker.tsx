import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing, TOUCH_TARGET } from '../constants/theme';
import { DateRange } from '../types/analytics';
import { validateRange } from '../utils/dateRange';
import { businessToday } from '../utils/dates';
import Card from './Card';
import DateField from './DateField';

interface CustomRangePickerProps {
  initialRange: DateRange;
  onApply: (range: DateRange) => void;
}

export default function CustomRangePicker({ initialRange, onApply }: CustomRangePickerProps) {
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const error = validateRange({ startDate, endDate });
  const today = businessToday();

  return (
    <Card style={styles.card}>
      <DateField label="Start date" value={startDate} maximumDate={today} onChange={setStartDate} />
      <DateField label="End date" value={endDate} maximumDate={today} onChange={setEndDate} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={() => onApply({ startDate, endDate })}
        disabled={error !== null}
        accessibilityRole="button"
        accessibilityState={{ disabled: error !== null }}
        style={({ pressed }) => [styles.button, error !== null && styles.buttonDisabled, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.buttonText}>Apply</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, marginTop: spacing.md },
  error: { fontSize: fontSize.sm, color: colors.danger },
  button: {
    minHeight: TOUCH_TARGET,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: colors.barMuted },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: fontSize.md },
});
