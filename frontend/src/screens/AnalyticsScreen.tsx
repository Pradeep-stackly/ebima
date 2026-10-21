import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomRangePicker from '../components/CustomRangePicker';
import DateRangeFilter from '../components/DateRangeFilter';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import KpiGrid from '../components/KpiGrid';
import LoadingState from '../components/LoadingState';
import OrderStatusCard from '../components/OrderStatusCard';
import ProfitSummaryCard from '../components/ProfitSummaryCard';
import RevenueTrendCard from '../components/RevenueTrendCard';
import SectionHeader from '../components/SectionHeader';
import StatGrid from '../components/StatGrid';
import TopCategoryCard from '../components/TopCategoryCard';
import { colors, fontSize, MAX_CONTENT_WIDTH, radius, spacing } from '../constants/theme';
import { useAnalyticsOverview } from '../hooks/useAnalyticsOverview';
import { AnalyticsOverview, DateRange } from '../types/analytics';
import { getPresetRange, RangePreset, rangeKey } from '../utils/dateRange';
import { formatDateRange } from '../utils/dates';
import { formatCurrency, formatNumber } from '../utils/format';

function comparisonCaption(data: AnalyticsOverview): string | undefined {
  if (!data.comparisonPeriod) return undefined;
  return data.comparisonPeriod.days === 1 ? 'vs previous day' : `vs previous ${data.comparisonPeriod.days} days`;
}

export default function AnalyticsScreen() {
  const [preset, setPreset] = useState<RangePreset>('last7');
  const [range, setRange] = useState<DateRange>(() => getPresetRange('last7'));
  const [showCustom, setShowCustom] = useState(false);
  const { data, loading, refreshing, error, retry, refresh } = useAnalyticsOverview(range);
  const showingSelected =
    data !== null && data.period.startDate === range.startDate && data.period.endDate === range.endDate;

  function handleSelect(next: RangePreset) {
    setPreset(next);
    if (next === 'custom') {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    setRange(getPresetRange(next));
  }

  function handleApplyCustom(custom: DateRange) {
    setRange(custom);
    setShowCustom(false);
  }

  function renderContent() {
    if (!data) {
      return (
        <View style={styles.stateBox}>
          {loading ? (
            <LoadingState message="Loading analytics..." />
          ) : (
            <ErrorState message={error ?? 'No analytics data available.'} onRetry={retry} />
          )}
        </View>
      );
    }

    const { metrics, indicators } = data;
    const loadedPeriod = formatDateRange(data.period.startDate, data.period.endDate);

    return (
      <View style={loading && styles.updating}>
        {error ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              {showingSelected ? error : `Couldn't load this period. Showing ${loadedPeriod} instead.`}
            </Text>
            <Pressable onPress={retry} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.bannerAction}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {!data.hasData ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="No orders in this period"
              message={`There are no orders between ${loadedPeriod}. Try a different date range.`}
            />
          </View>
        ) : (
          <>
            <SectionHeader title="Overview" subtitle="Pending and cancelled orders are not counted as sales" />
            <KpiGrid kpis={metrics} caption={comparisonCaption(data)} />

            <View style={styles.stack}>
              <RevenueTrendCard points={data.revenueTrend} interactive />
              <ProfitSummaryCard
                revenue={metrics.revenue.value}
                profit={metrics.profit.value}
                margin={indicators.profitMargin}
              />
            </View>

            <SectionHeader title="Sales performance" />
            <StatGrid
              items={[
                { label: 'Avg. order value', value: formatCurrency(indicators.averageOrderValue) },
                { label: 'Items sold', value: formatNumber(indicators.itemsSold) },
                { label: 'Profit margin', value: `${indicators.profitMargin}%` },
                { label: 'Cancellation rate', value: `${indicators.cancellationRate}%` },
              ]}
            />

            <View style={styles.stack}>
              <OrderStatusCard summary={data.orderStatus} />
              {data.topCategory ? (
                <TopCategoryCard category={data.topCategory} />
              ) : (
                <EmptyState
                  icon="trophy-outline"
                  title="No top category"
                  message="There are no completed sales in this period."
                />
              )}
            </View>
          </>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.periodRow}>
          <Text style={styles.period}>{formatDateRange(range.startDate, range.endDate)}</Text>
          {loading && data ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        </View>
        {data?.comparisonPeriod && showingSelected && !loading ? (
          <Text style={styles.comparison}>
            Compared with {formatDateRange(data.comparisonPeriod.startDate, data.comparisonPeriod.endDate)}
          </Text>
        ) : null}

        <View style={styles.filters}>
          <DateRangeFilter selected={preset} onSelect={handleSelect} />
        </View>

        {showCustom ? (
          <CustomRangePicker key={rangeKey(range)} initialRange={range} onApply={handleApplyCustom} />
        ) : null}

        {renderContent()}
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
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, paddingTop: spacing.sm },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  period: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
  comparison: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  filters: { marginTop: spacing.lg },
  stateBox: { minHeight: 320 },
  updating: { opacity: 0.5 },
  stack: { gap: spacing.md },
  emptyWrap: { marginTop: spacing.xl },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  bannerText: { flex: 1, color: colors.danger, fontSize: fontSize.sm },
  bannerAction: { color: colors.danger, fontWeight: '700', fontSize: fontSize.sm },
});
