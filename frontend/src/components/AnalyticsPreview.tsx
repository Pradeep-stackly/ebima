import { StyleSheet, View } from 'react-native';
import { spacing } from '../constants/theme';
import { Analytics } from '../types';
import EmptyState from './EmptyState';
import OrderStatusCard from './OrderStatusCard';
import RevenueTrendCard from './RevenueTrendCard';
import TopCategoryCard from './TopCategoryCard';

interface AnalyticsPreviewProps {
  analytics: Analytics;
}

export default function AnalyticsPreview({ analytics }: AnalyticsPreviewProps) {
  const { revenueTrend, ordersSummary, topCategory } = analytics;

  return (
    <View style={styles.container}>
      <RevenueTrendCard points={revenueTrend} />
      <OrderStatusCard summary={ordersSummary} />
      {topCategory ? (
        <TopCategoryCard category={topCategory} />
      ) : (
        <EmptyState icon="trophy-outline" title="No top category" message="No category sales in this period." />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
});
