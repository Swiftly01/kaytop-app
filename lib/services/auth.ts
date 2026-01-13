/**
 * Authentication Service
 * Handles authentication operations and session management
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { authenticationManager } from '../api/authManager';
import type { 
  LoginCredentials, 
  AuthResponse, 
  AdminProfile,
  ResetPasswordData,
  ChangePasswordData 
} from '../api/types';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): AdminProfile | null;
  isAuthenticated(): boolean;
  refreshToken(): Promise<AuthResponse>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(data: ResetPasswordData): Promise<void>;
  changePassword(data: ChangePasswordData): Promise<void>;
}

class AuthAPIService implements AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Handle both wrapped and direct response formats
      let authData: AuthResponse;
      if (response.success && response.data) {
        authData = response.data;
      } else if ((response as any).token) {
        authData = response as unknown as AuthResponse;
      } else {
        throw new Error('Invalid login response format');
      }

      // Store authentication data
      const expiresAt = authData.expiresIn 
        ? Date.now() + (authData.expiresIn * 1000)
        : Date.now() + (24 * 60 * 60 * 1000); // Default 24 hours

      authenticationManager.setAuth(
        {
          accessToken: authData.token,
          expiresAt,
        },
        authData.user
      );

      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear local authentication state
      authenticationManager.clearAuth();
      
      // Note: Backend doesn't have a logout endpoint in the current API
      // If needed, we can add a call to invalidate the token on the server
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server call fails
      authenticationManager.clearAuth();
    }
  }

  getCurrentUser(): AdminProfile | null {
    return authenticationManager.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return authenticationManager.isAuthenticated();
  }

  async refreshToken(): Promise<AuthResponse> {
    // Note: Backend doesn't have a refresh token endpoint in the current API
    // This is a placeholder for future implementation
    throw new Error('Token refresh not implemented');
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await apiClient.post(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        data
      );
    } catch (error) {
      console.error('Reset password error:', error);
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
      console.error('Change password error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthAPIService();