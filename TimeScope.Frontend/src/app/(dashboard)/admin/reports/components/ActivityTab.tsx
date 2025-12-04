import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface Activity {
  entityType: string;
  action: string;
  count: number;
  lastOccurrence: string;
}

interface ActivityTabProps {
  activities: Activity[];
}

export function ActivityTab({ activities }: ActivityTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé d'Activité (7 derniers jours)</CardTitle>
        <CardDescription>
          Actions les plus fréquentes par type d'entité
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune activité enregistrée
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Type d'Entité</TableHead>
                  <TableHead className="min-w-[100px]">Action</TableHead>
                  <TableHead className="text-right min-w-[80px]">Nombre</TableHead>
                  <TableHead className="text-right min-w-[120px] hidden md:table-cell">Dernière Occurrence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="text-xs">{activity.entityType}</Badge>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">{activity.action}</TableCell>
                    <TableCell className="text-right font-semibold text-xs md:text-sm">{activity.count}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs hidden md:table-cell">
                      {format(new Date(activity.lastOccurrence), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
