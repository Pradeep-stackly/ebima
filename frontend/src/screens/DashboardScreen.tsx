import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActivityList from '../components/ActivityList';
import AnalyticsPreview from '../components/AnalyticsPreview';
import DashboardHeader from '../components/DashboardHeader';
import ErrorState from '../components/ErrorState';
import KpiGrid from '../components/KpiGrid';
import LoadingState from '../components/LoadingState';
import SectionHeader from '../components/SectionHeader';
import { colors, fontSize, MAX_CONTENT_WIDTH, radius, spacing } from '../constants/theme';
import { useDashboardData } from '../hooks/useDashboardData';
import { TabScreenProps } from '../navigation/types';

export default function DashboardScreen({ navigation }: TabScreenProps<'Dashboard'>) {
  const { data, loading, refreshing, error, retry, refresh } = useDashboardData();

  if (loading && !data) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (!data) {
    return <ErrorState message={error ?? 'No dashboard data available.'} onRetry={retry} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <DashboardHeader
          userName={data.user.name}
          unreadAlerts={data.unreadAlerts}
          onNotificationPress={() => navigation.navigate('Alerts')}
          onProfilePress={() => navigation.navigate('Profile')}
        />

        {error ? <Text style={styles.banner}>Couldn't refresh. Showing the last loaded data.</Text> : null}

        <SectionHeader title="Overview" subtitle={`Last ${data.period.days} days`} />
        <KpiGrid kpis={data.kpis} />

        <SectionHeader title="Analytics" subtitle="Sales performance at a glance" />
        <AnalyticsPreview analytics={data.analytics} />

        <SectionHeader title="Recent Activity" />
        <ActivityList items={data.recentActivities} />
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
  banner: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
    fontSize: fontSize.sm,
  },
});
