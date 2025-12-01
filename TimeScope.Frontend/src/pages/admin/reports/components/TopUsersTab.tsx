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

interface TopUser {
  userId: string;
  userName: string;
  actionCount: number;
  lastActivity: string;
}

interface TopUsersTabProps {
  topUsers: TopUser[];
}

export function TopUsersTab({ topUsers }: TopUsersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisateurs les Plus Actifs</CardTitle>
        <CardDescription>
          Top 10 des utilisateurs par nombre d'actions (30 derniers jours)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune donnée disponible
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[60px]">Rang</TableHead>
                  <TableHead className="min-w-[150px]">Utilisateur</TableHead>
                  <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                  <TableHead className="text-right min-w-[120px] hidden md:table-cell">Dernière Activité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers.map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <Badge variant={index < 3 ? 'default' : 'secondary'} className="text-xs">
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-xs md:text-sm">{user.userName}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-primary text-xs md:text-sm">{user.actionCount}</span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs hidden md:table-cell">
                      {format(new Date(user.lastActivity), 'dd/MM/yyyy HH:mm')}
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
