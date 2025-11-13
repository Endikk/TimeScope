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
  BarChart3,
  Activity,
  TrendingUp,
  Users,
  FolderKanban,
  Database,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useReportStatistics, useActivitySummary, useTopUsers, useAuditLogs } from '@/lib/hooks/use-reports';
import { format } from 'date-fns';

export default function ReportsPageAPI() {
  const { statistics, loading: statsLoading, refetch: refetchStats } = useReportStatistics();
  const { activities, loading: activitiesLoading, refetch: refetchActivities } = useActivitySummary(7);
  const { topUsers, loading: usersLoading, refetch: refetchUsers } = useTopUsers({ limit: 10, days: 30 });
  const { logs, loading: logsLoading, refetch: refetchLogs } = useAuditLogs({ limit: 50 });

  const handleRefreshAll = () => {
    refetchStats();
    refetchActivities();
    refetchUsers();
    refetchLogs();
  };

  if (statsLoading || activitiesLoading || usersLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des rapports et analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rapports et Analyses</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Vue d'ensemble des statistiques et de l'activité
          </p>
        </div>
        <Button onClick={handleRefreshAll} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6">
              <CardTitle className="text-xs md:text-sm font-medium text-blue-900 truncate pr-2">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-blue-600 shrink-0" />
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <div className="text-2xl md:text-3xl font-bold text-blue-900">{statistics.totalUsers}</div>
              <p className="text-xs text-blue-700 mt-1">Utilisateurs actifs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6">
              <CardTitle className="text-xs md:text-sm font-medium text-blue-900 truncate pr-2">Projets</CardTitle>
              <FolderKanban className="h-4 w-4 text-blue-600 shrink-0" />
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <div className="text-2xl md:text-3xl font-bold text-blue-900">{statistics.totalProjects}</div>
              <p className="text-xs text-blue-700 mt-1">{statistics.totalGroups} groupes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6">
              <CardTitle className="text-xs md:text-sm font-medium text-blue-900 truncate pr-2">Tâches</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600 shrink-0" />
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <div className="text-2xl md:text-3xl font-bold text-blue-900">{statistics.totalTasks}</div>
              <p className="text-xs text-blue-700 mt-1">{statistics.totalThemes} thèmes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6">
              <CardTitle className="text-xs md:text-sm font-medium text-blue-900 truncate pr-2">Entrées de temps</CardTitle>
              <Clock className="h-4 w-4 text-blue-600 shrink-0" />
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <div className="text-2xl md:text-3xl font-bold text-blue-900">{statistics.totalTimeEntries}</div>
              <p className="text-xs text-blue-700 mt-1">{statistics.totalAuditLogs} logs d'audit</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity" className="text-xs md:text-sm">
            <Activity className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Activité</span>
            <span className="sm:hidden">Act.</span>
          </TabsTrigger>
          <TabsTrigger value="top-users" className="text-xs md:text-sm">
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Utilisateurs</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="audit-logs" className="text-xs md:text-sm">
            <Database className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Logs d'Audit</span>
            <span className="sm:hidden">Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Résumé d'Activité (7 derniers jours)</CardTitle>
              <CardDescription>
                Actions les plus fréquentes par type d'entité
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune activité enregistrée
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Type d'Entité</TableHead>
                        <TableHead className="min-w-[100px]">Action</TableHead>
                        <TableHead className="text-right min-w-[80px]">Nombre</TableHead>
                        <TableHead className="text-right min-w-[120px] hidden md:table-cell">Dernière Occurrence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="text-xs">{activity.entityType}</Badge>
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">{activity.action}</TableCell>
                          <TableCell className="text-right font-semibold text-xs md:text-sm">{activity.count}</TableCell>
                          <TableCell className="text-right text-muted-foreground text-xs hidden md:table-cell">
                            {format(new Date(activity.lastOccurrence), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Users Tab */}
        <TabsContent value="top-users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs les Plus Actifs</CardTitle>
              <CardDescription>
                Top 10 des utilisateurs par nombre d'actions (30 derniers jours)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune donnée disponible
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[60px]">Rang</TableHead>
                        <TableHead className="min-w-[150px]">Utilisateur</TableHead>
                        <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                        <TableHead className="text-right min-w-[120px] hidden md:table-cell">Dernière Activité</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topUsers.map((user, index) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <Badge variant={index < 3 ? 'default' : 'secondary'} className="text-xs">
                              #{index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-xs md:text-sm">{user.userName}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-primary text-xs md:text-sm">{user.actionCount}</span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-xs hidden md:table-cell">
                            {format(new Date(user.lastActivity), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs d'Audit Récents</CardTitle>
              <CardDescription>
                50 dernières actions enregistrées dans le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun log disponible
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] md:max-h-[600px] overflow-y-auto">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 md:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">{log.action}</Badge>
                            <Badge variant="secondary" className="text-xs">{log.entityType}</Badge>
                            <span className="text-xs md:text-sm font-medium truncate">{log.userName}</span>
                          </div>
                          {log.details && (
                            <p className="text-xs md:text-sm text-muted-foreground">{log.details}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-muted-foreground">
                            <span>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}</span>
                            {log.ipAddress && <span className="hidden sm:inline">IP: {log.ipAddress}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
