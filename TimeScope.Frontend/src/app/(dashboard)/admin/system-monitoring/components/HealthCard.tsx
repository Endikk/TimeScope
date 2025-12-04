import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle, Activity } from 'lucide-react';

interface HealthCheck {
  name: string;
  status: string;
  value: string;
  message: string;
}

interface HealthStatus {
  status: string;
  checks: HealthCheck[];
}

interface HealthCardProps {
  health: HealthStatus;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'healthy':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'unhealthy':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Activity className="w-5 h-5" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'healthy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'unhealthy':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function HealthCard({ health }: HealthCardProps) {
  return (
    <Card className={getStatusColor(health.status)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(health.status)}
            <CardTitle>État de Santé: {health.status}</CardTitle>
          </div>
          <Badge variant={health.status === 'Healthy' ? 'default' : 'destructive'}>
            {health.checks.filter(c => c.status === 'Healthy').length}/{health.checks.length} OK
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {health.checks.map((check, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-white/50 rounded-lg">
              {getStatusIcon(check.status)}
              <div className="flex-1">
                <div className="font-semibold">{check.name}</div>
                <div className="text-sm text-muted-foreground">{check.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{check.message}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
