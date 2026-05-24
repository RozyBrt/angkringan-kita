import { getRevenueStats, getTopItems } from '@/lib/actions/orders';
import AnalyticsClient from '@/components/admin/AnalyticsClient';

export default async function AnalyticsDashboard() {
  const [revRes, topRes] = await Promise.all([
    getRevenueStats(7),
    getTopItems(7)
  ]);

  const initialRevenueData = (revRes.success && revRes.data) ? revRes.data : [];
  const initialTopItems = (topRes.success && topRes.data) ? topRes.data : [];

  return (
    <AnalyticsClient
      initialRevenueData={initialRevenueData}
      initialTopItems={initialTopItems}
    />
  );
}
