import apiClient from '../client';

// Interfaces
export interface DatabaseInfo {
  name: string;
  totalRecords: number;
  usersCount?: number;
  activeUsersCount?: number;
  projectsCount?: number;
  groupsCount?: number;
  themesCount?: number;
  tasksCount?: number;
  timeEntriesCount?: number;
  lastUpdated: string;
}

export interface DatabaseStats {
  adminDatabase: DatabaseInfo;
  projectsDatabase: DatabaseInfo;
  timeDatabase: DatabaseInfo;
  reportsDatabase: DatabaseInfo;
}

export interface DatabaseHealthInfo {
  databaseName: string;
  isHealthy: boolean;
  message: string;
  checkedAt: string;
}

export interface DatabaseHealth {
  overallStatus: string;
  adminDatabase: DatabaseHealthInfo;
  projectsDatabase: DatabaseHealthInfo;
  timeDatabase: DatabaseHealthInfo;
  reportsDatabase: DatabaseHealthInfo;
}

export interface OptimizationResult {
  success: boolean;
  message: string;
  startTime: string;
  endTime: string;
}

// Service
class DatabaseMaintenanceService {
  private readonly endpoint = '/databasemaintenance';

  /**
   * Récupère les statistiques de toutes les bases de données
   */
  async getStats(): Promise<DatabaseStats> {
    const response = await apiClient.get<DatabaseStats>(`${this.endpoint}/stats`);
    return response.data;
  }

  /**
   * Vérifie la santé de toutes les bases de données
   */
  async getHealth(): Promise<DatabaseHealth> {
    const response = await apiClient.get<DatabaseHealth>(`${this.endpoint}/health`);
    return response.data;
  }

  /**
   * Optimise toutes les bases de données
   */
  async optimize(): Promise<OptimizationResult> {
    const response = await apiClient.post<OptimizationResult>(`${this.endpoint}/optimize`);
    return response.data;
  }
}

export const databaseMaintenanceService = new DatabaseMaintenanceService();
