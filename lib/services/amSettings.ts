/**
 * Account Manager Settings Service
 * Handles AM-specific settings, profile management, and activity logs
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { transformAdminProfileData } from '../api/transformers';
import type {
  AdminProfile,
  PaginatedResponse,
  PaginationParams,
  ActivityLog,
} from '../api/types';

export interface AMProfileUpdateData {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  email?: string;
}

export interface AMPasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AMSecuritySettings {
  smsAuthentication: boolean;
  emailAuthentication: boolean;
  twoFactorEnabled: boolean;
}

export interface AMActivityLogParams extends PaginationParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  action?: string;
}

export interface AMSettingsService {
  getProfile(): Promise<AdminProfile>;
  updateProfile(data: AMProfileUpdateData): Promise<AdminProfile>;
  changePassword(data: AMPasswordChangeData): Promise<void>;
  getStatesAndBranches(): Promise<{ states: string[]; branches: string[] }>;
  uploadProfilePicture(file: File): Promise<string>;
}

class AMSettingsAPIService implements AMSettingsService {
  async getProfile(): Promise<AdminProfile> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AM.PROFILE);
      
      // Transform the response using the centralized transformer
      return transformAdminProfileData(response.data || response);
    } catch (error) {
      console.error('AM Profile fetch error:', error);
      throw error;
    }
  }

  async updateProfile(data: AMProfileUpdateData): Promise<AdminProfile> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.AM.PROFILE, data);
      
      // Transform the response using the centralized transformer
      return transformAdminProfileData(response.data || response);
    } catch (error) {
      console.error('AM Profile update error:', error);
      throw error;
    }
  }

  async changePassword(data: AMPasswordChangeData): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    } catch (error) {
      console.error('AM Password change error:', error);
      throw error;
    }
  }

  async getStatesAndBranches(): Promise<{ states: string[]; branches: string[] }> {
    try {
      const [statesResponse, branchesResponse] = await Promise.all([
        apiClient.get(API_ENDPOINTS.USERS.STATES),
        apiClient.get(API_ENDPOINTS.USERS.BRANCHES)
      ]);

      return {
        states: Array.isArray(statesResponse.data) ? statesResponse.data : [],
        branches: Array.isArray(branchesResponse.data) ? branchesResponse.data : []
      };
    } catch (error) {
      console.error('AM States and branches fetch error:', error);
      return {
        states: [],
        branches: []
      };
    }
  }

  async uploadProfilePicture(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await apiClient.post(API_ENDPOINTS.USERS.PROFILE_PICTURE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Extract URL from response
      const responseData = response.data || response;
      if (typeof responseData === 'string') {
        return responseData;
      }
      
      if (responseData && typeof responseData === 'object') {
        return (responseData as any)?.url || (responseData as any)?.profilePictureUrl || '';
      }
      
      return '';
    } catch (error) {
      console.error('AM Profile picture upload error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const amSettingsService = new AMSettingsAPIService();