import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Server,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useSystemMetrics, useSystemInfo, useHealthStatus, useLogs, useGarbageCollection } from '@/lib/hooks/use-monitoring';
import { format } from 'date-fns';

export default function SystemMonitoringPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { metrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useSystemMetrics(autoRefresh, 5000);
  const { info, loading: infoLoading, error: infoError, refetch: refetchInfo } = useSystemInfo();
  const { health, loading: healthLoading, error: healthError, refetch: refetchHealth } = useHealthStatus(autoRefresh, 10000);
  const { logs, refetch: refetchLogs } = useLogs(50);
  const { forceGC, loading: gcLoading } = useGarbageCollection();

  const handleForceGC = async () => {
    await forceGC();
    alert('Garbage Collection déclenché avec succès!');
    refetchMetrics();
  };

  const handleRefreshAll = () => {
    refetchMetrics();
    refetchInfo();
    refetchHealth();
    refetchLogs();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Système</h1>
          <p className="text-muted-foreground mt-2">
            Surveillance en temps réel des ressources et de la santé du système
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-actualisation</span>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
          </div>
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleForceGC} variant="outline" size="sm" disabled={gcLoading}>
            <Trash2 className="w-4 h-4 mr-2" />
            Force GC
          </Button>
        </div>
      </div>

      {/* Health Status Card */}
      {health && (
        <Card className={getStatusColor(health.status)}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(health.status)}
                <CardTitle>État de Santé: {health.status}</CardTitle>
              </div>
              <Badge variant={health.status === 'Healthy' ? 'default' : 'destructive'}>
                {health.checks.filter(c => c.status === 'Healthy').length}/{health.checks.length} OK
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {health.checks.map((check, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-white/50 rounded-lg">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <div className="font-semibold">{check.name}</div>
                    <div className="text-sm text-muted-foreground">{check.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{check.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      {metrics && (
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
      )}

      {/* Tabs */}
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

        {/* System Info Tab */}
        <TabsContent value="info" className="space-y-4">
          {info && (
            <Card>
              <CardHeader>
                <CardTitle>Informations du Système</CardTitle>
                <CardDescription>Détails de l'environnement d'exécution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Nom d'hôte</div>
                      <div className="text-lg font-semibold">{info.hostName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Système d'exploitation</div>
                      <div className="text-lg">{info.operatingSystem}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Architecture</div>
                      <div className="text-lg">{info.architecture}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Framework</div>
                      <div className="text-lg">{info.framework}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Processeurs</div>
                      <div className="text-lg font-semibold">{info.processorCount} coeurs</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Version</div>
                      <div className="text-lg">{info.applicationVersion}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Répertoire de travail</div>
                      <div className="text-sm font-mono break-all">{info.workingDirectory}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Démarré le</div>
                      <div className="text-lg">{format(new Date(info.startTime), 'dd/MM/yyyy HH:mm:ss')}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs Système</CardTitle>
              <CardDescription>
                {logs && `${logs.total} entrées de log`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs && logs.logs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.logs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.timestamp), 'dd/MM HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.level === 'Information' ? 'default' : 'secondary'}>
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.source}</TableCell>
                        <TableCell className="text-sm">{log.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucun log disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
