import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateTaskDto } from '@/lib/api/services';
import { Project } from '@/types/project';
import { User } from '@/types/user';

interface TaskFormProps {
  formData: CreateTaskDto;
  setFormData: (data: CreateTaskDto) => void;
  projects: Project[];
  users: User[];
}

export function TaskForm({ formData, setFormData, projects, users }: TaskFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nom de la tâche *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Développer le module de connexion"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description détaillée de la tâche..."
          rows={3}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="assignee">Assigné à</Label>
        <Select
          value={formData.assigneeId || 'unassigned'}
          onValueChange={(value) => setFormData({ ...formData, assigneeId: value === 'unassigned' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Non assigné" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Non assigné</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "EnAttente" | "EnCours" | "Termine") => setFormData({ ...formData, status: value })}
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
          <Label htmlFor="precision">Précision</Label>
          <Select
            value={formData.precision}
            onValueChange={(value: "Low" | "Medium" | "High") => setFormData({ ...formData, precision: value })}
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
        <div className="grid gap-2">
          <Label htmlFor="priority">Priorité</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: "Low" | "Medium" | "High") => setFormData({ ...formData, priority: value })}
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
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="dueDate">Date d'échéance</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="estimatedTime">Temps estimé (HH:MM:SS)</Label>
          <Input
            id="estimatedTime"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
            placeholder="08:00:00"
          />
        </div>
      </div>
    </div>
  );
}
