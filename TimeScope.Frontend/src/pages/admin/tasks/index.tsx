import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTasks, useTaskMutations } from '@/lib/hooks/use-tasks';
import { useProjects } from '@/lib/hooks/use-projects';
import { useUsers } from '@/lib/hooks/use-users';
import type { CreateTaskDto } from '@/lib/api/services';
import { TasksHeader } from './components/TasksHeader';
import { StatsCards } from './components/StatsCards';
import { TaskFilters } from './components/TaskFilters';
import { TasksTable } from './components/TasksTable';
import { EditTaskDialog } from './components/EditTaskDialog';

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
    await deleteTask(id);
    await refetchTasks();
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
    enCours: tasks.filter(t => t.status === 'EnCours').length,
    termine: tasks.filter(t => t.status === 'Termine').length,
    enAttente: tasks.filter(t => t.status === 'EnAttente').length,
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

          <TasksHeader
            isCreateDialogOpen={isCreateDialogOpen}
            setIsCreateDialogOpen={setIsCreateDialogOpen}
            formData={formData}
            setFormData={setFormData}
            onCreateTask={handleCreateTask}
            onResetForm={resetForm}
            projects={projects}
            users={users}
          />

          <StatsCards stats={stats} />

          <TaskFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPrecision={filterPrecision}
            setFilterPrecision={setFilterPrecision}
          />

          <TasksTable
            filteredTasks={filteredTasks}
            onEdit={openEditDialog}
            onDelete={handleDeleteTask}
            getProjectName={getProjectName}
            getUserName={getUserName}
          />

          <EditTaskDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            formData={formData}
            setFormData={setFormData}
            onSave={handleUpdateTask}
            projects={projects}
            users={users}
          />

        </div>
      </div>
    </div>
  );
}
