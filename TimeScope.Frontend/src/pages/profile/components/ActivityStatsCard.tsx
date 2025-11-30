import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CheckCircle2, Clock, ListTodo } from 'lucide-react';

interface ActivityStatsCardProps {
  stats: {
    tasksCompleted: number;
    tasksInProgress: number;
    totalHours: number;
    projectsCount: number;
  };
}

export function ActivityStatsCard({ stats }: ActivityStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Statistiques d'Activité
        </CardTitle>
        <CardDescription>
          Votre activité sur les 30 derniers jours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tâches terminées</span>
              <CheckCircle2 className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-indigo-600">{stats.tasksCompleted}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">En cours</span>
              <ListTodo className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.tasksInProgress}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Heures totales</span>
              <Clock className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-indigo-500">{stats.totalHours}h</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Projets</span>
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-500">{stats.projectsCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
