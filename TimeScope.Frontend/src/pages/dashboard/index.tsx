import { useState } from 'react';
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
  const [stats] = useState<DashboardStats>({
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
    { name: 'TimeScope', hours: 45, color: '#6366F1' },
    { name: 'Client Portal', hours: 32, color: '#8B7CF6' },
    { name: 'Mobile App', hours: 28, color: '#A78BFA' },
    { name: 'API Backend', hours: 22, color: '#C4B5FD' },
    { name: 'Autres', hours: 15, color: '#DDD6FE' }
  ];

  const taskCompletionData = [
    { status: 'Terminé', value: 24, color: '#6366F1' },
    { status: 'En cours', value: 12, color: '#8B7CF6' },
    { status: 'En attente', value: 8, color: '#C4B5FD' }
  ];

  const StatCard = ({ title, value, icon: Icon, description, trend, color = "blue" }: {
    title: string;
    value: string | number;
    icon: any;
    description: string;
    trend?: string;
    color?: "blue" | "green" | "purple" | "orange" | "pink" | "cyan";
  }) => {
    const colorClasses = {
      blue: {
        bg: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
        icon: "text-blue-600",
        text: "text-blue-900",
        trend: "text-blue-600"
      },
      green: {
        bg: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
        icon: "text-green-600",
        text: "text-green-900",
        trend: "text-green-600"
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200",
        icon: "text-purple-600",
        text: "text-purple-900",
        trend: "text-purple-600"
      },
      orange: {
        bg: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200",
        icon: "text-orange-600",
        text: "text-orange-900",
        trend: "text-orange-600"
      },
      pink: {
        bg: "bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200",
        icon: "text-pink-600",
        text: "text-pink-900",
        trend: "text-pink-600"
      },
      cyan: {
        bg: "bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-200",
        icon: "text-cyan-600",
        text: "text-cyan-900",
        trend: "text-cyan-600"
      }
    };

    const colors = colorClasses[color];

    return (
      <Card className={`${colors.bg} border shadow-sm hover:shadow-md transition-shadow`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-body text-gray-700">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold font-heading ${colors.text}`}>{value}</div>
          <p className="text-xs text-gray-600 font-body">{description}</p>
          {trend && (
            <p className={`text-xs ${colors.trend} mt-1 font-body font-medium`}>
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-fp-bg min-h-screen">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight text-fp-text">Dashboard</h1>
        <p className="text-fp-text/70 font-body">
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
          color="blue"
        />
        <StatCard
          title="Heures cette semaine"
          value={stats.totalHoursWeek + 'h'}
          icon={Calendar}
          description="Sur 40h prévues"
          trend="81% complété"
          color="cyan"
        />
        <StatCard
          title="Heures ce mois"
          value={stats.totalHoursMonth + 'h'}
          icon={Activity}
          description="Sur 160h prévues"
          trend="89% complété"
          color="purple"
        />
        <StatCard
          title="Projets actifs"
          value={stats.activeProjects}
          icon={FolderKanban}
          description="En cours"
          color="orange"
        />
        <StatCard
          title="Tâches terminées"
          value={stats.completedTasks}
          icon={TrendingUp}
          description="Ce mois-ci"
          trend="+8 cette semaine"
          color="green"
        />
        <StatCard
          title="Membres d'équipe"
          value={stats.teamMembers}
          icon={Users}
          description="Actifs"
          color="pink"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Hours Chart */}
        <Card className="bg-white border-fp-text/10">
          <CardHeader>
            <CardTitle className="font-heading text-fp-text">Heures par jour - Cette semaine</CardTitle>
            <CardDescription className="font-body text-fp-text/70">Répartition de votre temps hebdomadaire</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="var(--fp-accent)" name="Heures" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend Chart */}
        <Card className="bg-white border-fp-text/10">
          <CardHeader>
            <CardTitle className="font-heading text-fp-text">Tendance mensuelle</CardTitle>
            <CardDescription className="font-body text-fp-text/70">Évolution du temps de travail par semaine</CardDescription>
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
                  stroke="var(--fp-accent)"
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
        <Card className="bg-white border-fp-text/10">
          <CardHeader>
            <CardTitle className="font-heading text-fp-text">Répartition par projet</CardTitle>
            <CardDescription className="font-body text-fp-text/70">Distribution des heures ce mois-ci</CardDescription>
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
        <Card className="bg-white border-fp-text/10">
          <CardHeader>
            <CardTitle className="font-heading text-fp-text">Statut des tâches</CardTitle>
            <CardDescription className="font-body text-fp-text/70">Répartition de vos tâches par statut</CardDescription>
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
      <Card className="bg-white border-fp-text/10">
        <CardHeader>
          <CardTitle className="font-heading text-fp-text">Activité récente</CardTitle>
          <CardDescription className="font-body text-fp-text/70">Vos dernières actions</CardDescription>
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
              <div key={index} className="flex items-start space-x-4 pb-4 border-b border-fp-text/10 last:border-0">
                <div className="bg-fp-accent/10 p-2 rounded-full">
                  <Activity className="h-4 w-4 text-fp-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium font-body text-fp-text">{activity.action}</p>
                  <p className="text-xs text-fp-text/60 font-body">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
