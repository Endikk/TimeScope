import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderKanban, BarChart3, Clock } from 'lucide-react';

interface Statistics {
  totalUsers: number;
  totalProjects: number;
  totalGroups: number;
  totalTasks: number;
  totalThemes: number;
  totalTimeEntries: number;
  totalAuditLogs: number;
}

interface StatisticsCardsProps {
  statistics: Statistics;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  return (
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
  );
}
