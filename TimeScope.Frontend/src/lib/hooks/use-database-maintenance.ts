import { useState, useEffect } from 'react';
import {
  databaseMaintenanceService,
  type DatabaseStats,
  type DatabaseHealth,
  type OptimizationResult
} from '@/lib/api/services/database-maintenance.service';

/**
 * Hook pour récupérer les statistiques des bases de données
 */
export function useDatabaseStats() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await databaseMaintenanceService.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Hook pour vérifier la santé des bases de données
 */
export function useDatabaseHealth() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await databaseMaintenanceService.getHealth();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification de la santé');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return { health, loading, error, refetch: fetchHealth };
}

/**
 * Hook pour les opérations de maintenance
 */
export function useDatabaseMaintenance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = async (): Promise<OptimizationResult> => {
    try {
      setLoading(true);
      setError(null);
      const result = await databaseMaintenanceService.optimize();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'optimisation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    optimize,
    loading,
    error,
  };
}
