import { useState, useEffect } from 'react';
import {
  timeEntriesService,
  TimeEntry,
  CreateTimeEntryDto,
  UpdateTimeEntryDto
} from '../api/services';

export function useTimeEntries() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await timeEntriesService.getAllTimeEntries();
      setTimeEntries(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch time entries');
      console.error('Error fetching time entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  return {
    timeEntries,
    loading,
    error,
    refetch: fetchTimeEntries
  };
}

export function useTimeEntry(id: string) {
  const [timeEntry, setTimeEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeEntry = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await timeEntriesService.getTimeEntryById(id);
      setTimeEntry(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch time entry');
      console.error('Error fetching time entry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTimeEntry();
    }
  }, [id]);

  return {
    timeEntry,
    loading,
    error,
    refetch: fetchTimeEntry
  };
}

export function useTimeEntryMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTimeEntry = async (entryData: CreateTimeEntryDto): Promise<TimeEntry | null> => {
    try {
      setLoading(true);
      setError(null);
      const newEntry = await timeEntriesService.createTimeEntry(entryData);
      return newEntry;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create time entry';
      setError(errorMessage);
      console.error('Error creating time entry:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTimeEntry = async (id: string, entryData: UpdateTimeEntryDto): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await timeEntriesService.updateTimeEntry(id, entryData);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update time entry';
      setError(errorMessage);
      console.error('Error updating time entry:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeEntry = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await timeEntriesService.deleteTimeEntry(id);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete time entry';
      setError(errorMessage);
      console.error('Error deleting time entry:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    loading,
    error
  };
}

// Hook pour filtrer les entrées par date
export function useTimeEntriesByDate(date?: string) {
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
