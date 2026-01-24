/**
 * User Profile Service
 * Handles user profile management and authentication settings
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../api/config';
import type { AdminProfile } from '../api/types';
import { isSuccessResponse } from '../utils/responseHelpers';
import { DataTransformers } from '../api/transformers';

export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  branch?: string;
  state?: string;
  profilePicture?: string;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UserProfileService {
  getUserProfile(): Promise<UserProfileData>;
  updateUserProfile(data: UpdateProfileData): Promise<UserProfileData>;
  changePassword(data: ChangePasswordData): Promise<void>;
  updateProfilePicture(file: File): Promise<UserProfileData>;
}

class UserProfileAPIService implements UserProfileService {
  /**
   * Helper to ensure image URLs are absolute
   */
  private ensureFullUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    // Prepend base URL for relative paths
    const baseUrl = API_CONFIG.BASE_URL;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  /**
   * Helper to map AdminProfile to UserProfileData
   */
  private mapToUserProfileData(data: Record<string, unknown>): UserProfileData {
    // 1. Use DataTransformers for initial robust mapping
    const profile = DataTransformers.transformAdminProfile(data);

    // 2. Map to the specific UserProfileData interface
    return {
      id: String(profile.id),
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      mobileNumber: profile.mobileNumber,
      role: profile.role,
      branch: profile.branch,
      state: profile.state,
      verificationStatus: profile.verificationStatus,
      profilePicture: this.ensureFullUrl(profile.profilePicture),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async getUserProfile(): Promise<UserProfileData> {
    try {
      const response = await apiClient.get<AdminProfile>(
        API_ENDPOINTS.USERS.PROFILE
      );

      // Handle both wrapped and direct response formats
      let profileData: AdminProfile;
      if (isSuccessResponse(response)) {
        profileData = response.data;
      } else if ((response as any).id) {
        profileData = response as unknown as AdminProfile;
      } else if ((response as any).data && (response as any).data.id) {
        // Handle nested data format
        profileData = (response as any).data;
      } else {
        // Log the actual response structure for debugging
        console.error('❌ Invalid response format. Response structure:', {
          hasSuccess: 'success' in (response || {}),
          hasId: 'id' in (response || {}),
          hasData: 'data' in (response || {}),
          responseKeys: response ? Object.keys(response) : [],
          responseType: typeof response,
          response: response
        });
        throw new Error('Invalid response format');
      }

      return this.mapToUserProfileData(profileData);
    } catch (error: Error & { response?: { status?: number }; status?: number }) {
      // Suppress 401 errors during server-side rendering (expected when no auth token)
      const is401 = error?.response?.status === 401 || error?.status === 401;
      const isServerSide = typeof window === 'undefined';
      
      if (!error?.suppressLog && !(is401 && isServerSide)) {
        console.error('User profile fetch error:', error);
      }
      throw error;
    }
  }

  async updateUserProfile(data: UpdateProfileData): Promise<UserProfileData> {
    try {
      const response = await apiClient.patch<AdminProfile>(
        API_ENDPOINTS.USERS.ME,
        data
      );

      // Handle both wrapped and direct response formats
      let profileData: AdminProfile;
      if (isSuccessResponse(response)) {
        profileData = response.data;
      } else if ((response as any).id) {
        profileData = response as unknown as AdminProfile;
      } else if ((response as any).data && (response as any).data.id) {
        // Handle nested data format
        profileData = (response as any).data;
      } else {
        // Log the actual response structure for debugging
        console.error('❌ Invalid response format. Response structure:', {
          hasSuccess: 'success' in (response || {}),
          hasId: 'id' in (response || {}),
          hasData: 'data' in (response || {}),
          responseKeys: response ? Object.keys(response) : [],
          responseType: typeof response,
          response: response
        });
        throw new Error('Invalid response format');
      }

      return this.mapToUserProfileData(profileData);
    } catch (error) {
      console.error('User profile update error:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await apiClient.post(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        data
      );
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  async updateProfilePicture(file: File): Promise<UserProfileData> {
    try {
      // 1. We need the user ID first
      const userProfile = await this.getUserProfile();
      if (!userProfile?.id) {
        throw new Error('User ID not found');
      }

      const formData = new FormData();
      // 2. Determine endpoint based on role
      // System Admins must use the admin endpoint
      // Other roles (Branch Manager, Account Manager) use the standard user endpoint
      let endpoint: string;
      let method: 'put' | 'patch';
      let fieldName: string;

      if (userProfile.role === 'system_admin') {
        endpoint = API_ENDPOINTS.ADMIN.UPDATE_PROFILE_PICTURE(userProfile.id);
        method = 'put';
        fieldName = 'profilePicture';
      } else {
        endpoint = API_ENDPOINTS.USERS.PROFILE_PICTURE;
        method = 'patch';
        fieldName = 'file'; // Matches Branch Manager implementation
      }

      formData.append(fieldName, file);

      const response = await apiClient[method]<AdminProfile>(
        endpoint,
        formData,
        {
          headers: {
            // Let browser set Content-Type for FormData
          },
        }
      );

      // 3. Inspect response (optional debugging)
      if (!(response.data as any).success && !(response.data as any).id && !(response.data as any).url) {
        console.warn('Profile picture upload response might be partial', response);
      }

      // 4. FIX: Refetch the full profile to ensure we have complete data
      // The upload endpoint might return only the image URL or a partial object,
      // which causes the UI to wipe out other fields if we assume it's the full profile.
      return await this.getUserProfile();
    } catch (error) {
      console.error('Profile picture update error:', error);

      // Handle 500 Server Errors gracefully
      if ((error as any)?.status === 500) {
        console.warn('⚠️ Profile picture upload failed (500 Internal Server Error)');
        throw new Error('Profile picture upload is temporarily unavailable.');
      }

      throw error;
    }
  }
}

// Export singleton instance
export const userProfileService = new UserProfileAPIService();
