import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity } from 'lucide-react';

interface Statistics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalTasks: number;
  totalTimeEntries: number;
  recentAuditLogs: number;
  period: string;
}

interface StatisticsCardsProps {
  statistics: Statistics | null;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  if (!statistics) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-900">Utilisateurs</CardTitle>
          <Users className="h-4 w-4 text-blue-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{statistics.totalUsers}</div>
          <p className="text-xs text-blue-700 mt-1">{statistics.activeUsers} actifs</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-900">Projets</CardTitle>
          <Activity className="h-4 w-4 text-green-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{statistics.totalProjects}</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-900">Tâches</CardTitle>
          <Activity className="h-4 w-4 text-purple-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{statistics.totalTasks}</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-900">Saisies de temps</CardTitle>
          <Activity className="h-4 w-4 text-orange-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{statistics.totalTimeEntries}</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-pink-900">Logs d'audit</CardTitle>
          <Activity className="h-4 w-4 text-pink-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-pink-900">{statistics.recentAuditLogs}</div>
          <p className="text-xs text-pink-700 mt-1">{statistics.period}</p>
        </CardContent>
      </Card>
    </div>
  );
}
