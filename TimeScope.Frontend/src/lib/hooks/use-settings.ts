import { useState, useEffect, useCallback } from 'react';
import {
  settingsService,
  AppSetting,
  CreateSettingDto,
  UpdateSettingDto
} from '../api/services';

export function useSettings(params?: {
  category?: string;
  isPublic?: boolean;
}) {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getAllSettings(params);
      setSettings(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch settings';
      setError(errorMessage);
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings
  };
}

export function useSetting(key: string) {
  const [setting, setSetting] = useState<AppSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSetting = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getSettingByKey(key);
      setSetting(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch setting';
      setError(errorMessage);
      console.error('Error fetching setting:', err);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (key) {
      fetchSetting();
    }
  }, [key, fetchSetting]);

  return {
    setting,
    loading,
    error,
    refetch: fetchSetting
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getCategories();
      setCategories(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}

export function useSettingMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSetting = async (settingData: CreateSettingDto) => {
    try {
      setLoading(true);
      setError(null);
      const newSetting = await settingsService.createSetting(settingData);
      return newSetting;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create setting';
      setError(errorMessage);
      console.error('Error creating setting:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, settingData: UpdateSettingDto) => {
    try {
      setLoading(true);
      setError(null);
      await settingsService.updateSetting(key, settingData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update setting';
      setError(errorMessage);
      console.error('Error updating setting:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteSetting = async (key: string) => {
    try {
      setLoading(true);
      setError(null);
      await settingsService.deleteSetting(key);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete setting';
      setError(errorMessage);
      console.error('Error deleting setting:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await settingsService.resetToDefaults();
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to reset settings';
      setError(errorMessage);
      console.error('Error resetting settings:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createSetting,
    updateSetting,
    deleteSetting,
    resetToDefaults,
    loading,
    error
  };
}
