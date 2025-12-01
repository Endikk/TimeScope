import { useState, useEffect, useCallback } from 'react';
import administrationService, {
  DatabasesSummary,
  ConnectionTestResult,
  CleanupResult,
  UsageStatistics,
  ExportResult
} from '@/lib/api/services/administration.service';

/**
 * Hook pour gérer le résumé des bases de données
 */
export function useDatabasesSummary() {
  const [summary, setSummary] = useState<DatabasesSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await administrationService.getDatabasesSummary();
      setSummary(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch databases summary';
      setError(errorMessage);
      console.error('Error fetching databases summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

/**
 * Hook pour tester les connexions aux bases de données
 */
export function useDatabaseConnections() {
  const [connections, setConnections] = useState<ConnectionTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await administrationService.testDatabaseConnections();
      setConnections(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test database connections';
      setError(errorMessage);
      console.error('Error testing database connections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { connections, loading, error, testConnections };
}

/**
 * Hook pour nettoyer les données supprimées
 */
export function useCleanup() {
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanup = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await administrationService.cleanupSoftDeleted();
      setResult(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cleanup deleted data';
      setError(errorMessage);
      console.error('Error cleaning up deleted data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, cleanup };
}

/**
 * Hook pour récupérer les statistiques d'utilisation
 */
export function useUsageStatistics() {
  const [statistics, setStatistics] = useState<UsageStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await administrationService.getUsageStatistics();
      setStatistics(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch usage statistics';
      setError(errorMessage);
      console.error('Error fetching usage statistics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refetch: fetchStatistics };
}

/**
 * Hook pour exporter les données système
 */
export function useExport() {
  const [result, setResult] = useState<ExportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await administrationService.exportSystemData();
      setResult(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export system data';
      setError(errorMessage);
      console.error('Error exporting system data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, exportData };
}

/**
 * Hook combiné pour l'administration complète
 */
export function useAdministration() {
  const summary = useDatabasesSummary();
  const connections = useDatabaseConnections();
  const cleanup = useCleanup();
  const statistics = useUsageStatistics();
  const exportHook = useExport();

  const refetchAll = useCallback(() => {
    summary.refetch();
    statistics.refetch();
  }, [summary, statistics]);

  return {
    summary,
    connections,
    cleanup,
    statistics,
    export: exportHook,
    refetchAll
  };
}
