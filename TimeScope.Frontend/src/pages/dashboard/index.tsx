import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Users, FolderKanban, Calendar, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeEntries, useTimeEntryStats } from '@/lib/hooks/use-timeentries';
import { useProjects } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useUsers } from '@/lib/hooks/use-users';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeeklyData {
  day: string;
  hours: number;
}

interface ProjectData {
  name: string;
  hours: number;
  color: string;
}

export default function DashboardPageAPI() {
  const { timeEntries, loading: entriesLoading, refetch: refetchEntries } = useTimeEntries();
  const { loading: statsLoading } = useTimeEntryStats();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { users, loading: usersLoading } = useUsers();

  const convertDurationToHours = (duration: string): number => {
    const [hours, minutes] = duration.split(':').map(Number);
    return hours + (minutes / 60);
  };

  // Calculate today's hours but if weekend, take message for weekend
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayEntries = timeEntries.filter(entry => entry.date.startsWith(todayStr));
  const todayHours = todayEntries.reduce((sum, entry) => sum + convertDurationToHours(entry.duration), 0);
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  // Calculate yesterday's hours for comparison
  const yesterday = subDays(today, 1);
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
  const yesterdayEntries = timeEntries.filter(entry => entry.date.startsWith(yesterdayStr));
  const yesterdayHours = yesterdayEntries.reduce((sum, entry) => sum + convertDurationToHours(entry.duration), 0);
  const todayVsYesterdayNum = yesterdayHours > 0 ? ((todayHours - yesterdayHours) / yesterdayHours * 100) : 0;
  const todayVsYesterday = todayVsYesterdayNum.toFixed(0);

  // Calculate week hours
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });
  const weekHours = weekEntries.reduce((sum, entry) => sum + convertDurationToHours(entry.duration), 0);

  // Calculate month hours
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= monthStart && entryDate <= monthEnd;
  });
  const monthHours = monthEntries.reduce((sum, entry) => sum + convertDurationToHours(entry.duration), 0);

  // Completed tasks this month - using dueDate instead of endDate
  const completedTasksThisMonth = tasks.filter(task => {
    if (task.status !== 'Termine' || !task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate >= monthStart && taskDate <= monthEnd;
  }).length;

  // Weekly data for chart
  const weeklyData: WeeklyData[] = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayEntries = timeEntries.filter(entry => entry.date.startsWith(dayStr));
    const dayHours = dayEntries.reduce((sum, entry) => sum + convertDurationToHours(entry.duration), 0);
    return {
      day: format(day, 'EEE', { locale: fr }),
      hours: parseFloat(dayHours.toFixed(2))
    };
  });

  // Weekly data for last 4 weeks
  const getLast4Weeks = () => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekDate = subDays(today, i * 7);
      const wStart = startOfWeek(weekDate, { weekStartsOn: 1 });
      const wEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
      const wEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= wStart && entryDate <= wEnd;
      });
      const wHours = wEntries.reduce((sum, entry) => sum + convertDurationToHours(entry.duration), 0);
      weeks.push({
        week: i === 0 ? 'Cette sem.' : `Sem. -${i}`,
        hours: parseFloat(wHours.toFixed(2))
      });
    }
    return weeks;
  };

  const monthlyData = getLast4Weeks();

  // Project distribution data - with project names
  const projectHoursMap = new Map<string, number>();
  monthEntries.forEach(entry => {
    const task = tasks.find(t => t.id === entry.taskId);
    if (task && task.projectId) {
      const project = projects.find(p => p.id === task.projectId);
      const projectName = project ? project.name : 'Projet inconnu';
      const current = projectHoursMap.get(projectName) || 0;
      projectHoursMap.set(projectName, current + convertDurationToHours(entry.duration));
    }
  });

  const colors = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF'];
  const projectData: ProjectData[] = Array.from(projectHoursMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, hours], index) => ({
      name,
      hours: parseFloat(hours.toFixed(2)),
      color: colors[index] || colors[colors.length - 1]
    }));

  // Task completion data - using backend enum values
  const completedTasks = tasks.filter(t => t.status === 'Termine').length;
  const inProgressTasks = tasks.filter(t => t.status === 'EnCours').length;
  const todoTasks = tasks.filter(t => t.status === 'EnAttente').length;

  const taskCompletionData = [
    { status: 'Terminé', value: completedTasks, color: '#22C55E' },
    { status: 'En cours', value: inProgressTasks, color: '#3B82F6' },
    { status: 'En attente', value: todoTasks, color: '#94A3B8' }
  ].filter(item => item.value > 0);

  // Recent activity from time entries
  const recentActivities = timeEntries
    .slice(0, 5)
    .map(entry => {
      const task = tasks.find(t => t.id === entry.taskId);
      const groupName = task ? task.projectId : null;
      const entryDate = new Date(entry.date);
      const now = new Date();
      const diffMs = now.getTime() - entryDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo = '';
      if (diffDays > 0) {
        timeAgo = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        timeAgo = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
      } else {
        timeAgo = "Aujourd'hui";
      }

      return {
        time: timeAgo,
        action: `Enregistré ${convertDurationToHours(entry.duration).toFixed(1)}h${groupName ? ` sur ${groupName}` : ''}${entry.notes ? ` - ${entry.notes}` : ''}`
      };
    });

  const handleRefreshAll = () => {
    refetchEntries();
  };

  if (entriesLoading || statsLoading || projectsLoading || tasksLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-fp-text">Dashboard</h1>
          <p className="text-fp-text/70 font-body">
            Vue d'ensemble de votre activité et de vos performances
          </p>
        </div>
        <Button onClick={handleRefreshAll} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Heures aujourd'hui"
          value={isWeekend ? "C'est le week-end !" : todayHours.toFixed(1) + 'h'}
          icon={Clock}
          description="Temps enregistré"
          trend={yesterdayHours > 0 ? `${todayVsYesterday}% par rapport à hier` : 'Aucune donnée hier'}
          color="blue"
        />
        <StatCard
          title="Heures cette semaine"
          value={weekHours.toFixed(1) + 'h'}
          icon={Calendar}
          description="Sur 35h prévues"
          trend={`${((weekHours / 35) * 100).toFixed(0)}% complété`}
          color="cyan"
        />
        <StatCard
          title="Heures ce mois"
          value={monthHours.toFixed(1) + 'h'}
          icon={Activity}
          description="Sur 140h prévues"
          trend={`${((monthHours / 140) * 100).toFixed(0)}% complété`}
          color="purple"
        />
        <StatCard
          title="Projets actifs"
          value={projects.length}
          icon={FolderKanban}
          description="En cours"
          color="orange"
        />
        <StatCard
          title="Tâches terminées"
          value={completedTasksThisMonth}
          icon={TrendingUp}
          description="Ce mois-ci"
          trend={`${completedTasks} au total`}
          color="green"
        />
        <StatCard
          title="Membres d'équipe"
          value={users.length}
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
                <Bar dataKey="hours" fill="#3B82F6" name="Heures" />
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
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Heures"
                  dot={{ fill: '#3B82F6', r: 5 }}
                  activeDot={{ r: 7 }}
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
            {projectData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Completion Status */}
        <Card className="bg-white border-fp-text/10">
          <CardHeader>
            <CardTitle className="font-heading text-fp-text">Statut des tâches</CardTitle>
            <CardDescription className="font-body text-fp-text/70">Répartition de vos tâches par statut</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {taskCompletionData.some(d => d.value > 0) ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Aucune tâche disponible
              </div>
            )}
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
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune activité récente
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
