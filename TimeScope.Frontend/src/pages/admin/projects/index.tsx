import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Plus, Search, MoreHorizontal, Edit, Trash2, FolderKanban, Layers, RefreshCw } from 'lucide-react';
import { useProjects, useGroups, useThemes, useProjectMutations, useGroupMutations, useThemeMutations } from '@/lib/hooks/use-projects';
import type { CreateProjectDto, CreateGroupDto, CreateThemeDto } from '@/lib/api/services/projects.service';

export default function ProjectsManagementPageSimple() {
  // Hooks API
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { groups, loading: groupsLoading, refetch: refetchGroups } = useGroups();
  const { themes, loading: themesLoading, refetch: refetchThemes } = useThemes();

  const { createProject, updateProject, deleteProject } = useProjectMutations();
  const { createGroup, deleteGroup } = useGroupMutations();
  const { createTheme, deleteTheme } = useThemeMutations();

  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAddThemeOpen, setIsAddThemeOpen] = useState(false);

  // Formulaires
  const [newProject, setNewProject] = useState<CreateProjectDto>({ name: '', description: '' });
  const [newGroup, setNewGroup] = useState<CreateGroupDto>({ name: '', description: '' });
  const [newTheme, setNewTheme] = useState<CreateThemeDto>({ name: '', color: '#3b82f6', description: '' });

  // Handlers Projects
  const handleCreateProject = async () => {
    try {
      await createProject(newProject);
      await refetchProjects();
      setIsAddProjectOpen(false);
      setNewProject({ name: '', description: '' });
    } catch (error) {
      alert('Erreur lors de la création du projet');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await deleteProject(id);
        await refetchProjects();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Handlers Groups
  const handleCreateGroup = async () => {
    try {
      await createGroup(newGroup);
      await refetchGroups();
      setIsAddGroupOpen(false);
      setNewGroup({ name: '', description: '' });
    } catch (error) {
      alert('Erreur lors de la création du groupe');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      try {
        await deleteGroup(id);
        await refetchGroups();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Handlers Themes
  const handleCreateTheme = async () => {
    try {
      await createTheme(newTheme);
      await refetchThemes();
      setIsAddThemeOpen(false);
      setNewTheme({ name: '', color: '#3b82f6', description: '' });
    } catch (error) {
      alert('Erreur lors de la création du thème');
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce thème ?')) {
      try {
        await deleteTheme(id);
        await refetchThemes();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleRefreshAll = async () => {
    await Promise.all([refetchProjects(), refetchGroups(), refetchThemes()]);
  };

  // Filtrage
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredThemes = themes.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (projectsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{projectsError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gestion des Projets</h1>
          <p className="text-muted-foreground">
            Gérez vos projets, groupes et thèmes
          </p>
        </div>
        <Button onClick={handleRefreshAll} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groupes</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thèmes</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{themes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="groups">Groupes</TabsTrigger>
          <TabsTrigger value="themes">Thèmes</TabsTrigger>
        </TabsList>

        {/* Tab Projects */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Projets</CardTitle>
                  <CardDescription>{filteredProjects.length} projet(s)</CardDescription>
                </div>
                <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
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
                          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                          placeholder="Mon Projet"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          placeholder="Description du projet..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Groupe</Label>
                        <Select
                          value={newProject.groupId}
                          onValueChange={(value) => setNewProject({ ...newProject, groupId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un groupe (optionnel)" />
                          </SelectTrigger>
                          <SelectContent>
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
                      <Button variant="outline" onClick={() => setIsAddProjectOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateProject}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <p className="text-center py-8 text-muted-foreground">Chargement...</p>
              ) : filteredProjects.length === 0 ? (
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
                    {filteredProjects.map((project) => (
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
                              <DropdownMenuItem onClick={() => handleDeleteProject(project.id)}>
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
        </TabsContent>

        {/* Tab Groups */}
        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Groupes</CardTitle>
                  <CardDescription>{filteredGroups.length} groupe(s)</CardDescription>
                </div>
                <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau groupe
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un groupe</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Nom</Label>
                        <Input
                          value={newGroup.name}
                          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newGroup.description}
                          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddGroupOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateGroup}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {groupsLoading ? (
                <p className="text-center py-8 text-muted-foreground">Chargement...</p>
              ) : filteredGroups.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Aucun groupe</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell className="text-muted-foreground">{group.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Themes */}
        <TabsContent value="themes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Thèmes</CardTitle>
                  <CardDescription>{filteredThemes.length} thème(s)</CardDescription>
                </div>
                <Dialog open={isAddThemeOpen} onOpenChange={setIsAddThemeOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau thème
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un thème</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Nom</Label>
                        <Input
                          value={newTheme.name}
                          onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Couleur</Label>
                        <Input
                          type="color"
                          value={newTheme.color}
                          onChange={(e) => setNewTheme({ ...newTheme, color: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newTheme.description}
                          onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddThemeOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateTheme}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {themesLoading ? (
                <p className="text-center py-8 text-muted-foreground">Chargement...</p>
              ) : filteredThemes.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Aucun thème</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Couleur</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredThemes.map((theme) => (
                      <TableRow key={theme.id}>
                        <TableCell className="font-medium">{theme.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: theme.color }}
                            />
                            <span className="text-xs text-muted-foreground">{theme.color}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{theme.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTheme(theme.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
