/**
 * Unified Authentication Manager
 * Handles token management, automatic refresh, and authentication failures
 */

import { API_CONFIG } from './config';

export interface TokenStorage {
  getToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(token: string, refreshToken?: string): void;
  clearTokens(): void;
}

export interface AuthenticationManager {
  getAuthHeaders(): Promise<Record<string, string>>;
  refreshToken(): Promise<string | null>;
  handleAuthenticationFailure(): void;
  isTokenExpired(token: string): boolean;
}

class BrowserTokenStorage implements TokenStorage {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first
    const token = localStorage.getItem('auth-token');
    if (token) return token;
    
    // Fallback to cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-token') {
        return decodeURIComponent(value);
      }
    }
    
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first
    const refreshToken = localStorage.getItem('auth-refresh-token');
    if (refreshToken) return refreshToken;
    
    // Fallback to cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-refresh-token') {
        return decodeURIComponent(value);
      }
    }
    
    return null;
  }

  setTokens(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    
    // Store in localStorage
    localStorage.setItem('auth-token', token);
    if (refreshToken) {
      localStorage.setItem('auth-refresh-token', refreshToken);
    }
    
    // Also store in cookies as fallback
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 days
    
    document.cookie = `auth-token=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    if (refreshToken) {
      document.cookie = `auth-refresh-token=${encodeURIComponent(refreshToken)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    }
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    // Clear localStorage
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-refresh-token');
    localStorage.removeItem('auth-user');
    
    // Clear cookies
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'auth-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}

class UnifiedAuthenticationManager implements AuthenticationManager {
  private tokenStorage: TokenStorage;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.tokenStorage = new BrowserTokenStorage();
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async getValidToken(): Promise<string | null> {
    let token = this.tokenStorage.getToken();
    
    if (!token) {
      if (API_CONFIG.DEBUG) {
        console.log('🔑 No token found');
      }
      return null;
    }

    // Check if token is expired
    if (this.isTokenExpired(token)) {
      if (API_CONFIG.DEBUG) {
        console.log('🔑 Token expired, attempting refresh');
      }
      token = await this.refreshToken();
    }

    return token;
  }

  async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      this.refreshPromise = null;
      this.handleAuthenticationFailure();
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('Invalid refresh response: missing token');
      }

      // Store new tokens
      this.tokenStorage.setTokens(data.token, data.refreshToken || refreshToken);
      
      if (API_CONFIG.DEBUG) {
        console.log('🔑 Token refreshed successfully');
      }
      
      return data.token;
    } catch (error) {
      if (API_CONFIG.DEBUG) {
        console.error('🔑 Token refresh failed:', error);
      }
      throw error;
    }
  }

  handleAuthenticationFailure(): void {
    if (API_CONFIG.DEBUG) {
      console.log('🔑 Handling authentication failure');
    }
    
    // Clear stored tokens
    this.tokenStorage.clearTokens();
    
    // Redirect to login if not already on auth page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
      const currentPath = window.location.pathname;
      const redirectUrl = `/auth/login?reason=session_expired&redirect=${encodeURIComponent(currentPath)}`;
      
      if (API_CONFIG.DEBUG) {
        console.log('🔑 Redirecting to login:', redirectUrl);
      }
      
      window.location.href = redirectUrl;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
      
      return expirationTime <= (currentTime + bufferTime);
    } catch (error) {
      if (API_CONFIG.DEBUG) {
        console.error('🔑 Error parsing token:', error);
      }
      return true; // Treat invalid tokens as expired
    }
  }

  /**
   * Get current user from stored token
   */
  getCurrentUser(): any | null {
    const token = this.tokenStorage.getToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.userId,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName,
        lastName: payload.lastName,
        branch: payload.branch,
        state: payload.state,
      };
    } catch (error) {
      if (API_CONFIG.DEBUG) {
        console.error('🔑 Error parsing user from token:', error);
      }
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.tokenStorage.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Login with credentials
   */
  async login(email: string, password: string, userType?: string): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Handle different response formats from backend
      let token = data.access_token || data.token;
      let refreshToken = data.refresh_token || data.refreshToken;
      
      if (!token) {
        console.error('No token found in response. Full response:', JSON.stringify(data, null, 2));
        throw new Error('Invalid login response: missing token');
      }

      // Store tokens
      this.tokenStorage.setTokens(token, refreshToken);
      
      if (API_CONFIG.DEBUG) {
        console.log('🔑 Login successful');
      }
      
      return {
        token,
        refreshToken,
        user: data.user || data,
        role: data.role || data.user?.role,
        ...data
      };
    } catch (error) {
      if (API_CONFIG.DEBUG) {
        console.error('🔑 Login failed:', error);
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const token = this.tokenStorage.getToken();
      
      if (token) {
        // Attempt to notify backend of logout
        await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }).catch(() => {
          // Ignore logout endpoint errors - still clear local tokens
        });
      }
    } finally {
      // Always clear tokens regardless of backend response
      this.tokenStorage.clearTokens();
      
      if (API_CONFIG.DEBUG) {
        console.log('🔑 Logout completed');
      }
    }
  }
}

// Export singleton instance
export const authenticationManager = new UnifiedAuthenticationManager();

// Export for testing
export { BrowserTokenStorage, UnifiedAuthenticationManager };