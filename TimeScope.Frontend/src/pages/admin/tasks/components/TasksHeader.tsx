import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ListTodo, Plus } from 'lucide-react';
import { TaskForm } from './TaskForm';
import { CreateTaskDto } from '@/lib/api/services';
import { Project } from '@/lib/api/services/projects.service';
import { User } from '@/lib/api/services/users.service';

interface TasksHeaderProps {
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  formData: CreateTaskDto;
  setFormData: (data: CreateTaskDto) => void;
  onCreateTask: () => void;
  onResetForm: () => void;
  projects: Project[];
  users: User[];
}

export function TasksHeader({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  formData,
  setFormData,
  onCreateTask,
  onResetForm,
  projects,
  users
}: TasksHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ListTodo className="h-8 w-8 text-primary" />
          Gestion des Tâches
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez les tâches, assignations et suivez la progression
        </p>
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={onResetForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Tâche
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle tâche</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle tâche au système
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            formData={formData}
            setFormData={setFormData}
            projects={projects}
            users={users}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={onCreateTask}>Créer la tâche</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
