import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Download, Trash2, Loader2, FileSpreadsheet } from 'lucide-react';
import { useTimeEntries, useTimeEntryMutations } from '@/lib/hooks/use-timeentries';
import { useGroups, useProjects } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useUsers } from '@/lib/hooks/use-users';
import { StatsCards, TimesheetFilters, TimesheetTable } from './components';

interface TimeEntryRow {
  id: string;
  date: string;
  user: string;
  group: string;
  project: string;
  task: string;
  duration: string;
  hours: number;
  notes: string;
  selected: boolean;
}

export default function TimesheetPage() {
  const [timeEntryRows, setTimeEntryRows] = useState<TimeEntryRow[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // API Hooks
  const { timeEntries, loading: entriesLoading, refetch: refetchEntries } = useTimeEntries();
  const { groups, loading: groupsLoading } = useGroups();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { users, loading: usersLoading } = useUsers();
  const { deleteTimeEntry } = useTimeEntryMutations();

  // Helper function
  const convertDurationToHours = (duration: string): number => {
    const [hours, minutes] = duration.split(':').map(Number);
    return hours + (minutes / 60);
  };

  // Transform API data
  useEffect(() => {
    if (timeEntries && groups && projects && tasks && users) {
      const transformed = timeEntries.map(entry => {
        const task = tasks.find(t => t.id === entry.taskId);
        const project = projects.find(p => p.id === task?.projectId);
        const group = groups.find(g => g.id === project?.groupId);
        const user = users.find(u => u.id === entry.userId);

        return {
          id: entry.id,
          date: entry.date.split('T')[0],
          user: user ? `${user.firstName} ${user.lastName}` : 'N/A',
          group: group?.name || 'N/A',
          project: project?.name || 'N/A',
          task: task?.name || 'N/A',
          duration: entry.duration,
          hours: convertDurationToHours(entry.duration),
          notes: entry.notes || '',
          selected: false
        };
      });
      setTimeEntryRows(transformed);
    }
  }, [timeEntries, groups, projects, tasks, users]);

  // Filter and sort entries
  const filteredAndSortedEntries = timeEntryRows
    .filter(entry => {
      const matchesUser = filterUser === 'all' || entry.user === filterUser;
      const matchesGroup = filterGroup === 'all' || entry.group === filterGroup;
      const matchesDateFrom = !filterDateFrom || entry.date >= filterDateFrom;
      const matchesDateTo = !filterDateTo || entry.date <= filterDateTo;
      const matchesSearch = !searchQuery ||
        entry.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.project.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesUser && matchesGroup && matchesDateFrom && matchesDateTo && matchesSearch;
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof TimeEntryRow];
      const bValue = b[sortField as keyof TimeEntryRow];
      const direction = sortDirection === 'asc' ? 1 : -1;
      return aValue > bValue ? direction : -direction;
    });

  // Statistics
  const stats = {
    totalEntries: filteredAndSortedEntries.length,
    totalHours: filteredAndSortedEntries.reduce((sum, entry) => sum + entry.hours, 0),
    selectedCount: selectedEntries.length,
    selectedHours: filteredAndSortedEntries
      .filter(entry => selectedEntries.includes(entry.id))
      .reduce((sum, entry) => sum + entry.hours, 0)
  };

  // Handlers
  const toggleEntrySelection = (id: string) => {
    setSelectedEntries(prev =>
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedEntries.length === filteredAndSortedEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredAndSortedEntries.map(e => e.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) {
      return;
    }
    {
      for (const id of selectedEntries) {
        await deleteTimeEntry(id);
      }
      await refetchEntries();
      setSelectedEntries([]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Utilisateur', 'Groupe', 'Projet', 'Tâche', 'Durée', 'Heures', 'Notes'];
    const rows = filteredAndSortedEntries.map(entry => [
      entry.date,
      entry.user,
      entry.group,
      entry.project,
      entry.task,
      entry.duration,
      entry.hours.toFixed(2),
      entry.notes
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `timesheet_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterUser('all');
    setFilterGroup('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const uniqueUsers = Array.from(new Set(timeEntryRows.map(e => e.user)));
  const uniqueGroups = Array.from(new Set(timeEntryRows.map(e => e.group)));

  const isLoading = entriesLoading || groupsLoading || projectsLoading || tasksLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-gray-600">Chargement des feuilles de temps...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-2 md:p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 p-3 md:p-6">

          <PageHeader
            icon={FileSpreadsheet}
            title="Feuilles de Temps"
            description="Gérez et exportez vos feuilles de temps"
            gradient="from-blue-50 to-cyan-50"
            actions={
              <>
                <Button variant="outline" onClick={handleExportCSV} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Exporter CSV</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
                {selectedEntries.length > 0 && (
                  <Button className="bg-focustime-alert hover:opacity-90 w-full sm:w-auto" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Supprimer ({selectedEntries.length})</span>
                    <span className="sm:hidden">({selectedEntries.length})</span>
                  </Button>
                )}
              </>
            }
          />

          <StatsCards
            totalEntries={stats.totalEntries}
            totalHours={stats.totalHours}
            selectedCount={stats.selectedCount}
            selectedHours={stats.selectedHours}
          />

          <TimesheetFilters
            searchQuery={searchQuery}
            filterUser={filterUser}
            filterGroup={filterGroup}
            filterDateFrom={filterDateFrom}
            filterDateTo={filterDateTo}
            uniqueUsers={uniqueUsers}
            uniqueGroups={uniqueGroups}
            onSearchChange={setSearchQuery}
            onUserChange={setFilterUser}
            onGroupChange={setFilterGroup}
            onDateFromChange={setFilterDateFrom}
            onDateToChange={setFilterDateTo}
            onReset={handleResetFilters}
          />

          <TimesheetTable
            entries={filteredAndSortedEntries}
            selectedEntries={selectedEntries}
            totalHours={stats.totalHours}
            onToggleEntry={toggleEntrySelection}
            onToggleAll={toggleAllSelection}
            onSort={handleSort}
          />

        </div>
      </div>
    </div>
  );
}
