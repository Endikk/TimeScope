import { useMonitoring } from '@/lib/hooks/use-monitoring';
import { MonitoringHeader, MetricsCard } from './components';

export default function MonitoringPage() {
  const { metrics, refetchAll } = useMonitoring(true);

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <MonitoringHeader onRefresh={refetchAll} />
      <MetricsCard loading={metrics.loading} metrics={metrics.metrics} />
    </div>
  );
}
