import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface ActivitySummaryProps {
  statistics: {
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    totalTimeEntries: number;
  } | null;
}

export function ActivitySummary({ statistics }: ActivitySummaryProps) {
  const total = statistics
    ? statistics.totalUsers + statistics.totalProjects + statistics.totalTasks + statistics.totalTimeEntries
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Résumé de l'activité
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Total des éléments dans le système:{' '}
            <span className="font-bold text-2xl text-primary">
              {total}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
