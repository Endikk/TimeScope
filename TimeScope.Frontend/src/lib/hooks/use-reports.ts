import { useState, useEffect } from 'react';
import {
  reportsService,
  AuditLog,
  ReportStatistics,
  ActivitySummary,
  UserActivity,
  CreateAuditLogDto
} from '../api/services';

export function useAuditLogs(params?: {
  limit?: number;
  entityType?: string;
  userId?: string;
}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getAuditLogs(params);
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [params?.limit, params?.entityType, params?.userId]);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs
  };
}

export function useReportStatistics(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getStatistics(params);
      setStatistics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [params?.startDate, params?.endDate]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics
  };
}

export function useActivitySummary(days: number = 7) {
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getActivitySummary(days);
      setActivities(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch activity summary');
      console.error('Error fetching activity summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [days]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities
  };
}

export function useTopUsers(params?: {
  limit?: number;
  days?: number;
}) {
  const [topUsers, setTopUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getTopUsers(params);
      setTopUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch top users');
      console.error('Error fetching top users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopUsers();
  }, [params?.limit, params?.days]);

  return {
    topUsers,
    loading,
    error,
    refetch: fetchTopUsers
  };
}

export function useAuditLogMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLog = async (logData: CreateAuditLogDto) => {
    try {
      setLoading(true);
      setError(null);
      const newLog = await reportsService.createAuditLog(logData);
      return newLog;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create audit log';
      setError(errorMessage);
      console.error('Error creating audit log:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createLog,
    loading,
    error
  };
}
