import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, FolderKanban, Users, Calendar, CheckCircle2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  status: 'Actif' | 'En attente' | 'Terminé' | 'Archivé';
  startDate: string;
  endDate?: string;
  budget: number;
  timeSpent: number;
  team: string[];
  color: string;
}

export default function ProjectsManagementPage() {
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'TimeScope',
      description: 'Application de gestion du temps pour les équipes',
      client: 'Interne',
      status: 'Actif',
      startDate: '2025-01-01',
      budget: 500,
      timeSpent: 142,
      team: ['Alice Martin', 'Bob Dupont', 'Claire Rousseau'],
      color: '#3b82f6'
    },
    {
      id: '2',
      name: 'Client Portal',
      description: 'Portail client avec authentification et dashboard',
      client: 'TechCorp Inc.',
      status: 'Actif',
      startDate: '2025-02-15',
      budget: 300,
      timeSpent: 89,
      team: ['Alice Martin', 'David Chen'],
      color: '#8b5cf6'
    },
    {
      id: '3',
      name: 'Mobile App',
      description: 'Application mobile React Native',
      client: 'StartupXYZ',
      status: 'En attente',
      startDate: '2025-03-01',
      budget: 400,
      timeSpent: 45,
      team: ['Claire Rousseau'],
      color: '#ec4899'
    },
    {
      id: '4',
      name: 'API Backend',
      description: 'Refonte de l\'API REST en .NET 9',
      client: 'Interne',
      status: 'Actif',
      startDate: '2024-12-01',
      endDate: '2025-02-28',
      budget: 250,
      timeSpent: 198,
      team: ['Bob Dupont', 'Eve Lambert'],
      color: '#10b981'
    },
    {
      id: '5',
      name: 'Legacy Migration',
      description: 'Migration du système legacy vers le cloud',
      client: 'BigCorp Ltd.',
      status: 'Terminé',
      startDate: '2024-06-01',
      endDate: '2024-12-15',
      budget: 800,
      timeSpent: 756,
      team: ['Alice Martin', 'Bob Dupont', 'David Chen', 'Eve Lambert'],
      color: '#f59e0b'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Project['status']) => {
    const styles = {
      'Actif': 'bg-green-100 text-green-800',
      'En attente': 'bg-yellow-100 text-yellow-800',
      'Terminé': 'bg-blue-100 text-blue-800',
      'Archivé': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'Actif').length,
    pending: projects.filter(p => p.status === 'En attente').length,
    completed: projects.filter(p => p.status === 'Terminé').length
  };

  const ProjectForm = ({ project }: { project?: Project }) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nom du projet</Label>
        <Input id="name" defaultValue={project?.name} placeholder="Ex: TimeScope" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" defaultValue={project?.description} placeholder="Description du projet" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="client">Client</Label>
          <Input id="client" defaultValue={project?.client} placeholder="Nom du client" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Statut</Label>
          <Select defaultValue={project?.status || 'Actif'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Actif">Actif</SelectItem>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="Terminé">Terminé</SelectItem>
              <SelectItem value="Archivé">Archivé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="startDate">Date de début</Label>
          <Input id="startDate" type="date" defaultValue={project?.startDate} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endDate">Date de fin</Label>
          <Input id="endDate" type="date" defaultValue={project?.endDate} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="budget">Budget (heures)</Label>
        <Input id="budget" type="number" defaultValue={project?.budget} placeholder="500" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="color">Couleur</Label>
        <Input id="color" type="color" defaultValue={project?.color || '#3b82f6'} />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des projets</h1>
          <p className="text-muted-foreground">
            Gérez vos projets, clients et budgets
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau projet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau projet à votre système de gestion du temps
              </DialogDescription>
            </DialogHeader>
            <ProjectForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Créer le projet</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projets</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Dans le système</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">En cours de développement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">À démarrer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des projets</CardTitle>
          <CardDescription>Tous vos projets en un coup d'œil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un projet ou un client..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="Terminé">Terminé</SelectItem>
                <SelectItem value="Archivé">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projet</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Temps</TableHead>
                <TableHead>Équipe</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {project.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(project.startDate).toLocaleDateString('fr-FR')}</div>
                      {project.endDate && (
                        <div className="text-muted-foreground">
                          → {new Date(project.endDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{project.budget}h</div>
                      <div className="text-muted-foreground">
                        {Math.round((project.timeSpent / project.budget) * 100)}% utilisé
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{project.timeSpent}h</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{project.team.length}</span>
                    </div>
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingProject(project)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editingProject !== null} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
            <DialogDescription>
              Modifiez les informations du projet {editingProject?.name}
            </DialogDescription>
          </DialogHeader>
          {editingProject && <ProjectForm project={editingProject} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProject(null)}>Annuler</Button>
            <Button onClick={() => setEditingProject(null)}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
