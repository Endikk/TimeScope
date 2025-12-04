import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  timeEntriesService,
  CreateTimeEntryDto,
  UpdateTimeEntryDto
} from '../api/services';

// Interface pour les options de filtrage
interface UseTimeEntriesOptions {
  startDate?: string;
  endDate?: string;
}

export function useTimeEntries(options?: UseTimeEntriesOptions) {
  const { data: timeEntries = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['timeEntries', options?.startDate, options?.endDate],
    queryFn: () => {
      if (options?.startDate && options?.endDate) {
        return timeEntriesService.getTimeEntriesByDateRange(options.startDate, options.endDate);
      }
      return timeEntriesService.getAllTimeEntries();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    timeEntries,
    loading,
    error: error ? (error as Error).message : null,
    refetch
  };
}

export function useTimeEntry(id: string) {
  const { data: timeEntry = null, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['timeEntry', id],
    queryFn: () => timeEntriesService.getTimeEntryById(id),
    enabled: !!id,
  });

  return {
    timeEntry,
    loading,
    error: error ? (error as Error).message : null,
    refetch
  };
}

export function useTimeEntryMutations() {
  const queryClient = useQueryClient();

  const createTimeEntryMutation = useMutation({
    mutationFn: (entryData: CreateTimeEntryDto) => timeEntriesService.createTimeEntry(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimeEntryDto }) => timeEntriesService.updateTimeEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: (id: string) => timeEntriesService.deleteTimeEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });

  return {
    createTimeEntry: createTimeEntryMutation.mutateAsync,
    updateTimeEntry: (id: string, data: UpdateTimeEntryDto) => updateTimeEntryMutation.mutateAsync({ id, data }),
    deleteTimeEntry: deleteTimeEntryMutation.mutateAsync,
    loading: createTimeEntryMutation.isPending || updateTimeEntryMutation.isPending || deleteTimeEntryMutation.isPending,
    error: createTimeEntryMutation.error || updateTimeEntryMutation.error || deleteTimeEntryMutation.error,
  };
}

// Hook pour filtrer les entrées par date (Legacy wrapper)
export function useTimeEntriesByDate(date?: string) {
  // Note: This is less efficient than using the date range directly in useTimeEntries
  // but kept for backward compatibility if needed elsewhere.
  const { timeEntries, loading, error, refetch } = useTimeEntries();

  const filteredEntries = date
    ? timeEntries.filter(entry => entry.date.startsWith(date))
    : timeEntries;

  return {
    timeEntries: filteredEntries,
    loading,
    error,
    refetch
  };
}

// Hook pour obtenir les statistiques
export function useTimeEntryStats() {
  const { timeEntries, loading, error } = useTimeEntries();

  const stats = {
    totalEntries: timeEntries.length,
    totalHours: timeEntries.reduce((sum, entry) => {
      const [hours, minutes] = entry.duration.split(':').map(Number);
      return sum + hours + (minutes / 60);
    }, 0),
    entriesByDate: timeEntries.reduce((acc, entry) => {
      const date = entry.date.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    stats,
    loading,
    error
  };
}
