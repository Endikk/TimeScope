import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface ActivityItem {
  time: string;
  action: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="bg-white border-fp-text/10">
      <CardHeader>
        <CardTitle className="font-heading text-fp-text">Activité récente</CardTitle>
        <CardDescription className="font-body text-fp-text/70">Vos dernières actions</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 pb-4 border-b border-fp-text/10 last:border-0">
                <div className="bg-fp-accent/10 p-2 rounded-full">
                  <Activity className="h-4 w-4 text-fp-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium font-body text-fp-text">{activity.action}</p>
                  <p className="text-xs text-fp-text/60 font-body">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucune activité récente
          </div>
        )}
      </CardContent>
    </Card>
  );
}
