import axios from '../axios.config';

// Types
export interface AppSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string;
  dataType: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

export interface CreateSettingDto {
  key: string;
  value: string;
  category: string;
  description?: string;
  dataType?: string;
  isPublic?: boolean;
}

export interface UpdateSettingDto {
  value?: string;
  category?: string;
  description?: string;
  dataType?: string;
  isPublic?: boolean;
}

class SettingsService {
  /**
   * Récupère tous les paramètres
   */
  async getAllSettings(params?: {
    category?: string;
    isPublic?: boolean;
  }): Promise<AppSetting[]> {
    const response = await axios.get('/settings', { params });
    return response.data;
  }

  /**
   * Récupère un paramètre par sa clé
   */
  async getSettingByKey(key: string): Promise<AppSetting> {
    const response = await axios.get(`/settings/${key}`);
    return response.data;
  }

  /**
   * Récupère toutes les catégories
   */
  async getCategories(): Promise<string[]> {
    const response = await axios.get('/settings/categories');
    return response.data;
  }

  /**
   * Crée un nouveau paramètre
   */
  async createSetting(setting: CreateSettingDto): Promise<AppSetting> {
    const response = await axios.post('/settings', setting);
    return response.data;
  }

  /**
   * Met à jour un paramètre existant
   */
  async updateSetting(key: string, setting: UpdateSettingDto): Promise<void> {
    await axios.put(`/settings/${key}`, setting);
  }

  /**
   * Supprime un paramètre
   */
  async deleteSetting(key: string): Promise<void> {
    await axios.delete(`/settings/${key}`);
  }

  /**
   * Réinitialise tous les paramètres aux valeurs par défaut
   */
  async resetToDefaults(): Promise<{ message: string; count: number }> {
    const response = await axios.post('/settings/reset-defaults');
    return response.data;
  }
}

export const settingsService = new SettingsService();
