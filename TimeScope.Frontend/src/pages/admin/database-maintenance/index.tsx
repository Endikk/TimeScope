import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  XCircle
} from 'lucide-react';
import { useDatabaseStats, useDatabaseHealth } from '@/lib/hooks/use-database-maintenance';

export default function DatabaseMaintenancePageAPI() {
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDatabaseStats();
  const { health, loading: healthLoading, error: healthError, refetch: refetchHealth } = useDatabaseHealth();

  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchHealth()]);
  };

  const getHealthIcon = (isHealthy: boolean) => {
    return isHealthy ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getHealthBadge = (overallStatus: string) => {
    if (overallStatus === 'Healthy') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Excellent
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Problème détecté
      </Badge>
    );
  };

  if (statsLoading || healthLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (statsError || healthError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {statsError || healthError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Maintenance des Bases de Données</h1>
          <p className="text-muted-foreground">
            Surveillance et optimisation des 4 bases de données PostgreSQL
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Health Status */}
      {health && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              État de Santé Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium">Statut:</span>
              {getHealthBadge(health.overallStatus)}
              <span className="text-xs text-muted-foreground ml-auto">
                Vérifié le {new Date(health.adminDatabase.checkedAt).toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Admin</span>
                    {getHealthIcon(health.adminDatabase.isHealthy)}
                  </div>
                  <p className="text-xs text-muted-foreground">{health.adminDatabase.message}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Projects</span>
                    {getHealthIcon(health.projectsDatabase.isHealthy)}
                  </div>
                  <p className="text-xs text-muted-foreground">{health.projectsDatabase.message}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Time</span>
                    {getHealthIcon(health.timeDatabase.isHealthy)}
                  </div>
                  <p className="text-xs text-muted-foreground">{health.timeDatabase.message}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Reports</span>
                    {getHealthIcon(health.reportsDatabase.isHealthy)}
                  </div>
                  <p className="text-xs text-muted-foreground">{health.reportsDatabase.message}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Statistics */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Admin Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Base Admin
              </CardTitle>
              <CardDescription>Utilisateurs et authentification</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total utilisateurs</TableCell>
                    <TableCell className="text-right">{stats.adminDatabase.usersCount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Utilisateurs actifs</TableCell>
                    <TableCell className="text-right">{stats.adminDatabase.activeUsersCount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total enregistrements</TableCell>
                    <TableCell className="text-right">{stats.adminDatabase.totalRecords}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Dernière mise à jour</TableCell>
                    <TableCell className="text-right text-xs">
                      {new Date(stats.adminDatabase.lastUpdated).toLocaleString('fr-FR')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Projects Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                Base Projects
              </CardTitle>
              <CardDescription>Projets, groupes et thèmes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Projets</TableCell>
                    <TableCell className="text-right">{stats.projectsDatabase.projectsCount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Groupes</TableCell>
                    <TableCell className="text-right">{stats.projectsDatabase.groupsCount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Thèmes</TableCell>
                    <TableCell className="text-right">{stats.projectsDatabase.themesCount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total enregistrements</TableCell>
                    <TableCell className="text-right">{stats.projectsDatabase.totalRecords}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Time Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                Base Time
              </CardTitle>
              <CardDescription>Tâches et entrées de temps</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Tâches</TableCell>
                    <TableCell className="text-right">{stats.timeDatabase.tasksCount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Entrées de temps</TableCell>
                    <TableCell className="text-right">{stats.timeDatabase.timeEntriesCount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total enregistrements</TableCell>
                    <TableCell className="text-right">{stats.timeDatabase.totalRecords}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Reports Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-orange-500" />
                Base Reports
              </CardTitle>
              <CardDescription>Analytics et rapports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total enregistrements</TableCell>
                    <TableCell className="text-right">{stats.reportsDatabase.totalRecords}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium" colSpan={2}>
                      <span className="text-xs text-muted-foreground">En cours de développement</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
