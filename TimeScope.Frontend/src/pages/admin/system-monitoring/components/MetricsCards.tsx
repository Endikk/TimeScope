import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, MemoryStick, HardDrive, Clock } from 'lucide-react';

interface Metrics {
  cpuUsage: number;
  threadCount: number;
  memoryUsed: number;
  memoryTotal: number;
  diskUsage: number;
  uptimeFormatted: string;
  handleCount: number;
}

interface MetricsCardsProps {
  metrics: Metrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-blue-900">CPU Usage</CardTitle>
          <Cpu className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">{metrics.cpuUsage.toFixed(1)}%</div>
          <p className="text-xs text-blue-700 mt-1">{metrics.threadCount} threads actifs</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-green-900">Mémoire</CardTitle>
          <MemoryStick className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">{metrics.memoryUsed} MB</div>
          <p className="text-xs text-green-700 mt-1">/ {metrics.memoryTotal} MB total</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-purple-900">Disque</CardTitle>
          <HardDrive className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-900">{metrics.diskUsage.toFixed(1)}%</div>
          <p className="text-xs text-purple-700 mt-1">Utilisation du disque</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-orange-900">Uptime</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{metrics.uptimeFormatted}</div>
          <p className="text-xs text-orange-700 mt-1">{metrics.handleCount} handles</p>
        </CardContent>
      </Card>
    </div>
  );
}
