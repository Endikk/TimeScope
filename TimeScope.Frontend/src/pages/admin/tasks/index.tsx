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
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ListTodo, 
  Clock, 
  Users, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useTasks, useTaskMutations } from '@/lib/hooks/use-tasks';
import { useProjects } from '@/lib/hooks/use-projects';
import { useUsers } from '@/lib/hooks/use-users';
import type { CreateTaskDto } from '@/lib/api/services';

export default function TasksManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPrecision, setFilterPrecision] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // API Hooks
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { projects, loading: projectsLoading } = useProjects();
  const { users, loading: usersLoading } = useUsers();
  const { createTask, updateTask, deleteTask } = useTaskMutations();

  // Form state
  const [formData, setFormData] = useState<CreateTaskDto>({
    name: '',
    description: '',
    projectId: '',
    assigneeId: '',
    status: 'EnAttente',
    precision: 'Medium',
    priority: 'Medium',
    dueDate: '',
    estimatedTime: '00:00:00'
  });

  const handleCreateTask = async () => {
    const result = await createTask(formData);
    if (result) {
      setIsCreateDialogOpen(false);
      resetForm();
      await refetchTasks();
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    const updateDto = {
      id: selectedTask.id,
      ...formData
    };
    await updateTask(selectedTask.id, updateDto);
    setIsEditDialogOpen(false);
    setSelectedTask(null);
    resetForm();
    await refetchTasks();
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche?')) {
      await deleteTask(id);
      await refetchTasks();
    }
  };

  const openEditDialog = (task: any) => {
    setSelectedTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      projectId: task.projectId,
      assigneeId: task.assignee || '',
      status: task.status,
      precision: task.precision,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedTime: task.timeSpent || '00:00:00'
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      projectId: '',
      assigneeId: '',
      status: 'EnAttente',
      precision: 'Medium',
      priority: 'Medium',
      dueDate: '',
      estimatedTime: '00:00:00'
    });
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPrecision = filterPrecision === 'all' || task.precision === filterPrecision;
    return matchesSearch && matchesStatus && matchesPrecision;
  });

  // Statistics
  const stats = {
    total: tasks.length,
    enCours: tasks.filter(t => t.status === 'En cours').length,
    termine: tasks.filter(t => t.status === 'Terminé').length,
    enAttente: tasks.filter(t => t.status === 'En attente').length,
  };

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

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'N/A';
  };

  const getUserName = (userId: string | undefined) => {
    if (!userId) return 'Non assigné';
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'N/A';
  };

  const isLoading = tasksLoading || projectsLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-gray-600">Chargement des tâches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
        <div className="max-w-7xl mx-auto space-y-6 p-6">
          
          {/* Header */}
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
                <Button onClick={() => resetForm()}>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="project">Projet *</Label>
                      <Select
                        value={formData.projectId}
                        onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un projet" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="assignee">Assigné à</Label>
                      <Select
                        value={formData.assigneeId}
                        onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Non assigné" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Non assigné</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status">Statut</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
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
                        onValueChange={(value: any) => setFormData({ ...formData, precision: value })}
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
                        onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
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
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateTask}>Créer la tâche</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tâches</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Toutes les tâches</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Cours</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.enCours}</div>
                <p className="text-xs text-muted-foreground">Tâches actives</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Terminées</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.termine}</div>
                <p className="text-xs text-muted-foreground">Tâches complètes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.enAttente}</div>
                <p className="text-xs text-muted-foreground">À démarrer</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres et Recherche</CardTitle>
              <CardDescription>Filtrez et recherchez parmi vos tâches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom ou description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="EnAttente">En attente</SelectItem>
                    <SelectItem value="EnCours">En cours</SelectItem>
                    <SelectItem value="Termine">Terminé</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPrecision} onValueChange={setFilterPrecision}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Précision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes précisions</SelectItem>
                    <SelectItem value="Low">Basse</SelectItem>
                    <SelectItem value="Medium">Moyenne</SelectItem>
                    <SelectItem value="High">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Table */}
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
                                <DropdownMenuItem onClick={() => openEditDialog(task)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteTask(task.id)}
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

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Modifier la tâche</DialogTitle>
                <DialogDescription>
                  Modifiez les informations de la tâche
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nom de la tâche *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-project">Projet *</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-assignee">Assigné à</Label>
                    <Select
                      value={formData.assigneeId}
                      onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Non assigné</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
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
                    <Label htmlFor="edit-precision">Précision</Label>
                    <Select
                      value={formData.precision}
                      onValueChange={(value: any) => setFormData({ ...formData, precision: value })}
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
                    <Label htmlFor="edit-priority">Priorité</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
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
                    <Label htmlFor="edit-dueDate">Date d'échéance</Label>
                    <Input
                      id="edit-dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-estimatedTime">Temps estimé (HH:MM:SS)</Label>
                    <Input
                      id="edit-estimatedTime"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateTask}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        
        </div>
      </div>
    </div>
  );
}
