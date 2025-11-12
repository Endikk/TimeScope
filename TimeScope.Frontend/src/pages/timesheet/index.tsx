import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Filter,
  Search,
  Calendar as CalendarIcon,
  ArrowUpDown
} from 'lucide-react';
import { useTimeEntries, useTimeEntryMutations } from '@/lib/hooks/use-timeentries';
import { useGroups, useProjects } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useUsers } from '@/lib/hooks/use-users';

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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
        <div className="max-w-7xl mx-auto space-y-6 p-6">

          {/* Header */}
          <PageHeader
            icon={FileSpreadsheet}
            title="Feuilles de Temps"
            description="Gérez et exportez vos feuilles de temps"
            gradient="from-blue-50 to-cyan-50"
            actions={
              <>
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
                {selectedEntries.length > 0 && (
                  <Button className="bg-focustime-alert hover:opacity-90" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer ({selectedEntries.length})
                  </Button>
                )}
              </>
            }
          />

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entrées</CardTitle>
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEntries}</div>
                <p className="text-xs text-muted-foreground">Entrées affichées</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heures Totales</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalHours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">Temps enregistré</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sélectionnées</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.selectedCount}</div>
                <p className="text-xs text-muted-foreground">Entrées sélectionnées</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heures Sélect.</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.selectedHours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">Temps sélectionné</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres Avancés
              </CardTitle>
              <CardDescription>Filtrez vos entrées de temps par critères multiples</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label>Recherche</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tâche, notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label>Utilisateur</Label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      {uniqueUsers.map(user => (
                        <SelectItem key={user} value={user}>{user}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Groupe</Label>
                  <Select value={filterGroup} onValueChange={setFilterGroup}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les groupes</SelectItem>
                      {uniqueGroups.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date début</Label>
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Date fin</Label>
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterUser('all');
                    setFilterGroup('all');
                    setFilterDateFrom('');
                    setFilterDateTo('');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timesheet Table */}
          <Card>
            <CardHeader>
              <CardTitle>Entrées de Temps</CardTitle>
              <CardDescription>
                {filteredAndSortedEntries.length} entrée{filteredAndSortedEntries.length > 1 ? 's' : ''} • 
                {stats.totalHours.toFixed(1)}h au total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAndSortedEntries.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucune entrée trouvée</p>
                  <p className="text-sm text-muted-foreground">Ajustez vos filtres ou ajoutez de nouvelles entrées</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedEntries.length === filteredAndSortedEntries.length}
                            onCheckedChange={toggleAllSelection}
                          />
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" onClick={() => handleSort('date')}>
                            Date <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Groupe</TableHead>
                        <TableHead>Projet</TableHead>
                        <TableHead>Tâche</TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" onClick={() => handleSort('hours')}>
                            Heures <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedEntries.map((entry) => (
                        <TableRow key={entry.id} className={selectedEntries.includes(entry.id) ? 'bg-muted/50' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={selectedEntries.includes(entry.id)}
                              onCheckedChange={() => toggleEntrySelection(entry.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              {new Date(entry.date).toLocaleDateString('fr-FR')}
                            </div>
                          </TableCell>
                          <TableCell>{entry.user}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.group}</Badge>
                          </TableCell>
                          <TableCell>{entry.project}</TableCell>
                          <TableCell className="font-medium">{entry.task}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{entry.hours.toFixed(1)}h</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {entry.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
