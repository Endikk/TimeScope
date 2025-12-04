import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, HardDrive } from 'lucide-react';
import { AreaChart, ResponsiveContainer, Area as RechartsArea } from 'recharts';
import { useEffect, useRef, useState } from 'react';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsed: number;
}

interface MetricsCardProps {
  loading: boolean;
  metrics: SystemMetrics | null;
}

interface MetricHistory {
  timestamp: number;
  cpu: number;
  memory: number;
}

export function MetricsCard({ metrics }: MetricsCardProps) {
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const historyRef = useRef<MetricHistory[]>([]);

  useEffect(() => {
    if (metrics) {
      const newPoint = {
        timestamp: Date.now(),
        cpu: metrics.cpuUsage ?? 0,
        memory: metrics.memoryUsed ?? 0
      };
      const newHistory = [...historyRef.current, newPoint];
      if (newHistory.length > 30) newHistory.shift(); // Keep last 30 points (approx 1 min at 2s interval)
      historyRef.current = newHistory;
      setHistory(newHistory);
    }
  }, [metrics]);

  const getCpuColor = (usage: number) => {
    if (usage < 50) return 'text-green-500';
    if (usage < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
      {/* CPU Card */}
      <Card className="border shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className={`text-2xl font-bold ${getCpuColor(metrics?.cpuUsage ?? 0)}`}>
                  {metrics?.cpuUsage?.toFixed(1) ?? '0.0'}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {(metrics?.cpuUsage ?? 0) < 50 ? 'Normal Load' : 'High Load'}
                </span>
              </div>
              <Badge variant={(metrics?.cpuUsage ?? 0) < 80 ? 'outline' : 'destructive'}>
                {(metrics?.cpuUsage ?? 0) < 80 ? 'Healthy' : 'Critical'}
              </Badge>
            </div>
            <div className="h-[80px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <RechartsArea
                    type="monotone"
                    dataKey="cpu"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorCpu)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Card */}
      <Card className="border shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {metrics?.memoryUsed ?? 0} <span className="text-sm font-normal text-muted-foreground">MB</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  of 4096 MB Total
                </span>
              </div>
              <Badge variant="outline">
                {((metrics?.memoryUsed ?? 0) / 4096 * 100).toFixed(0)}% Used
              </Badge>
            </div>
            <div className="h-[80px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <RechartsArea
                    type="monotone"
                    dataKey="memory"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorMem)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
