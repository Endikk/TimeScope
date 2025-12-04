import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService, CreateTaskDto, UpdateTaskDto } from '@/lib/api/services';

/**
 * Hook pour récupérer toutes les tâches
 */
export function useTasks() {
  const { data: tasks = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksService.getAllTasks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { tasks, loading, error: error ? (error as Error).message : null, refetch };
}

/**
 * Hook pour récupérer une tâche par ID
 */
export function useTask(id: string | null) {
  const { data: task = null, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksService.getTaskById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return { task, loading, error: error ? (error as Error).message : null, refetch };
}

/**
 * Hook pour les mutations de tâches (create, update, delete)
 */
export function useTaskMutations() {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (taskData: CreateTaskDto) => tasksService.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) => tasksService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    createTask: createTaskMutation.mutateAsync,
    updateTask: (id: string, data: UpdateTaskDto) => updateTaskMutation.mutateAsync({ id, data }),
    deleteTask: deleteTaskMutation.mutateAsync,
    loading: createTaskMutation.isPending || updateTaskMutation.isPending || deleteTaskMutation.isPending,
    error: createTaskMutation.error || updateTaskMutation.error || deleteTaskMutation.error,
  };
}

/**
 * Hook pour récupérer les tâches par utilisateur
 */
export function useTasksByUser(userId: string | null) {
  const { data: tasks = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['tasks', 'user', userId],
    queryFn: () => tasksService.getTasksByUser(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return { tasks, loading, error: error ? (error as Error).message : null, refetch };
}
