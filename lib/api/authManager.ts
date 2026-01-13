/**
 * Authentication Manager
 * Handles token management, authentication state, and session management
 */

import { API_CONFIG } from './config';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  tokens: AuthTokens | null;
}

class AuthenticationManager {
  private static instance: AuthenticationManager;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    tokens: null,
  };
  private listeners: Array<(state: AuthState) => void> = [];

  private constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  public static getInstance(): AuthenticationManager {
    if (!AuthenticationManager.instance) {
      AuthenticationManager.instance = new AuthenticationManager();
    }
    return AuthenticationManager.instance;
  }

  /**
   * Convert API role format to middleware expected format
   */
  private convertRoleForMiddleware(role: string): string {
    const roleMap: Record<string, string> = {
      'system_admin': 'ADMIN',
      'branch_manager': 'BRANCH_MANAGER',
      'account_manager': 'ACCOUNT_MANAGER',
      'hq_manager': 'ADMIN',
      'credit_officer': 'CREDIT_OFFICER',
      'customer': 'USER',
    };
    
    return roleMap[role] || 'USER';
  }

  /**
   * Load authentication state from localStorage
   */
  private loadFromStorage(): void {
    try {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('auth_user');
      const expiresAt = localStorage.getItem('auth_expires_at');

      if (token && user) {
        const parsedUser = JSON.parse(user);
        const parsedExpiresAt = expiresAt ? parseInt(expiresAt, 10) : undefined;

        // Check if token is still valid
        if (!parsedExpiresAt || parsedExpiresAt > Date.now()) {
          this.authState = {
            isAuthenticated: true,
            user: parsedUser,
            tokens: {
              accessToken: token,
              expiresAt: parsedExpiresAt,
            },
          };
        } else {
          // Token expired, clear storage
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error('Error loading auth state from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Save authentication state to localStorage and cookies
   */
  private saveToStorage(): void {
    try {
      if (this.authState.isAuthenticated && this.authState.tokens && this.authState.user) {
        // Save to localStorage
        localStorage.setItem('auth_token', this.authState.tokens.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(this.authState.user));
        if (this.authState.tokens.expiresAt) {
          localStorage.setItem('auth_expires_at', this.authState.tokens.expiresAt.toString());
        }
        
        // Save to cookies for middleware
        if (typeof document !== 'undefined') {
          const expiresDate = this.authState.tokens.expiresAt 
            ? new Date(this.authState.tokens.expiresAt).toUTCString()
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(); // 24 hours default
          
          // Convert role to middleware expected format
          const middlewareRole = this.convertRoleForMiddleware(this.authState.user.role);
            
          document.cookie = `token=${this.authState.tokens.accessToken}; expires=${expiresDate}; path=/; SameSite=Lax`;
          document.cookie = `role=${middlewareRole}; expires=${expiresDate}; path=/; SameSite=Lax`;
          document.cookie = `user=${encodeURIComponent(JSON.stringify(this.authState.user))}; expires=${expiresDate}; path=/; SameSite=Lax`;
        }
      } else {
        this.clearStorage();
      }
    } catch (error) {
      console.error('Error saving auth state to storage:', error);
    }
  }

  /**
   * Clear authentication data from localStorage and cookies
   */
  private clearStorage(): void {
    try {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_expires_at');
      localStorage.removeItem('auth_refresh_token');
      
      // Clear cookies by setting them to expire
      if (typeof document !== 'undefined') {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  }

  /**
   * Notify all listeners of auth state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.authState);
      } catch (error) {
        console.error('Error notifying auth listener:', error);
      }
    });
  }

  /**
   * Set authentication tokens and user data
   */
  public setAuth(tokens: AuthTokens, user: any): void {
    this.authState = {
      isAuthenticated: true,
      user,
      tokens,
    };
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Clear authentication state (logout)
   */
  public clearAuth(): void {
    this.authState = {
      isAuthenticated: false,
      user: null,
      tokens: null,
    };
    this.clearStorage();
    this.notifyListeners();
  }

  /**
   * Force clear all authentication data including cookies
   * Use this for logout to ensure complete cleanup
   */
  public forceLogout(): void {
    this.clearAuth();
    
    // Additional cookie clearing with different paths and domains
    if (typeof document !== 'undefined') {
      const cookiesToClear = ['token', 'role', 'user', 'auth_token', 'auth_user'];
      const paths = ['/', '/dashboard', '/auth'];
      
      cookiesToClear.forEach(cookieName => {
        paths.forEach(path => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${window.location.hostname};`;
        });
      });
    }
  }

  /**
   * Get current authentication state
   */
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Get current access token
   */
  public getAccessToken(): string | null {
    return this.authState.tokens?.accessToken || null;
  }

  /**
   * Get current user data
   */
  public getCurrentUser(): any | null {
    return this.authState.user;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  /**
   * Check if token is expired or about to expire
   */
  public isTokenExpired(): boolean {
    if (!this.authState.tokens?.expiresAt) {
      return false; // No expiration time set, assume valid
    }
    
    const now = Date.now();
    const expiresAt = this.authState.tokens.expiresAt;
    const threshold = API_CONFIG.TOKEN_REFRESH_THRESHOLD;
    
    return (expiresAt - now) <= threshold;
  }

  /**
   * Subscribe to authentication state changes
   */
  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Update user data without changing tokens
   */
  public updateUser(user: any): void {
    if (this.authState.isAuthenticated) {
      this.authState.user = user;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Update tokens without changing user data
   */
  public updateTokens(tokens: AuthTokens): void {
    if (this.authState.isAuthenticated) {
      this.authState.tokens = tokens;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    return this.authState.user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  public hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.authState.user?.role);
  }

  /**
   * Get user role
   */
  public getUserRole(): string | null {
    return this.authState.user?.role || null;
  }

  /**
   * Get authentication headers for API requests
   */
  public async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    
    try {
      if (this.authState.isAuthenticated && this.authState.tokens?.accessToken) {
        headers['Authorization'] = `Bearer ${this.authState.tokens.accessToken}`;
      }
    } catch (error) {
      console.error('Error getting auth headers:', error);
    }
    
    return headers;
  }

  /**
   * Get authentication headers (synchronous version)
   */
  public getAuthHeadersSync(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    try {
      if (this.authState.isAuthenticated && this.authState.tokens?.accessToken) {
        headers['Authorization'] = `Bearer ${this.authState.tokens.accessToken}`;
      }
    } catch (error) {
      console.error('Error getting auth headers sync:', error);
    }
    
    return headers;
  }

  /**
   * Handle authentication failure (401/403 errors)
   * Clears auth state and redirects to login if configured
   */
  public handleAuthenticationFailure(): void {
    console.warn('🔐 Authentication failure detected, clearing auth state');
    
    // Clear authentication state
    this.clearAuth();
    
    // Redirect to login if auto-logout is enabled and we're in browser
    if (API_CONFIG.AUTO_LOGOUT_ON_TOKEN_EXPIRE && typeof window !== 'undefined') {
      // Avoid redirect loops by checking current path
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/auth/') && !currentPath.includes('/login')) {
        console.log('🔄 Redirecting to login due to authentication failure');
        window.location.href = '/auth/bm/login';
      }
    }
  }
}

// Export singleton instance
export const authenticationManager = AuthenticationManager.getInstance();