import { useState, useEffect } from 'react';
import { tasksService, CreateTaskDto, UpdateTaskDto } from '@/lib/api/services';
import { Task } from '@/lib/types';

/**
 * Hook pour récupérer toutes les tâches
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksService.getAllTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, loading, error, refetch: fetchTasks };
}

/**
 * Hook pour récupérer une tâche par ID
 */
export function useTask(id: string | null) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await tasksService.getTaskById(id);
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la tâche');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  return { task, loading, error, refetch: fetchTask };
}

/**
 * Hook pour les mutations de tâches (create, update, delete)
 */
export function useTaskMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (taskData: CreateTaskDto) => {
    try {
      setLoading(true);
      setError(null);
      const newTask = await tasksService.createTask(taskData);
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la tâche';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, taskData: UpdateTaskDto) => {
    try {
      setLoading(true);
      setError(null);
      await tasksService.updateTask(id, taskData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la tâche';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await tasksService.deleteTask(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la tâche';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    loading,
    error,
  };
}

/**
 * Hook pour récupérer les tâches par utilisateur
 */
export function useTasksByUser(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await tasksService.getTasksByUser(userId);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  return { tasks, loading, error, refetch: fetchTasks };
}
