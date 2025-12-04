import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface DatabaseHealth {
  isHealthy: boolean;
  message: string;
  checkedAt: string;
}

interface HealthStatus {
  overallStatus: string;
  adminDatabase: DatabaseHealth;
  projectsDatabase: DatabaseHealth;
  timeDatabase: DatabaseHealth;
  reportsDatabase: DatabaseHealth;
}

interface HealthStatusCardProps {
  health: HealthStatus;
}

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

export function HealthStatusCard({ health }: HealthStatusCardProps) {
  return (
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
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
  );
}
