import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';

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

export function useUsageStatistics() {
    const [stats, setStats] = useState<UsageStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get<UsageStatistics>('/administration/usage/statistics');
            setStats(response.data);
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
