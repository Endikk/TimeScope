import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Users, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

interface TasksTableProps {
  filteredTasks: any[];
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
  getProjectName: (id: string) => string;
  getUserName: (id: string | undefined) => string;
}

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { color: string; label: string }> = {
    'EnAttente': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
    'EnCours': { color: 'bg-blue-100 text-blue-800', label: 'En cours' },
    'Termine': { color: 'bg-green-100 text-green-800', label: 'Terminé' },
    'En attente': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
    'En cours': { color: 'bg-blue-100 text-blue-800', label: 'En cours' },
    'Terminé': { color: 'bg-green-100 text-green-800', label: 'Terminé' },
  };
  const s = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  return <Badge className={s.color}>{s.label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const priorityMap: Record<string, { color: string; icon: any }> = {
    'Low': { color: 'bg-gray-100 text-gray-800', icon: null },
    'Medium': { color: 'bg-orange-100 text-orange-800', icon: <TrendingUp className="h-3 w-3" /> },
    'High': { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-3 w-3" /> },
  };
  const p = priorityMap[priority] || priorityMap['Medium'];
  return (
    <Badge className={p.color}>
      {p.icon && <span className="mr-1">{p.icon}</span>}
      {priority}
    </Badge>
  );
};

export function TasksTable({ filteredTasks, onEdit, onDelete, getProjectName, getUserName }: TasksTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des Tâches</CardTitle>
        <CardDescription>
          {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''} trouvée{filteredTasks.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucune tâche trouvée. Créez votre première tâche pour commencer !
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tâche</TableHead>
                  <TableHead>Projet</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Précision</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{task.name}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getProjectName(task.projectId)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getUserName(task.assignee)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority || 'Medium')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{task.precision}</Badge>
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Aucune</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit(task)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(task.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
