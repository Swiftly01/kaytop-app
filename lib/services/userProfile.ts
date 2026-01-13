/**
 * User Profile Service
 * Handles user profile management and authentication settings
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import type { AdminProfile } from '../api/types';

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
  async getUserProfile(): Promise<UserProfileData> {
    try {
      const response = await apiClient.get<AdminProfile>(
        API_ENDPOINTS.USERS.PROFILE
      );

      // Handle both wrapped and direct response formats
      let profileData: AdminProfile;
      if (response.success && response.data) {
        profileData = response.data;
      } else if ((response as any).id) {
        profileData = response as unknown as AdminProfile;
      } else {
        throw new Error('Invalid response format');
      }

      // Transform to UserProfileData format
      return {
        id: String(profileData.id),
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        mobileNumber: profileData.mobileNumber,
        role: profileData.role,
        branch: profileData.branch,
        state: profileData.state,
        verificationStatus: profileData.verificationStatus,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      };
    } catch (error) {
      console.error('User profile fetch error:', error);
      throw error;
    }
  }

  async updateUserProfile(data: UpdateProfileData): Promise<UserProfileData> {
    try {
      const response = await apiClient.put<AdminProfile>(
        API_ENDPOINTS.USERS.PROFILE,
        data
      );

      // Handle both wrapped and direct response formats
      let profileData: AdminProfile;
      if (response.success && response.data) {
        profileData = response.data;
      } else if ((response as any).id) {
        profileData = response as unknown as AdminProfile;
      } else {
        throw new Error('Invalid response format');
      }

      // Transform to UserProfileData format
      return {
        id: String(profileData.id),
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        mobileNumber: profileData.mobileNumber,
        role: profileData.role,
        branch: profileData.branch,
        state: profileData.state,
        verificationStatus: profileData.verificationStatus,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      };
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
      formData.append('profilePicture', file);

      // 2. Use the specific Admin endpoint
      // Note: We use the admin endpoint because the user-facing ones aren't working for files
      const response = await apiClient.put<AdminProfile>(
        API_ENDPOINTS.ADMIN.UPDATE_PROFILE_PICTURE(userProfile.id),
        formData,
        {
          headers: {
            // Let browser set Content-Type for FormData
          },
        }
      );

      // Handle both wrapped and direct response formats
      let profileData: AdminProfile;
      if (response.success && response.data) {
        profileData = response.data;
      } else if ((response as any).id) {
        profileData = response as unknown as AdminProfile;
      } else {
        throw new Error('Invalid response format');
      }

      // Transform to UserProfileData format
      return {
        id: String(profileData.id),
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        mobileNumber: profileData.mobileNumber,
        role: profileData.role,
        branch: profileData.branch,
        state: profileData.state,
        profilePicture: profileData.profilePicture,
        verificationStatus: profileData.verificationStatus,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      };
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