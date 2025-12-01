import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Database, RefreshCw } from 'lucide-react';
import { useReportStatistics, useActivitySummary, useTopUsers, useAuditLogs } from '@/lib/hooks/use-reports';
import { ReportsHeader } from './components/ReportsHeader';
import { StatisticsCards } from './components/StatisticsCards';
import { ActivityTab } from './components/ActivityTab';
import { TopUsersTab } from './components/TopUsersTab';
import { AuditLogsTab } from './components/AuditLogsTab';

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
      <ReportsHeader onRefresh={handleRefreshAll} />

      {statistics && <StatisticsCards statistics={statistics} />}

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

        <TabsContent value="activity" className="space-y-4">
          <ActivityTab activities={activities} />
        </TabsContent>

        <TabsContent value="top-users" className="space-y-4">
          <TopUsersTab topUsers={topUsers} />
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <AuditLogsTab logs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
