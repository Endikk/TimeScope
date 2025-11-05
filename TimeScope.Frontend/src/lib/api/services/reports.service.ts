import axios from '../axios.config';

// Types
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  userId: string;
  userName: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

export interface CreateAuditLogDto {
  action: string;
  entityType: string;
  entityId?: string;
  userId: string;
  userName: string;
  details?: string;
  ipAddress?: string;
}

export interface ReportStatistics {
  totalUsers: number;
  totalProjects: number;
  totalGroups: number;
  totalThemes: number;
  totalTasks: number;
  totalTimeEntries: number;
  totalAuditLogs: number;
  periodStart: string;
  periodEnd: string;
}

export interface ActivitySummary {
  entityType: string;
  action: string;
  count: number;
  lastOccurrence: string;
}

export interface UserActivity {
  userId: string;
  userName: string;
  actionCount: number;
  lastActivity: string;
}

class ReportsService {
  /**
   * Récupère les logs d'audit
   */
  async getAuditLogs(params?: {
    limit?: number;
    entityType?: string;
    userId?: string;
  }): Promise<AuditLog[]> {
    const response = await axios.get('/reports/audit-logs', { params });
    return response.data;
  }

  /**
   * Crée un nouveau log d'audit
   */
  async createAuditLog(log: CreateAuditLogDto): Promise<AuditLog> {
    const response = await axios.post('/reports/audit-logs', log);
    return response.data;
  }

  /**
   * Récupère les statistiques globales
   */
  async getStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ReportStatistics> {
    const response = await axios.get('/reports/statistics', { params });
    return response.data;
  }

  /**
   * Récupère le résumé d'activité
   */
  async getActivitySummary(days: number = 7): Promise<ActivitySummary[]> {
    const response = await axios.get('/reports/activity', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Récupère les utilisateurs les plus actifs
   */
  async getTopUsers(params?: {
    limit?: number;
    days?: number;
  }): Promise<UserActivity[]> {
    const response = await axios.get('/reports/top-users', { params });
    return response.data;
  }
}

export const reportsService = new ReportsService();
