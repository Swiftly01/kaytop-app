/**
 * Enhanced Authentication Service
 * Handles unified login, logout, token management, and authentication state
 * Supports role detection and role-based routing
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { 
  detectUserRole, 
  createUserProfile, 
  getDefaultDashboard,
  validateRoleAccess,
  UserRole 
} from '../utils/roleUtils';
import { logAuthAttempt } from '../utils/authDebug';
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
  loginUnified(credentials: LoginCredentials): Promise<AuthResponse>;
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
  detectUserRole(credentials: LoginCredentials): Promise<UserRole>;
  getDefaultDashboard(role: UserRole): string;
  validateRoleAccess(role: UserRole, path: string): boolean;
}

class AuthenticationService implements AuthService {
  private readonly TOKEN_KEY = 'auth-token';
  private readonly USER_KEY = 'auth-user';

  async loginUnified(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Starting unified login for:', credentials.email);
      
      const response = await apiClient.post<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Backend returns nested format: { success: true, data: { access_token: "jwt...", role: "system_admin" } }
      const responseData = response as any;
      
      console.log('📥 Raw backend response:', JSON.stringify(responseData, null, 2));
      console.log('📊 Response analysis:', {
        hasSuccess: 'success' in responseData,
        hasData: 'data' in responseData,
        hasDirectToken: 'access_token' in responseData || 'token' in responseData,
        hasDirectRole: 'role' in responseData,
        responseKeys: Object.keys(responseData),
        dataKeys: responseData.data ? Object.keys(responseData.data) : null
      });

      // Extract data from nested response
      const authData = responseData.data || responseData;
      
      console.log('🔍 Auth data extracted:', JSON.stringify(authData, null, 2));
      
      // Extract token from the auth data
      const token = authData.access_token || authData.token || authData.accessToken;
      
      if (!token) {
        console.error('❌ No token found in response. Full response:', JSON.stringify(responseData, null, 2));
        console.error('❌ Auth data:', JSON.stringify(authData, null, 2));
        throw new Error('No authentication token received from server');
      }

      console.log('🎫 Token extracted successfully:', token.substring(0, 20) + '...');

      // Detect user role from auth data (not the wrapper response)
      let role: UserRole;
      try {
        role = detectUserRole(authData, credentials);
        console.log('✅ Role detected:', role);
      } catch (roleError) {
        console.error('❌ Role detection failed:', roleError);
        
        // If role detection fails, let's try to extract it manually
        const manualRole = authData.role || authData.user?.role;
        console.log('🔧 Attempting manual role extraction:', manualRole);
        
        // Handle common backend role mappings
        if (manualRole === 'user') {
          role = UserRole.CUSTOMER;
          console.log('✅ Manual role extraction: mapped "user" to customer');
        } else if (manualRole === 'admin') {
          role = UserRole.SYSTEM_ADMIN;
          console.log('✅ Manual role extraction: mapped "admin" to system_admin');
        } else if (manualRole === 'system_admin') {
          role = UserRole.SYSTEM_ADMIN;
          console.log('✅ Manual role extraction: mapped "system_admin" to system_admin');
        } else if (manualRole === 'branch_manager') {
          role = UserRole.HQ_MANAGER;
          console.log('✅ Manual role extraction: mapped "branch_manager" to hq_manager');
        } else if (manualRole === 'hq_manager') {
          role = UserRole.HQ_MANAGER;
          console.log('✅ Manual role extraction: mapped "hq_manager" to hq_manager');
        } else if (manualRole === 'account_manager') {
          role = UserRole.ACCOUNT_MANAGER;
          console.log('✅ Manual role extraction: mapped "account_manager" to account_manager');
        } else if (manualRole === 'credit_officer') {
          role = UserRole.CREDIT_OFFICER;
          console.log('✅ Manual role extraction: mapped "credit_officer" to credit_officer');
        } else if (manualRole && Object.values(UserRole).includes(manualRole)) {
          role = manualRole as UserRole;
          console.log('✅ Manual role extraction successful:', role);
        } else {
          console.error('❌ Manual role extraction also failed. Available roles:', Object.values(UserRole));
          console.error('❌ Received role:', manualRole);
          
          // Try to infer from email as last resort
          const email = credentials.email.toLowerCase();
          if (email.includes('admin') || email.includes('system')) {
            role = UserRole.SYSTEM_ADMIN;
            console.log('✅ Email-based role inference: system_admin');
          } else if (email.includes('hq') || email.includes('headquarters')) {
            role = UserRole.HQ_MANAGER;
            console.log('✅ Email-based role inference: hq_manager');
          } else if (email.includes('manager') || email.includes('branch')) {
            role = UserRole.HQ_MANAGER; // Default managers to HQ_MANAGER for AM dashboard access
            console.log('✅ Email-based role inference: hq_manager (from manager/branch pattern)');
          } else if (email.includes('account') || email.includes('am@')) {
            role = UserRole.ACCOUNT_MANAGER;
            console.log('✅ Email-based role inference: account_manager');
          } else if (email.includes('credit') || email.includes('officer')) {
            role = UserRole.CREDIT_OFFICER;
            console.log('✅ Email-based role inference: credit_officer');
          } else {
            // Instead of defaulting to customer, throw an error with detailed information
            console.error('❌ Complete role detection failure. Auth data:', JSON.stringify(authData, null, 2));
            throw new Error(`Unable to determine user role. Email: ${credentials.email}, Backend role: ${manualRole}. Please contact support to verify your account permissions.`);
          }
        }
      }
      
      // Create user profile with detected role (use authData, not responseData)
      const user = createUserProfile(authData, credentials);
      
      // Ensure the user has the correct role
      user.role = role;
      
      console.log('👤 User profile created:', {
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      });

      const authResponse: AuthResponse = { token, user };

      if (!authResponse || !authResponse.token) {
        throw new Error('No authentication token received');
      }

      // Store token and user data
      this.setToken(authResponse.token);
      if (authResponse.user) {
        this.setUser(authResponse.user);
      }
      
      // Ensure cookies are set synchronously
      if (typeof window !== 'undefined') {
        const { setAuthCookies } = require('../authCookies');
        setAuthCookies(authResponse.token, authResponse.user.role);
        console.log('🍪 Auth cookies set with role:', authResponse.user.role);
      }
      
      // Add a small delay to ensure cookies are fully processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('✅ Unified login completed successfully');
      
      // Log authentication attempt for debugging
      const defaultDashboard = getDefaultDashboard(role);
      logAuthAttempt(credentials.email, authData, role, defaultDashboard);
      
      return authResponse;
    } catch (error) {
      console.error('❌ Unified login error details:', error);
      
      // Log failed authentication attempt for debugging
      logAuthAttempt(
        credentials.email, 
        {}, 
        null, 
        '/auth/login', 
        [error instanceof Error ? error.message : 'Unknown error']
      );
      
      // Clear any existing auth data on login failure
      this.clearAuthData();
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Backend returns direct format: { access_token: "jwt...", role: "system_admin" }
      const responseData = response as any;

      // Extract token from the direct response format
      const token = responseData.access_token || responseData.token || responseData.accessToken;
      
      if (!token) {
        console.error('No token found in response. Full response:', JSON.stringify(responseData, null, 2));
        throw new Error('No authentication token received from server');
      }

      // Create user object from available data and credentials
      const user = {
        id: 'system-admin',
        firstName: 'System',
        lastName: 'Admin',
        email: credentials.email,
        mobileNumber: '',
        role: responseData.role || 'system_admin',
        verificationStatus: 'verified' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const authData: AuthResponse = { token, user };

      if (!authData || !authData.token) {
        throw new Error('No authentication token received');
      }

      // Store token and user data
      this.setToken(authData.token);
      if (authData.user) {
        this.setUser(authData.user);
      }
      
      return authData;
    } catch (error) {
      console.error('Login error details:', error);
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
      
      // Also set cookies for middleware
      const { setAuthCookies } = require('../authCookies');
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token && user.role) {
        console.log('🔍 Setting auth cookies with token and role:', { hasToken: !!token, role: user.role });
        setAuthCookies(token, user.role);
      }
    }
  }

  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      
      // Also clear cookies
      const { removeAuthCookies } = require('../authCookies');
      removeAuthCookies();
    }
  }

  async detectUserRole(credentials: LoginCredentials): Promise<UserRole> {
    // This method would typically be used to detect role before login
    // For now, we'll use the unified login which handles role detection
    const authResponse = await this.loginUnified(credentials);
    return authResponse.user.role as UserRole;
  }

  getDefaultDashboard(role: UserRole): string {
    return getDefaultDashboard(role);
  }

  validateRoleAccess(role: UserRole, path: string): boolean {
    return validateRoleAccess(role, path);
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