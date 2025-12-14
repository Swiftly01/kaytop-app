/**
 * Profile Management Service
 * Handles admin profile operations including viewing, editing, and profile picture upload
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import type {
  AdminProfile,
  UpdateUserData,
  ChangePasswordData,
} from '../api/types';

export interface ProfileService {
  getProfile(): Promise<AdminProfile>;
  updateProfile(data: UpdateUserData): Promise<AdminProfile>;
  uploadProfilePicture(file: File): Promise<AdminProfile>;
  changePassword(data: ChangePasswordData): Promise<void>;
}

class ProfileManagementService implements ProfileService {
  async getProfile(): Promise<AdminProfile> {
    try {
      const response = await apiClient.get<AdminProfile>(
        API_ENDPOINTS.ADMIN.PROFILE
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch profile');
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }

  async updateProfile(data: UpdateUserData): Promise<AdminProfile> {
    try {
      const response = await apiClient.patch<AdminProfile>(
        API_ENDPOINTS.USERS.ME,
        data
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update profile');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  async uploadProfilePicture(file: File): Promise<AdminProfile> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await apiClient.patch<AdminProfile>(
        API_ENDPOINTS.USERS.PROFILE_PICTURE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to upload profile picture');
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        data
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const profileService = new ProfileManagementService();