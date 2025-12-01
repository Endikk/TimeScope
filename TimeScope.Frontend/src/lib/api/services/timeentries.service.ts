import apiClient from '../client';
import { TimeEntry } from '@/types/time-entry';

export interface CreateTimeEntryDto {
  taskId: string;
  // userId retiré - automatiquement assigné depuis l'utilisateur authentifié
  date: string;
  duration: string; // Format: "HH:mm:ss"
  notes?: string;
}

export interface UpdateTimeEntryDto extends Partial<CreateTimeEntryDto> {
  id: string;
}

class TimeEntriesService {
  private readonly endpoint = '/timeentries';

  /**
   * Récupérer toutes les entrées de temps
   */
  async getAllTimeEntries(): Promise<TimeEntry[]> {
    const response = await apiClient.get<TimeEntry[]>(this.endpoint);
    return response.data;
  }

  /**
   * Récupérer une entrée de temps par ID
   */
  async getTimeEntryById(id: string): Promise<TimeEntry> {
    const response = await apiClient.get<TimeEntry>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Créer une nouvelle entrée de temps
   */
  async createTimeEntry(timeEntry: CreateTimeEntryDto): Promise<TimeEntry> {
    const response = await apiClient.post<TimeEntry>(this.endpoint, timeEntry);
    return response.data;
  }

  /**
   * Mettre à jour une entrée de temps
   */
  async updateTimeEntry(id: string, timeEntry: UpdateTimeEntryDto): Promise<void> {
    await apiClient.put(`${this.endpoint}/${id}`, { ...timeEntry, id });
  }

  /**
   * Supprimer une entrée de temps
   */
  async deleteTimeEntry(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Récupérer les entrées de temps par utilisateur
   */
  async getTimeEntriesByUser(userId: string): Promise<TimeEntry[]> {
    const response = await apiClient.get<TimeEntry[]>(`${this.endpoint}/user/${userId}`);
    return response.data;
  }

  /**
   * Récupérer les entrées de temps par tâche
   */
  async getTimeEntriesByTask(taskId: string): Promise<TimeEntry[]> {
    const response = await apiClient.get<TimeEntry[]>(`${this.endpoint}/task/${taskId}`);
    return response.data;
  }

  /**
   * Récupérer les entrées de temps par période
   */
  async getTimeEntriesByDateRange(startDate: string, endDate: string): Promise<TimeEntry[]> {
    const response = await apiClient.get<TimeEntry[]>(
      `${this.endpoint}/range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }
}

export const timeEntriesService = new TimeEntriesService();
