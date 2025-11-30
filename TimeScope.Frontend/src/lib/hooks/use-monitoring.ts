import { useState, useEffect, useCallback } from 'react';
import { env } from '@/lib/config/env';
import { STORAGE_KEYS } from '@/lib/constants';
import monitoringService, {
  SystemMetrics,
  SystemInfo,
  HealthStatus,
  LogsResponse,
  GarbageCollectionResult,
  DockerMetrics,
  StreamData
} from '@/lib/api/services/monitoring.service';

/**
 * Hook pour gérer le streaming des métriques via SSE
 */
export function useMonitoringStream(enabled: boolean = true) {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [dockerMetrics, setDockerMetrics] = useState<DockerMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const abortController = new AbortController();
    let retryTimeout: NodeJS.Timeout;

    const connect = async () => {
      if (abortController.signal.aborted) return;

      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const response = await fetch(`${env.VITE_API_URL}/monitoring/stream`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream'
          },
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No reader available');

        setIsConnected(true);
        setError(null);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.substring(6);
                const data: StreamData = JSON.parse(jsonStr);
                setSystemMetrics(data.system);
                setDockerMetrics(data.docker);
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('SSE Error:', err);
        setError(err instanceof Error ? err.message : 'Connection failed');
        setIsConnected(false);

        // Retry connection after 5s
        if (!abortController.signal.aborted) {
          retryTimeout = setTimeout(() => {
            connect();
          }, 5000);
        }
      }
    };

    // Debounce connection to avoid double requests in Strict Mode
    const connectionTimeout = setTimeout(() => {
      connect();
    }, 100);

    return () => {
      clearTimeout(connectionTimeout);
      clearTimeout(retryTimeout);
      abortController.abort();
      setIsConnected(false);
    };
  }, [enabled]);

  return { systemMetrics, dockerMetrics, isConnected, error };
}

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system metrics';
      setError(errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system info';
      setError(errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch health status';
      setError(errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch logs';
      setError(errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to force garbage collection';
      setError(errorMessage);
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
export function useMonitoring(autoRefresh: boolean = true, useStream: boolean = true) {
  // Use stream for real-time metrics if enabled
  const stream = useMonitoringStream(useStream);

  // Use polling for static info and less frequent updates
  const info = useSystemInfo();
  const health = useHealthStatus(autoRefresh && !useStream, 10000); // Disable polling if streaming (or keep it for health checks?)
  const logs = useLogs(100);
  const gc = useGarbageCollection();

  // Fallback to polling for metrics if stream is disabled
  const polledMetrics = useSystemMetrics(autoRefresh && !useStream, 5000);

  const metrics = useStream ? {
    metrics: stream.systemMetrics,
    loading: !stream.isConnected && !stream.error && !stream.systemMetrics,
    error: stream.error,
    refetch: () => { } // Stream handles updates
  } : polledMetrics;

  const refetchAll = useCallback(() => {
    if (!useStream) polledMetrics.refetch();
    info.refetch();
    health.refetch();
    logs.refetch();
  }, [useStream, polledMetrics, info, health, logs]);

  return {
    metrics,
    docker: stream.dockerMetrics,
    info,
    health,
    logs,
    gc,
    refetchAll,
    isStreaming: stream.isConnected
  };
}
