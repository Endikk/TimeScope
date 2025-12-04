import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  userName: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

interface AuditLogsTabProps {
  logs: AuditLog[];
}

export function AuditLogsTab({ logs }: AuditLogsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs d'Audit Récents</CardTitle>
        <CardDescription>
          50 dernières actions enregistrées dans le système
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun log disponible
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] md:max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 md:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">{log.action}</Badge>
                      <Badge variant="secondary" className="text-xs">{log.entityType}</Badge>
                      <span className="text-xs md:text-sm font-medium truncate">{log.userName}</span>
                    </div>
                    {log.details && (
                      <p className="text-xs md:text-sm text-muted-foreground">{log.details}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-muted-foreground">
                      <span>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}</span>
                      {log.ipAddress && <span className="hidden sm:inline">IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
