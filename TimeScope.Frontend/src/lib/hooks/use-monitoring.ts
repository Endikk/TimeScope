import { useState, useEffect, useCallback } from 'react';
import monitoringService, {
  SystemMetrics,
  SystemInfo,
  HealthStatus,
  LogsResponse,
  GarbageCollectionResult
} from '@/lib/api/services/monitoring.service';

/**
 * Hook pour gérer les métriques système
 */
export function useSystemMetrics(autoRefresh: boolean = false, interval: number = 5000) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await monitoringService.getSystemMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system metrics');
      console.error('Error fetching system metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (autoRefresh) {
      const timer = setInterval(fetchMetrics, interval);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, interval, fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
}

/**
 * Hook pour gérer les informations système
 */
export function useSystemInfo() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await monitoringService.getSystemInfo();
      setInfo(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system info');
      console.error('Error fetching system info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return { info, loading, error, refetch: fetchInfo };
}

/**
 * Hook pour gérer l'état de santé du système
 */
export function useHealthStatus(autoRefresh: boolean = false, interval: number = 10000) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await monitoringService.getHealthStatus();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch health status');
      console.error('Error fetching health status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (autoRefresh) {
      const timer = setInterval(fetchHealth, interval);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, interval, fetchHealth]);

  return { health, loading, error, refetch: fetchHealth };
}

/**
 * Hook pour gérer les logs
 */
export function useLogs(limit: number = 100) {
  const [logs, setLogs] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await monitoringService.getLogs(limit);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
}

/**
 * Hook pour forcer le garbage collection
 */
export function useGarbageCollection() {
  const [result, setResult] = useState<GarbageCollectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forceGC = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await monitoringService.forceGarbageCollection();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to force garbage collection');
      console.error('Error forcing garbage collection:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, forceGC };
}

/**
 * Hook combiné pour le monitoring complet
 */
export function useMonitoring(autoRefresh: boolean = true) {
  const metrics = useSystemMetrics(autoRefresh, 5000);
  const info = useSystemInfo();
  const health = useHealthStatus(autoRefresh, 10000);
  const logs = useLogs(100);
  const gc = useGarbageCollection();

  const refetchAll = useCallback(() => {
    metrics.refetch();
    info.refetch();
    health.refetch();
    logs.refetch();
  }, [metrics, info, health, logs]);

  return {
    metrics,
    info,
    health,
    logs,
    gc,
    refetchAll
  };
}
