"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, AlertCircle, Server, Activity } from 'lucide-react';
import { useSystemMetrics, useSystemInfo, useHealthStatus, useLogs, useGarbageCollection } from '@/lib/hooks/use-monitoring';
import { MonitoringHeader } from './components/MonitoringHeader';
import { HealthCard } from './components/HealthCard';
import { MetricsCards } from './components/MetricsCards';
import { SystemInfoTab } from './components/SystemInfoTab';
import { LogsTab } from './components/LogsTab';

export default function SystemMonitoringPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { metrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useSystemMetrics(autoRefresh, 5000);
  const { info, loading: infoLoading, error: infoError, refetch: refetchInfo } = useSystemInfo();
  const { health, loading: healthLoading, error: healthError, refetch: refetchHealth } = useHealthStatus(autoRefresh, 10000);
  const { logs, refetch: refetchLogs } = useLogs(50);
  const { forceGC, loading: gcLoading } = useGarbageCollection();

  const handleForceGC = async () => {
    await forceGC();
    refetchMetrics();
  };

  const handleRefreshAll = () => {
    refetchMetrics();
    refetchInfo();
    refetchHealth();
    refetchLogs();
  };

  if (metricsLoading || infoLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des données de monitoring...</p>
        </div>
      </div>
    );
  }

  if (metricsError || infoError || healthError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Une erreur s'est produite lors du chargement des données de monitoring :
            </p>
            {metricsError && <p className="text-sm text-red-600">• Métriques : {metricsError}</p>}
            {infoError && <p className="text-sm text-red-600">• Informations système : {infoError}</p>}
            {healthError && <p className="text-sm text-red-600">• État de santé : {healthError}</p>}
            <Button onClick={handleRefreshAll} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <MonitoringHeader
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        onRefresh={handleRefreshAll}
        onForceGC={handleForceGC}
        gcLoading={gcLoading}
      />

      {health && <HealthCard health={health} />}

      {metrics && <MetricsCards metrics={metrics} />}

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">
            <Server className="w-4 h-4 mr-2" />
            Informations Système
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="w-4 h-4 mr-2" />
            Logs Système
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          {info && <SystemInfoTab info={info} />}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {logs && <LogsTab logs={logs} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
