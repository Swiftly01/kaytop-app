/**
 * Authentication Context
 * Provides global authentication state and methods to the application
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/services/auth';
import type { LoginCredentials, AdminProfile, AuthResponse } from '../../lib/api/types';

export interface AuthContextType {
  user: AdminProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: AdminProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();

        if (storedToken && storedUser && authService.isAuthenticated()) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          // Clear invalid auth data only if we're not on auth pages
          const isAuthPage = typeof window !== 'undefined' && window.location.pathname.includes('/auth/');
          if (!isAuthPage) {
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        const isAuthPage = typeof window !== 'undefined' && window.location.pathname.includes('/auth/');
        if (!isAuthPage) {
          authService.logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

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

  const logout = (): void => {
    setIsLoading(true);
    try {
      authService.logout();
      setToken(null);
      setUser(null);
      
      // Redirect to login page
      router.push('/auth/system-admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if service call fails
      setToken(null);
      setUser(null);
      router.push('/auth/system-admin/login');
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
    // Update stored user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-user', JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = Boolean(token && user && authService.isAuthenticated());

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    updateUser,
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
        router.push('/auth/system-admin/login');
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