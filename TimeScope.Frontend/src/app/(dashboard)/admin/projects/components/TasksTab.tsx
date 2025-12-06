import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { CreateTaskDto } from '@/lib/api/services/tasks.service';
import type { Task } from '@/lib/types';
import type { Project } from '@/types/project';

interface TasksTabProps {
  tasks: Task[];
  projects: Project[];
  loading: boolean;
  isAddOpen: boolean;
  onAddOpenChange: (open: boolean) => void;
  newTask: CreateTaskDto;
  onNewTaskChange: (task: CreateTaskDto) => void;
  onCreateTask: () => void;
  onDeleteTask: (id: string) => void;
}

export function TasksTab({
  tasks,
  projects,
  loading,
  isAddOpen,
  onAddOpenChange,
  newTask,
  onNewTaskChange,
  onCreateTask,
  onDeleteTask
}: TasksTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tâches</CardTitle>
            <CardDescription>{tasks.length} tâche(s)</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle tâche
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une tâche</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nom *</Label>
                  <Input
                    value={newTask.name}
                    onChange={(e) => onNewTaskChange({ ...newTask, name: e.target.value })}
                    placeholder="Nom de la tâche"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Projet</Label>
                  <Select
                    value={newTask.projectId || "none"}
                    onValueChange={(value) => onNewTaskChange({ ...newTask, projectId: value === "none" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un projet (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun projet</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => onNewTaskChange({ ...newTask, description: e.target.value })}
                    placeholder="Description de la tâche..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Statut</Label>
                    <Select
                      value={newTask.status}
                      onValueChange={(value: "EnAttente" | "EnCours" | "Termine") => onNewTaskChange({ ...newTask, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EnAttente">En attente</SelectItem>
                        <SelectItem value="EnCours">En cours</SelectItem>
                        <SelectItem value="Termine">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Priorité</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: "Low" | "Medium" | "High") => onNewTaskChange({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Basse</SelectItem>
                        <SelectItem value="Medium">Moyenne</SelectItem>
                        <SelectItem value="High">Haute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => onAddOpenChange(false)}>
                  Annuler
                </Button>
                <Button onClick={onCreateTask}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Chargement...</p>
        ) : tasks.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Aucune tâche</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Projet</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{project?.name || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{task.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{task.priority || 'Medium'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
