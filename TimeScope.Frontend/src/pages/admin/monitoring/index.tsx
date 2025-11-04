import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Database,
  Users,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: any;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

export default function MonitoringPage() {
  const [cpuData, setCpuData] = useState<number[]>([45, 52, 48, 61, 59, 55, 62]);
  const [memoryData, setMemoryData] = useState<number[]>([65, 68, 66, 72, 70, 75, 73]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate real-time data updates
      setCpuData(prev => [...prev.slice(1), Math.floor(Math.random() * 30) + 40]);
      setMemoryData(prev => [...prev.slice(1), Math.floor(Math.random() * 20) + 60]);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const performanceData = cpuData.map((cpu, index) => ({
    time: `${index}m`,
    cpu: cpu,
    memory: memoryData[index],
    disk: Math.floor(Math.random() * 15) + 30
  }));

  const metrics: SystemMetric[] = [
    { name: 'CPU', value: cpuData[cpuData.length - 1], unit: '%', status: 'good', icon: Cpu },
    { name: 'Mémoire', value: memoryData[memoryData.length - 1], unit: '%', status: 'warning', icon: HardDrive },
    { name: 'Disque', value: 42, unit: '%', status: 'good', icon: Database },
    { name: 'Réseau', value: 156, unit: 'Mbps', status: 'good', icon: Wifi }
  ];

  const apiMetrics = [
    { endpoint: '/api/users', requests: 1247, avgTime: 45, errors: 2 },
    { endpoint: '/api/projects', requests: 892, avgTime: 52, errors: 0 },
    { endpoint: '/api/timeentries', requests: 3421, avgTime: 38, errors: 5 },
    { endpoint: '/api/tasks', requests: 654, avgTime: 41, errors: 1 },
    { endpoint: '/api/reports', requests: 234, avgTime: 125, errors: 0 }
  ];

  const recentLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: 'info',
      message: 'Sauvegarde automatique effectuée avec succès',
      source: 'BackupService'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      level: 'warning',
      message: 'Utilisation de la mémoire élevée (75%)',
      source: 'SystemMonitor'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      level: 'error',
      message: 'Échec de connexion à la base de données (tentative 1/3)',
      source: 'DatabaseService'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      level: 'info',
      message: 'Nouvel utilisateur enregistré: alice@example.com',
      source: 'AuthService'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 420000).toISOString(),
      level: 'info',
      message: 'Cache invalidé pour les projets',
      source: 'CacheService'
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 480000).toISOString(),
      level: 'warning',
      message: 'Taux de requêtes API élevé détecté',
      source: 'ApiGateway'
    }
  ];

  const getStatusBadge = (status: SystemMetric['status']) => {
    const styles = {
      'good': { bg: 'bg-green-100 text-green-800', icon: CheckCircle2, text: 'Normal' },
      'warning': { bg: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, text: 'Attention' },
      'critical': { bg: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'Critique' }
    };
    const config = styles[status];
    const Icon = config.icon;
    return (
      <Badge className={config.bg}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getLogBadge = (level: LogEntry['level']) => {
    const styles = {
      'info': 'bg-blue-100 text-blue-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'error': 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[level]}>{level.toUpperCase()}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring système</h1>
          <p className="text-muted-foreground">
            Surveillez les performances et l'état de santé de votre application
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Dernière mise à jour</div>
          <div className="text-lg font-semibold">{currentTime.toLocaleTimeString('fr-FR')}</div>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isUp = Math.random() > 0.5;
          return (
            <Card key={metric.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}{metric.unit}</div>
                <div className="flex items-center justify-between mt-2">
                  {getStatusBadge(metric.status)}
                  <div className={`text-xs flex items-center ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {isUp ? (
                      <>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +2.5%
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 mr-1" />
                        -1.2%
                      </>
                    )}
                  </div>
                </div>
                <Progress value={metric.value} className="mt-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Application Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.98%</div>
            <p className="text-xs text-muted-foreground">28 jours, 14h, 32m</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+8 depuis 1h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requêtes API</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.4K</div>
            <p className="text-xs text-muted-foreground">Dernière heure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'erreur</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.12%</div>
            <p className="text-xs text-green-600">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -0.05% vs hier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance système en temps réel</CardTitle>
            <CardDescription>CPU et mémoire (dernières 7 minutes)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="CPU (%)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Mémoire (%)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisation des ressources</CardTitle>
            <CardDescription>Vue d'ensemble des ressources</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="disk"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Disque (%)"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stackId="1"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  name="Mémoire (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* API Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance des API</CardTitle>
          <CardDescription>Métriques des endpoints (dernière heure)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead>Requêtes</TableHead>
                <TableHead>Temps moyen (ms)</TableHead>
                <TableHead>Erreurs</TableHead>
                <TableHead>Taux d'erreur</TableHead>
                <TableHead>État</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiMetrics.map((api) => {
                const errorRate = ((api.errors / api.requests) * 100).toFixed(2);
                const status = api.errors === 0 ? 'good' : parseFloat(errorRate) < 1 ? 'warning' : 'critical';
                return (
                  <TableRow key={api.endpoint}>
                    <TableCell className="font-mono text-sm">{api.endpoint}</TableCell>
                    <TableCell>{api.requests.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={api.avgTime > 100 ? 'text-yellow-600' : 'text-green-600'}>
                        {api.avgTime} ms
                      </span>
                    </TableCell>
                    <TableCell>
                      {api.errors > 0 ? (
                        <span className="text-red-600 font-semibold">{api.errors}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </TableCell>
                    <TableCell>{errorRate}%</TableCell>
                    <TableCell>{getStatusBadge(status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Logs récents</CardTitle>
            <CardDescription>Événements système en temps réel</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Voir tous les logs
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                <div className="pt-0.5">
                  {log.level === 'info' && <Activity className="h-4 w-4 text-blue-600" />}
                  {log.level === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  {log.level === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getLogBadge(log.level)}
                    <span className="text-xs text-muted-foreground">{log.source}</span>
                  </div>
                  <p className="text-sm">{log.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(log.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>État des services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'API Backend', status: 'good' },
              { name: 'Base de données', status: 'good' },
              { name: 'Cache Redis', status: 'good' },
              { name: 'Service Email', status: 'warning' },
              { name: 'Stockage fichiers', status: 'good' }
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <span className="text-sm">{service.name}</span>
                {getStatusBadge(service.status as any)}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes actives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Utilisation mémoire élevée</p>
                <p className="text-xs text-muted-foreground">Depuis 15 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Aucune autre alerte</p>
                <p className="text-xs text-muted-foreground">Système stable</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Server className="mr-2 h-4 w-4" />
              Redémarrer les services
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Database className="mr-2 h-4 w-4" />
              Vider le cache
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Activity className="mr-2 h-4 w-4" />
              Exporter les métriques
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Gérer les alertes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
