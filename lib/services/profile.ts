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
      // Use the working admin profile endpoint
      const response = await apiClient.get<AdminProfile>(
        API_ENDPOINTS.ADMIN.PROFILE
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has profile fields)
        else if (response.id || response.email || response.firstName) {
          return response as AdminProfile;
        }
      }

      throw new Error('Failed to fetch profile - invalid response format');
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

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has profile fields)
        else if (response.id || response.email || response.firstName) {
          return response as AdminProfile;
        }
      }

      throw new Error('Failed to update profile - invalid response format');
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

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has profile fields)
        else if (response.id || response.email || response.firstName) {
          return response as AdminProfile;
        }
      }

      throw new Error('Failed to upload profile picture - invalid response format');
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

      // Backend may return direct success format or wrapped format
      if (response && typeof response === 'object') {
        // Check if it's wrapped format with success field
        if (response.success === false) {
          throw new Error(response.message || 'Failed to change password');
        }
        // If response exists and no explicit failure, consider it successful
        return;
      }

      // If response is truthy (not null/undefined), consider it successful
      if (response) {
        return;
      }

      throw new Error('Failed to change password - no response');
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const profileService = new ProfileManagementService();