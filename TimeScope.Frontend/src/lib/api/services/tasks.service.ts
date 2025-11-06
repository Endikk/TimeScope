import apiClient from '../client';
import { Task } from '@/lib/types';

export interface CreateTaskDto {
  name: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  status: 'EnAttente' | 'EnCours' | 'Termine';
  precision: 'Low' | 'Medium' | 'High';
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  estimatedTime: string; // Format: "HH:mm:ss"
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  id: string;
}

class TasksService {
  private readonly endpoint = '/tasks';

  /**
   * Récupérer toutes les tâches
   */
  async getAllTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(this.endpoint);
    return response.data;
  }

  /**
   * Récupérer une tâche par ID
   */
  async getTaskById(id: string): Promise<Task> {
    const response = await apiClient.get<Task>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Créer une nouvelle tâche
   */
  async createTask(task: CreateTaskDto): Promise<Task> {
    const response = await apiClient.post<Task>(this.endpoint, task);
    return response.data;
  }

  /**
   * Mettre à jour une tâche
   */
  async updateTask(id: string, task: UpdateTaskDto): Promise<void> {
    await apiClient.put(`${this.endpoint}/${id}`, { ...task, id });
  }

  /**
   * Supprimer une tâche (soft delete)
   */
  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Récupérer les tâches par utilisateur
   */
  async getTasksByUser(userId: string): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`${this.endpoint}/user/${userId}`);
    return response.data;
  }

  /**
   * Récupérer les tâches par statut
   */
  async getTasksByStatus(status: 'EnAttente' | 'EnCours' | 'Termine'): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`${this.endpoint}/status/${status}`);
    return response.data;
  }

  /**
   * Récupérer les tâches par projet
   */
  async getTasksByProject(projectId: string): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`${this.endpoint}/project/${projectId}`);
    return response.data;
  }
}

export const tasksService = new TasksService();
