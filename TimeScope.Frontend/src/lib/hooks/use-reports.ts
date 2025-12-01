import { useState, useEffect, useCallback } from 'react';
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

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getAuditLogs(params);
      setLogs(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch audit logs';
      setError(errorMessage);
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getStatistics(params);
      setStatistics(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch statistics';
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

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

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getActivitySummary(days);
      setActivities(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch activity summary';
      setError(errorMessage);
      console.error('Error fetching activity summary:', err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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

  const fetchTopUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getTopUsers(params);
      setTopUsers(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch top users';
      setError(errorMessage);
      console.error('Error fetching top users:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTopUsers();
  }, [fetchTopUsers]);

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create audit log';
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
