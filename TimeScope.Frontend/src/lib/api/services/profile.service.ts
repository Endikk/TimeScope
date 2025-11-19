/**
 * Profile Service
 * Handles user profile operations including updates and password changes
 */

import apiClient from '../client';
import { User } from './auth.service';

/**
 * Update user profile request
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
  hireDate?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * User statistics response
 */
export interface UserStatsResponse {
  tasksCompleted: number;
  tasksInProgress: number;
  totalHours: number;
  projectsCount: number;
}

/**
 * Profile API Service
 */
export const profileApiService = {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User>(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Change user password
   */
  async changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
    await apiClient.post(`/users/${userId}/change-password`, data);
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStatsResponse> {
    const response = await apiClient.get<UserStatsResponse>(`/users/${userId}/stats`);
    return response.data;
  },

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<User>(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Upload user banner
   */
  async uploadBanner(userId: string, file: File): Promise<User> {
    const formData = new FormData();
    formData.append('banner', file);

    const response = await apiClient.post<User>(`/users/${userId}/banner`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string): Promise<User> {
    const response = await apiClient.delete<User>(`/users/${userId}/avatar`);
    return response.data;
  },

  /**
   * Delete user banner
   */
  async deleteBanner(userId: string): Promise<User> {
    const response = await apiClient.delete<User>(`/users/${userId}/banner`);
    return response.data;
  },
};
