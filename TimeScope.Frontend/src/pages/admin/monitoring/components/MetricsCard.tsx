import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, HardDrive, RefreshCw } from 'lucide-react';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsed: number;
}

interface MetricsCardProps {
  loading: boolean;
  metrics: SystemMetrics | null;
}

export function MetricsCard({ loading, metrics }: MetricsCardProps) {
  const getCpuColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 1000) return 'bg-green-500';
    if (memory < 2000) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2">
      <Card className="border-2 hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-sm md:text-base font-medium">Utilisation CPU</CardTitle>
          <Cpu className="h-4 w-4 md:h-5 md:w-5 text-blue-600 shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-xs md:text-sm">Chargement...</span>
            </div>
          ) : metrics ? (
            <div className="space-y-3">
              <div className="text-2xl md:text-3xl font-bold">
                {metrics.cpuUsage.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div
                  className={`${getCpuColor(metrics.cpuUsage)} h-2 md:h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(metrics.cpuUsage, 100)}%` }}
                />
              </div>
              <Badge variant={metrics.cpuUsage < 80 ? 'default' : 'destructive'} className="text-xs">
                {metrics.cpuUsage < 50 ? 'Normal' : metrics.cpuUsage < 80 ? 'Modéré' : 'Élevé'}
              </Badge>
            </div>
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">Aucune donnée disponible</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-sm md:text-base font-medium">Mémoire Utilisée</CardTitle>
          <HardDrive className="h-4 w-4 md:h-5 md:w-5 text-purple-600 shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-xs md:text-sm">Chargement...</span>
            </div>
          ) : metrics ? (
            <div className="space-y-3">
              <div className="text-2xl md:text-3xl font-bold">
                {metrics.memoryUsed} <span className="text-sm md:text-base text-muted-foreground">MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div
                  className={`${getMemoryColor(metrics.memoryUsed)} h-2 md:h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((metrics.memoryUsed / 4000) * 100, 100)}%` }}
                />
              </div>
              <Badge variant={metrics.memoryUsed < 2000 ? 'default' : 'destructive'} className="text-xs">
                {metrics.memoryUsed < 1000 ? 'Faible' : metrics.memoryUsed < 2000 ? 'Modéré' : 'Élevé'}
              </Badge>
            </div>
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">Aucune donnée disponible</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
