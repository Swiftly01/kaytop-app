/**
 * Authentication Service
 * Handles login, logout, token management, and authentication state
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import type {
  LoginCredentials,
  AuthResponse,
  AdminProfile,
  ResetPasswordData,
  ChangePasswordData,
  OTPSendData,
  OTPVerifyData,
} from '../api/types';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(data: ResetPasswordData): Promise<void>;
  changePassword(data: ChangePasswordData): Promise<void>;
  getProfile(): Promise<AdminProfile>;
  refreshToken(): Promise<AuthResponse>;
  isAuthenticated(): boolean;
  getToken(): string | null;
  sendOTP(data: OTPSendData): Promise<void>;
  verifyOTP(data: OTPVerifyData): Promise<void>;
}

class AuthenticationService implements AuthService {
  private readonly TOKEN_KEY = 'auth-token';
  private readonly USER_KEY = 'auth-user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        // Store token and user data
        this.setToken(response.data.token);
        this.setUser(response.data.user);
        
        return response.data;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error) {
      // Clear any existing auth data on login failure
      this.clearAuthData();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear local auth data immediately
      this.clearAuthData();
      
      // Note: Backend doesn't seem to have a logout endpoint
      // Token will expire naturally or be invalidated server-side
    } catch (error) {
      // Always clear local data even if server call fails
      this.clearAuthData();
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to send password reset email');
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to reset password');
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  }

  async getProfile(): Promise<AdminProfile> {
    const response = await apiClient.get<AdminProfile>(
      API_ENDPOINTS.ADMIN.PROFILE
    );

    if (response.success && response.data) {
      // Update stored user data
      this.setUser(response.data);
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch profile');
  }

  async refreshToken(): Promise<AuthResponse> {
    // Note: Backend doesn't seem to have a refresh token endpoint
    // This would typically call a /auth/refresh endpoint
    throw new Error('Token refresh not implemented by backend');
  }

  async sendOTP(data: OTPSendData): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.OTP.SEND,
      data
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to send OTP');
    }
  }

  async verifyOTP(data: OTPVerifyData): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.OTP.VERIFY,
      data
    );

    if (!response.success) {
      throw new Error(response.message || 'OTP verification failed');
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) {
      return false;
    }

    // Check if token is expired (basic check)
    try {
      const payload = this.parseJWTPayload(token);
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        this.clearAuthData();
        return false;
      }
      
      return true;
    } catch {
      // If we can't parse the token, consider it invalid
      this.clearAuthData();
      return false;
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getUser(): AdminProfile | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private setUser(user: AdminProfile): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  private parseJWTPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      throw new Error('Invalid JWT token');
    }
  }
}

// Export singleton instance
export const authService = new AuthenticationService();