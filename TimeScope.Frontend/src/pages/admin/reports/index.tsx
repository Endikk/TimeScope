import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Users, FolderKanban, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('hours');
  const [dateRange, setDateRange] = useState('month');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');

  // Sample data for reports
  const userHoursData = [
    { user: 'Alice Martin', hours: 152, projects: 4 },
    { user: 'Bob Dupont', hours: 145, projects: 3 },
    { user: 'Claire Rousseau', hours: 138, projects: 3 },
    { user: 'David Chen', hours: 127, projects: 2 },
    { user: 'Eve Lambert', hours: 119, projects: 2 }
  ];

  const projectHoursData = [
    { project: 'TimeScope', hours: 142, budget: 500, percentage: 28 },
    { project: 'Client Portal', hours: 89, budget: 300, percentage: 30 },
    { project: 'Mobile App', hours: 45, budget: 400, percentage: 11 },
    { project: 'API Backend', hours: 198, budget: 250, percentage: 79 },
    { project: 'Legacy Migration', hours: 756, budget: 800, percentage: 95 }
  ];

  const monthlyTrendData = [
    { month: 'Jan', hours: 628, projects: 8 },
    { month: 'Fév', hours: 645, projects: 9 },
    { month: 'Mar', hours: 592, projects: 8 },
    { month: 'Avr', hours: 678, projects: 10 },
    { month: 'Mai', hours: 712, projects: 12 },
    { month: 'Juin', hours: 695, projects: 11 }
  ];

  const tasksByStatusData = [
    { status: 'Terminé', value: 124, color: '#10b981' },
    { status: 'En cours', value: 45, color: '#3b82f6' },
    { status: 'En attente', value: 28, color: '#f59e0b' }
  ];

  const activityByDayData = [
    { day: 'Lun', hours: 38 },
    { day: 'Mar', hours: 42 },
    { day: 'Mer', hours: 35 },
    { day: 'Jeu', hours: 40 },
    { day: 'Ven', hours: 36 },
    { day: 'Sam', hours: 8 },
    { day: 'Dim', hours: 5 }
  ];

  const projectDistributionData = [
    { name: 'TimeScope', value: 28, color: '#3b82f6' },
    { name: 'Client Portal', value: 18, color: '#8b5cf6' },
    { name: 'Mobile App', value: 12, color: '#ec4899' },
    { name: 'API Backend', value: 25, color: '#10b981' },
    { name: 'Autres', value: 17, color: '#f59e0b' }
  ];

  const handleExport = (format: string) => {
    console.log(`Exporting report as ${format}`);
    // Implementation for export functionality
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports et analyses</h1>
          <p className="text-muted-foreground">
            Visualisez et exportez vos rapports d'activité
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Personnalisez votre rapport</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Type de rapport</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Heures par utilisateur</SelectItem>
                  <SelectItem value="projects">Heures par projet</SelectItem>
                  <SelectItem value="tasks">Tâches complétées</SelectItem>
                  <SelectItem value="trends">Tendances</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Utilisateur</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  <SelectItem value="alice">Alice Martin</SelectItem>
                  <SelectItem value="bob">Bob Dupont</SelectItem>
                  <SelectItem value="claire">Claire Rousseau</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Projet</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les projets</SelectItem>
                  <SelectItem value="timescope">TimeScope</SelectItem>
                  <SelectItem value="portal">Client Portal</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateRange === 'custom' && (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input type="date" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total heures</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">681h</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-600" />
              +12% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              2 terminés ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              100% d'activité
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget utilisé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <p className="text-xs text-muted-foreground">
              1050h / 2500h budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="hours" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hours">Heures</TabsTrigger>
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="distribution">Répartition</TabsTrigger>
        </TabsList>

        {/* Hours Report */}
        <TabsContent value="hours" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Heures par utilisateur</CardTitle>
                <CardDescription>Ce mois-ci</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="user" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#3b82f6" name="Heures" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité hebdomadaire</CardTitle>
                <CardDescription>Répartition par jour</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityByDayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#8b5cf6" name="Heures" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Détail par utilisateur</CardTitle>
              <CardDescription>Statistiques détaillées</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Heures totales</TableHead>
                    <TableHead>Projets</TableHead>
                    <TableHead>Moyenne/jour</TableHead>
                    <TableHead>État</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userHoursData.map((user) => (
                    <TableRow key={user.user}>
                      <TableCell className="font-medium">{user.user}</TableCell>
                      <TableCell>{user.hours}h</TableCell>
                      <TableCell>{user.projects}</TableCell>
                      <TableCell>{(user.hours / 20).toFixed(1)}h</TableCell>
                      <TableCell>
                        {user.hours >= 140 ? (
                          <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                        ) : user.hours >= 120 ? (
                          <Badge className="bg-blue-100 text-blue-800">Bon</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">À surveiller</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Report */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suivi des budgets projet</CardTitle>
              <CardDescription>Utilisation du budget alloué</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projet</TableHead>
                    <TableHead>Heures utilisées</TableHead>
                    <TableHead>Budget total</TableHead>
                    <TableHead>Restant</TableHead>
                    <TableHead>Pourcentage</TableHead>
                    <TableHead>État</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectHoursData.map((project) => (
                    <TableRow key={project.project}>
                      <TableCell className="font-medium">{project.project}</TableCell>
                      <TableCell>{project.hours}h</TableCell>
                      <TableCell>{project.budget}h</TableCell>
                      <TableCell>{project.budget - project.hours}h</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                project.percentage >= 90 ? 'bg-red-500' :
                                project.percentage >= 75 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(project.percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[45px]">
                            {project.percentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.percentage < 75 ? (
                          <Badge className="bg-green-100 text-green-800">Dans les temps</Badge>
                        ) : project.percentage < 90 ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Dépassement</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Report */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Évolution mensuelle</CardTitle>
                <CardDescription>Heures enregistrées par mois</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Heures"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nombre de projets actifs</CardTitle>
                <CardDescription>Évolution dans le temps</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="projects"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Projets"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Report */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par projet</CardTitle>
                <CardDescription>Distribution des heures</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statut des tâches</CardTitle>
                <CardDescription>Répartition par statut</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tasksByStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, value }) => `${status}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tasksByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
