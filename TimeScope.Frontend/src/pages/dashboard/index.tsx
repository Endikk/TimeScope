import { Clock, TrendingUp, Users, FolderKanban, Calendar, Activity, RefreshCw } from 'lucide-react';
import { useTimeEntries, useTimeEntryStats } from '@/lib/hooks/use-timeentries';
import { useProjects } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useUsers } from '@/lib/hooks/use-users';
import { useHolidays, getEventsForDate } from '@/lib/hooks/use-holidays';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  StatCard,
  WeeklyHoursChart,
  MonthlyTrendChart,
  ProjectDistributionChart,
  TaskCompletionChart,
  RecentActivity,
  DashboardHeader
} from './components';

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
  const today = new Date();
  const { timeEntries, loading: entriesLoading, refetch: refetchEntries } = useTimeEntries();
  const { loading: statsLoading } = useTimeEntryStats();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { users, loading: usersLoading } = useUsers();
  const { holidays, loading: holidaysLoading } = useHolidays(today.getFullYear());

  const convertDurationToHours = (duration: string): number => {
    const [hours, minutes] = duration.split(':').map(Number);
    return hours + (minutes / 60);
  };

  // Calculate today's hours but if weekend or holiday, show appropriate message
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayEntries = timeEntries.filter(entry => entry.date.startsWith(todayStr));
  const todayHours = todayEntries.reduce((sum, entry) => sum + convertDurationToHours(entry.duration), 0);
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  const todayHolidays = getEventsForDate(holidays, todayStr);
  const isHoliday = todayHolidays.length > 0;

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

  if (entriesLoading || statsLoading || projectsLoading || tasksLoading || usersLoading || holidaysLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 bg-fp-bg min-h-screen">
      <DashboardHeader onRefresh={handleRefreshAll} />

      {/* Stats Overview */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Heures aujourd'hui"
          value={isHoliday ? "Férié !" : isWeekend ? "C'est le week-end !" : todayHours.toFixed(1) + 'h'}
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
          color="blue"
        />
        <StatCard
          title="Heures ce mois"
          value={monthHours.toFixed(1) + 'h'}
          icon={Activity}
          description="Sur 140h prévues"
          trend={`${((monthHours / 140) * 100).toFixed(0)}% complété`}
          color="blue"
        />
        <StatCard
          title="Projets actifs"
          value={projects.length}
          icon={FolderKanban}
          description="En cours"
          color="blue"
        />
        <StatCard
          title="Tâches terminées"
          value={completedTasksThisMonth}
          icon={TrendingUp}
          description="Ce mois-ci"
          trend={`${completedTasks} au total`}
          color="blue"
        />
        <StatCard
          title="Membres d'équipe"
          value={users.length}
          icon={Users}
          description="Actifs"
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
        <WeeklyHoursChart data={weeklyData} />
        <MonthlyTrendChart data={monthlyData} />
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
        <ProjectDistributionChart data={projectData} />
        <TaskCompletionChart data={taskCompletionData} />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={recentActivities} />
    </div>
  );
}
