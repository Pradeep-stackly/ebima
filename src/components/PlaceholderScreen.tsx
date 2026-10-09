import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { IconName } from '../types/icons';

interface PlaceholderScreenProps {
  title: string;
  description: string;
  icon: IconName;
}

export default function PlaceholderScreen({ title, description, icon }: PlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.heading}>{title}</Text>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>{title} coming soon</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  heading: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, paddingTop: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  description: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
