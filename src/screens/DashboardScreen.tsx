import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActivityList from '../components/ActivityList';
import AnalyticsPreview from '../components/AnalyticsPreview';
import DashboardHeader from '../components/DashboardHeader';
import KpiGrid from '../components/KpiGrid';
import SectionHeader from '../components/SectionHeader';
import { colors, fontSize, MAX_CONTENT_WIDTH, radius, spacing, TOUCH_TARGET } from '../constants/theme';
import { useDashboardData } from '../hooks/useDashboardData';
import { TabScreenProps } from '../navigation/types';

export default function DashboardScreen({ navigation }: TabScreenProps<'Dashboard'>) {
  const { data, loading, refreshing, error, refresh } = useDashboardData();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'No data available'}</Text>
        <Pressable style={styles.retryButton} onPress={refresh} accessibilityRole="button">
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <DashboardHeader
          userName={data.user.name}
          unreadAlerts={data.unreadAlerts}
          onNotificationPress={() => navigation.navigate('Alerts')}
          onProfilePress={() => navigation.navigate('Profile')}
        />

        <SectionHeader title="Overview" subtitle="This month's key metrics" />
        <KpiGrid metrics={data.kpis} />

        <SectionHeader title="Analytics" subtitle="Sales performance at a glance" />
        <AnalyticsPreview analytics={data.analytics} />

        <SectionHeader title="Recent Activity" />
        <ActivityList items={data.recentActivity} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorText: { fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
  retryButton: {
    marginTop: spacing.lg,
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  retryText: { color: '#fff', fontWeight: '600' },
});
