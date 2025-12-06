import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import type { CreateProjectDto, UpdateProjectDto } from '@/lib/api/services/projects.service';
import type { Project, Group } from '@/types/project';

interface ProjectsTabProps {
  projects: Project[];
  groups: Group[];
  loading: boolean;
  isAddOpen: boolean;
  onAddOpenChange: (open: boolean) => void;
  newProject: CreateProjectDto;
  onNewProjectChange: (project: CreateProjectDto) => void;
  onCreateProject: () => void;
  onUpdateProject: (id: string, project: UpdateProjectDto) => Promise<void>;
  onDeleteProject: (id: string) => void;
}

export function ProjectsTab({
  projects,
  groups,
  loading,
  isAddOpen,
  onAddOpenChange,
  newProject,
  onNewProjectChange,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}: ProjectsTabProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingProject) {
      await onUpdateProject(editingProject.id, {
        name: editingProject.name,
        description: editingProject.description,
        groupId: editingProject.groupId
      });
      setIsEditOpen(false);
      setEditingProject(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Projets</CardTitle>
            <CardDescription>{projects.length} projet(s)</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau projet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un projet</DialogTitle>
                <DialogDescription>Ajoutez un nouveau projet</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nom</Label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => onNewProjectChange({ ...newProject, name: e.target.value })}
                    placeholder="Mon Projet"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => onNewProjectChange({ ...newProject, description: e.target.value })}
                    placeholder="Description du projet..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Groupe</Label>
                  <Select
                    value={newProject.groupId || "none"}
                    onValueChange={(value) => onNewProjectChange({ ...newProject, groupId: value === "none" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un groupe (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun groupe</SelectItem>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => onAddOpenChange(false)}>
                  Annuler
                </Button>
                <Button onClick={onCreateProject}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      {/* Dialog d'édition */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
            <DialogDescription>Modifiez les informations du projet</DialogDescription>
          </DialogHeader>
          {editingProject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nom</Label>
                <Input
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="Mon Projet"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Description du projet..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Groupe</Label>
                <Select
                  value={editingProject.groupId || "none"}
                  onValueChange={(value) => setEditingProject({ ...editingProject, groupId: value === "none" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un groupe (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun groupe</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Chargement...</p>
        ) : projects.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Aucun projet. Cliquez sur "Nouveau projet" pour commencer.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Groupe</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="text-muted-foreground">{project.description || '-'}</TableCell>
                  <TableCell>
                    {project.groupId ? (
                      <Badge variant="secondary">
                        {groups.find(g => g.id === project.groupId)?.name || 'Groupe'}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClick(project)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteProject(project.id)}>
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
        )}
      </CardContent>
    </Card>
  );
}
