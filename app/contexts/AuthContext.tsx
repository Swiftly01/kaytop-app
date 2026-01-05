/**
 * Authentication Context
 * Provides global authentication state and methods to the application
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/services/auth';
import { getDefaultDashboard, validateRoleAccess, UserRole } from '../../lib/utils/roleUtils';
import type { LoginCredentials, AdminProfile, AuthResponse } from '../../lib/api/types';

export interface AuthContextType {
  user: AdminProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginUnified: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: AdminProfile) => void;
  getDefaultRoute: () => string;
  canAccessRoute: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize auth state from localStorage only after hydration
  useEffect(() => {
    if (!isClient) return;

    const initializeAuth = () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();

        console.log('🔍 AuthContext initialization:', {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
          userRole: storedUser?.role,
          isAuthenticated: storedToken && storedUser && authService.isAuthenticated()
        });

        if (storedToken && storedUser && authService.isAuthenticated()) {
          setToken(storedToken);
          setUser(storedUser);
          console.log('✅ Auth state initialized successfully:', {
            userEmail: storedUser.email,
            userRole: storedUser.role
          });
        } else {
          // Clear invalid auth data only if we're not on auth pages
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.includes('/auth/') || currentPath === '/';
          console.log('❌ Invalid auth data detected:', {
            currentPath,
            isAuthPage,
            hasToken: !!storedToken,
            hasUser: !!storedUser,
            isAuthenticated: storedToken && storedUser ? authService.isAuthenticated() : false
          });
          if (!isAuthPage) {
            console.log('🔄 Clearing invalid auth data and redirecting to login');
            authService.logout();
          }
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/auth/') || currentPath === '/';
        if (!isAuthPage) {
          authService.logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isClient]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const authResponse: AuthResponse = await authService.login(credentials);
      
      setToken(authResponse.token);
      setUser(authResponse.user);
      
      // Redirect to dashboard after successful login
      router.push('/dashboard/system-admin');
    } catch (error) {
      // Clear any partial auth state
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginUnified = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting unified login for:', credentials.email);
      const authResponse: AuthResponse = await authService.loginUnified(credentials);
      
      console.log('✅ Login successful, setting auth state');
      console.log('📊 Auth response:', {
        hasToken: !!authResponse.token,
        userRole: authResponse.user.role,
        userEmail: authResponse.user.email
      });
      
      setToken(authResponse.token);
      setUser(authResponse.user);
      
      // Use role-based routing for unified login
      const userRole = authResponse.user.role as UserRole;
      const defaultDashboard = getDefaultDashboard(userRole);
      
      console.log('🎯 Role-based routing details:', {
        userRole,
        defaultDashboard,
        allRoles: Object.values(UserRole)
      });
      
      console.log('🚀 Redirecting to dashboard:', defaultDashboard);
      
      // Wait for cookies to be set properly
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Force a hard redirect to ensure middleware processes the request
      if (typeof window !== 'undefined') {
        console.log('🌐 Performing hard redirect to:', defaultDashboard);
        window.location.href = defaultDashboard;
      } else {
        console.log('🔄 Using router.push to:', defaultDashboard);
        router.push(defaultDashboard);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      // Clear any partial auth state
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setIsLoading(true);
    try {
      authService.logout();
      setToken(null);
      setUser(null);
      
      // Redirect to unified login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if service call fails
      setToken(null);
      setUser(null);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const authResponse = await authService.refreshToken();
      setToken(authResponse.token);
      setUser(authResponse.user);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  const updateUser = (updatedUser: AdminProfile): void => {
    setUser(updatedUser);
    // Update stored user data only on client side
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-user', JSON.stringify(updatedUser));
    }
  };

  const getDefaultRoute = (): string => {
    if (user && user.role) {
      return getDefaultDashboard(user.role as UserRole);
    }
    // Don't default to system-admin, instead redirect to login
    return '/auth/login';
  };

  const canAccessRoute = (path: string): boolean => {
    if (user && user.role) {
      return validateRoleAccess(user.role as UserRole, path);
    }
    return false;
  };

  const isAuthenticated = Boolean(token && user && authService.isAuthenticated());

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    loginUnified,
    logout,
    refreshToken,
    updateUser,
    getDefaultRoute,
    canAccessRoute,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}