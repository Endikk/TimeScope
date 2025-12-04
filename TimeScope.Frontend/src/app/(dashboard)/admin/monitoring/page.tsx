"use client";
import { useMonitoring } from '@/lib/hooks/use-monitoring';
import { MonitoringHeader, MetricsCard, DockerStats, ContainerList } from './components';
import { Badge } from '@/components/ui/badge';

export default function MonitoringPage() {
  const { metrics, docker, isStreaming, refetchAll } = useMonitoring(true, true);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <MonitoringHeader onRefresh={refetchAll} />
        {isStreaming && (
          <Badge variant="outline" className="w-fit animate-pulse text-green-600 border-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-1">
            <span className="mr-2">●</span> Live Monitoring
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold tracking-tight">System Resources</h3>
          <MetricsCard loading={metrics.loading} metrics={metrics.metrics} />
        </div>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold tracking-tight">Docker Infrastructure</h3>
          <DockerStats loading={!docker} metrics={docker} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Container Details</h3>
        <ContainerList containers={docker?.containers || []} />
      </div>
    </div>
  );
}
