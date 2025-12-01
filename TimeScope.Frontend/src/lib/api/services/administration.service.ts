import apiClient from '../client';

// Interfaces
export interface DatabaseSummary {
  name: string;
  tablesCount: number;
  totalRecords: number;
  collections: Record<string, number>;
}

export interface DatabasesSummary {
  adminDatabase: DatabaseSummary;
  projectsDatabase: DatabaseSummary;
  timeDatabase: DatabaseSummary;
  reportsDatabase: DatabaseSummary;
}

export interface ConnectionTest {
  databaseName: string;
  success: boolean;
  message: string;
  responseTimeMs: number;
}

export interface ConnectionTestResult {
  tests: ConnectionTest[];
  allSuccessful: boolean;
  timestamp: string;
}

export interface DatabaseCleanupResult {
  databaseName: string;
  recordsRemoved: number;
  details: string;
}

export interface CleanupResult {
  databaseResults: DatabaseCleanupResult[];
  totalRecordsRemoved: number;
  timestamp: string;
}

export interface UsageStatistics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalTasks: number;
  totalTimeEntries: number;
  recentAuditLogs: number;
  period: string;
  timestamp: string;
}

export interface ExportResult {
  success: boolean;
  message: string;
  dataSummary?: unknown;
  timestamp: string;
}

// Service
class AdministrationService {
  private readonly BASE_URL = '/administration';

  /**
   * Récupère un résumé de toutes les bases de données
   */
  async getDatabasesSummary(): Promise<DatabasesSummary> {
    const response = await apiClient.get<DatabasesSummary>(`${this.BASE_URL}/databases/summary`);
    return response.data;
  }

  /**
   * Teste les connexions aux bases de données
   */
  async testDatabaseConnections(): Promise<ConnectionTestResult> {
    const response = await apiClient.get<ConnectionTestResult>(`${this.BASE_URL}/databases/test-connections`);
    return response.data;
  }

  /**
   * Nettoie les données supprimées (soft delete)
   */
  async cleanupSoftDeleted(): Promise<CleanupResult> {
    const response = await apiClient.post<CleanupResult>(`${this.BASE_URL}/cleanup/soft-deleted`);
    return response.data;
  }

  /**
   * Récupère les statistiques d'utilisation du système
   */
  async getUsageStatistics(): Promise<UsageStatistics> {
    const response = await apiClient.get<UsageStatistics>(`${this.BASE_URL}/usage/statistics`);
    return response.data;
  }

  /**
   * Exporte les données système
   */
  async exportSystemData(): Promise<ExportResult> {
    const response = await apiClient.get<ExportResult>(`${this.BASE_URL}/export/system-data`);
    return response.data;
  }
}

export const administrationService = new AdministrationService();
export default administrationService;
