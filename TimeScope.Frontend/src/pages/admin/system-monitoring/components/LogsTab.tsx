import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface Log {
  timestamp: string;
  level: string;
  source: string;
  message: string;
}

interface LogsData {
  total: number;
  logs: Log[];
}

interface LogsTabProps {
  logs: LogsData;
}

export function LogsTab({ logs }: LogsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs Système</CardTitle>
        <CardDescription>
          {logs && `${logs.total} entrées de log`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.logs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(log.timestamp), 'dd/MM HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.level === 'Information' ? 'default' : 'secondary'}>
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.source}</TableCell>
                  <TableCell className="text-sm">{log.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">Aucun log disponible</p>
        )}
      </CardContent>
    </Card>
  );
}
