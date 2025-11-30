import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, Database } from 'lucide-react';
import { useDatabaseStats, useDatabaseHealth } from '@/lib/hooks/use-database-maintenance';
import { DatabaseMaintenanceHeader } from './components/DatabaseMaintenanceHeader';
import { HealthStatusCard } from './components/HealthStatusCard';
import { DatabaseStatsCard } from './components/DatabaseStatsCard';

export default function DatabaseMaintenancePageAPI() {
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDatabaseStats();
  const { health, loading: healthLoading, error: healthError, refetch: refetchHealth } = useDatabaseHealth();

  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchHealth()]);
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
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      <DatabaseMaintenanceHeader onRefresh={handleRefresh} />

      {health && <HealthStatusCard health={health} />}

      {stats && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 mb-4 md:mb-6">
          <DatabaseStatsCard
            title="Base Admin"
            description="Utilisateurs et authentification"
            icon={Database}
            iconColor="text-blue-500"
            rows={[
              { label: 'Total utilisateurs', value: stats.adminDatabase.usersCount ?? 0 },
              { label: 'Utilisateurs actifs', value: stats.adminDatabase.activeUsersCount ?? 0 },
              { label: 'Total enregistrements', value: stats.adminDatabase.totalRecords ?? 0 },
              { label: 'Dernière mise à jour', value: stats.adminDatabase.lastUpdated ?? '', isDate: true },
            ]}
          />

          <DatabaseStatsCard
            title="Base Projects"
            description="Projets, groupes et thèmes"
            icon={Database}
            iconColor="text-purple-500"
            rows={[
              { label: 'Projets', value: stats.projectsDatabase.projectsCount ?? 0 },
              { label: 'Groupes', value: stats.projectsDatabase.groupsCount ?? 0 },
              { label: 'Thèmes', value: stats.projectsDatabase.themesCount ?? 0 },
              { label: 'Total enregistrements', value: stats.projectsDatabase.totalRecords ?? 0 },
            ]}
          />

          <DatabaseStatsCard
            title="Base Time"
            description="Tâches et entrées de temps"
            icon={Database}
            iconColor="text-green-500"
            rows={[
              { label: 'Tâches', value: stats.timeDatabase.tasksCount ?? 0 },
              { label: 'Entrées de temps', value: stats.timeDatabase.timeEntriesCount ?? 0 },
              { label: 'Total enregistrements', value: stats.timeDatabase.totalRecords ?? 0 },
            ]}
          />

          <DatabaseStatsCard
            title="Base Reports"
            description="Analytics et rapports"
            icon={Database}
            iconColor="text-orange-500"
            rows={[
              { label: 'Total enregistrements', value: stats.reportsDatabase.totalRecords ?? 0 },
              { label: '', value: 'En cours de développement' },
            ]}
          />
        </div>
      )}
    </div>
  );
}
