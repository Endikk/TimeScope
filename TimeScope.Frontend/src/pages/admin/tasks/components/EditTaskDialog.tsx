import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TaskForm } from './TaskForm';
import { CreateTaskDto } from '@/lib/api/services';
import { Project } from '@/lib/api/services/projects.service';
import { User } from '@/lib/api/services/users.service';

interface EditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateTaskDto;
  setFormData: (data: CreateTaskDto) => void;
  onSave: () => void;
  projects: Project[];
  users: User[];
}

export function EditTaskDialog({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSave,
  projects,
  users
}: EditTaskDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier la tâche</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la tâche
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          formData={formData}
          setFormData={setFormData}
          projects={projects}
          users={users}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
