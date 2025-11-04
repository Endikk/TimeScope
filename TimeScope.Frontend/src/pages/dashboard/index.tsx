import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Users, FolderKanban, Calendar, Activity } from 'lucide-react';

interface DashboardStats {
  totalHoursToday: number;
  totalHoursWeek: number;
  totalHoursMonth: number;
  activeProjects: number;
  completedTasks: number;
  teamMembers: number;
}

interface WeeklyData {
  day: string;
  hours: number;
}

interface ProjectData {
  name: string;
  hours: number;
  color: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHoursToday: 6.5,
    totalHoursWeek: 32.5,
    totalHoursMonth: 142,
    activeProjects: 8,
    completedTasks: 24,
    teamMembers: 12
  });

  const weeklyData: WeeklyData[] = [
    { day: 'Lun', hours: 7.5 },
    { day: 'Mar', hours: 8 },
    { day: 'Mer', hours: 6.5 },
    { day: 'Jeu', hours: 8 },
    { day: 'Ven', hours: 7 },
    { day: 'Sam', hours: 0 },
    { day: 'Dim', hours: 0 }
  ];

  const monthlyData = [
    { week: 'Sem 1', hours: 38 },
    { week: 'Sem 2', hours: 42 },
    { week: 'Sem 3', hours: 35 },
    { week: 'Sem 4', hours: 40 },
  ];

  const projectData: ProjectData[] = [
    { name: 'TimeScope', hours: 45, color: '#3b82f6' },
    { name: 'Client Portal', hours: 32, color: '#8b5cf6' },
    { name: 'Mobile App', hours: 28, color: '#ec4899' },
    { name: 'API Backend', hours: 22, color: '#10b981' },
    { name: 'Autres', hours: 15, color: '#f59e0b' }
  ];

  const taskCompletionData = [
    { status: 'Terminé', value: 24, color: '#10b981' },
    { status: 'En cours', value: 12, color: '#3b82f6' },
    { status: 'En attente', value: 8, color: '#f59e0b' }
  ];

  const StatCard = ({ title, value, icon: Icon, description, trend }: {
    title: string;
    value: string | number;
    icon: any;
    description: string;
    trend?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <p className="text-xs text-green-600 mt-1">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité et de vos performances
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Heures aujourd'hui"
          value={stats.totalHoursToday + 'h'}
          icon={Clock}
          description="Temps enregistré"
          trend="+12% vs hier"
        />
        <StatCard
          title="Heures cette semaine"
          value={stats.totalHoursWeek + 'h'}
          icon={Calendar}
          description="Sur 40h prévues"
          trend="81% complété"
        />
        <StatCard
          title="Heures ce mois"
          value={stats.totalHoursMonth + 'h'}
          icon={Activity}
          description="Sur 160h prévues"
          trend="89% complété"
        />
        <StatCard
          title="Projets actifs"
          value={stats.activeProjects}
          icon={FolderKanban}
          description="En cours"
        />
        <StatCard
          title="Tâches terminées"
          value={stats.completedTasks}
          icon={TrendingUp}
          description="Ce mois-ci"
          trend="+8 cette semaine"
        />
        <StatCard
          title="Membres d'équipe"
          value={stats.teamMembers}
          icon={Users}
          description="Actifs"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Heures par jour - Cette semaine</CardTitle>
            <CardDescription>Répartition de votre temps hebdomadaire</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#3b82f6" name="Heures" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendance mensuelle</CardTitle>
            <CardDescription>Évolution du temps de travail par semaine</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Heures"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Project Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par projet</CardTitle>
            <CardDescription>Distribution des heures ce mois-ci</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Completion Status */}
        <Card>
          <CardHeader>
            <CardTitle>Statut des tâches</CardTitle>
            <CardDescription>Répartition de vos tâches par statut</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskCompletionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, value }) => `${status}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Vos dernières actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: 'Il y a 5 minutes', action: 'Enregistré 2h sur TimeScope - Développement Dashboard' },
              { time: 'Il y a 1 heure', action: 'Complété la tâche "Créer les pages admin"' },
              { time: 'Il y a 2 heures', action: 'Enregistré 1.5h sur Client Portal - API Integration' },
              { time: 'Hier à 16:30', action: 'Complété la tâche "Review code PR #123"' },
              { time: 'Hier à 14:00', action: 'Enregistré 3h sur Mobile App - UI Components' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
