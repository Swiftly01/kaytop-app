"use client";
import { createContext, useContext } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorage";
import { removeAuthCookies, setAuthCookies } from "@/lib/authCookies";


interface AuthContextType {
  session: { token: string } | null;
  login: (token: string, role: string) => void;
  logOut: () => void;
  setCookie: (token: string, role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, setSession] = useLocalStorageState<{
    token: string;
    role: string;
  } | null>(null, "auth_session");

  const login = (token: string, role: string): void => {
    setSession({ token, role });
  };

  const logOut = (): void => {
    setSession(null);
    removeAuthCookies();
  };

  const setCookie = (token: string, role: string): void => {
    setAuthCookies(token, role);
  };

  return (
    <AuthContext.Provider value={{ session, login, logOut, setCookie }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("AuthContext was used outside of AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };

// /**
//  * Authentication Context
//  * Provides global authentication state and methods to the application
//  */

// 'use client';

// import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { useRouter } from 'next/navigation';
// import { authService } from '../../lib/services/auth';
// import { getDefaultDashboard, validateRoleAccess, UserRole } from '../../lib/utils/roleUtils';
// import type { LoginCredentials, AdminProfile, AuthResponse } from '../../lib/api/types';

// export interface AuthContextType {
//   user: AdminProfile | null;
//   token: string | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   login: (credentials: LoginCredentials) => Promise<void>;
//   loginUnified: (credentials: LoginCredentials) => Promise<void>;
//   logout: () => void;
//   refreshToken: () => Promise<void>;
//   updateUser: (user: AdminProfile) => void;
//   getDefaultRoute: () => string;
//   canAccessRoute: (path: string) => boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export function AuthProvider({ children }: AuthProviderProps) {
//   const [user, setUser] = useState<AdminProfile | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();

//   // Initialize auth state from localStorage
//   useEffect(() => {
//     const initializeAuth = () => {
//       try {
//         const storedToken = authService.getToken();
//         const storedUser = authService.getUser();

//         if (storedToken && storedUser && authService.isAuthenticated()) {
//           setToken(storedToken);
//           setUser(storedUser);
//         } else {
//           // Clear invalid auth data only if we're not on auth pages
//           const isAuthPage = typeof window !== 'undefined' && window.location.pathname.includes('/auth/');
//           if (!isAuthPage) {
//             authService.logout();
//           }
//         }
//       } catch (error) {
//         console.error('Error initializing auth:', error);
//         const isAuthPage = typeof window !== 'undefined' && window.location.pathname.includes('/auth/');
//         if (!isAuthPage) {
//           authService.logout();
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);

//   const login = async (credentials: LoginCredentials): Promise<void> => {
//     setIsLoading(true);
//     try {
//       const authResponse: AuthResponse = await authService.login(credentials);
      
//       setToken(authResponse.token);
//       setUser(authResponse.user);
      
//       // Redirect to dashboard after successful login
//       router.push('/dashboard/system-admin');
//     } catch (error) {
//       // Clear any partial auth state
//       setToken(null);
//       setUser(null);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loginUnified = async (credentials: LoginCredentials): Promise<void> => {
//     setIsLoading(true);
//     try {
//       const authResponse: AuthResponse = await authService.loginUnified(credentials);
      
//       setToken(authResponse.token);
//       setUser(authResponse.user);
      
//       // Use role-based routing for unified login
//       const userRole = authResponse.user.role as UserRole;
//       const defaultDashboard = getDefaultDashboard(userRole);
      
//       // Wait for cookies to be set properly
//       await new Promise(resolve => setTimeout(resolve, 200));
      
//       // Force a hard redirect to ensure middleware processes the request
//       if (typeof window !== 'undefined') {
//         window.location.href = defaultDashboard;
//       } else {
//         router.push(defaultDashboard);
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       // Clear any partial auth state
//       setToken(null);
//       setUser(null);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = (): void => {
//     setIsLoading(true);
//     try {
//       authService.logout();
//       setToken(null);
//       setUser(null);
      
//       // Redirect to unified login page
//       router.push('/auth/login');
//     } catch (error) {
//       console.error('Error during logout:', error);
//       // Still clear local state even if service call fails
//       setToken(null);
//       setUser(null);
//       router.push('/auth/login');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const refreshToken = async (): Promise<void> => {
//     try {
//       const authResponse = await authService.refreshToken();
//       setToken(authResponse.token);
//       setUser(authResponse.user);
//     } catch (error) {
//       console.error('Token refresh failed:', error);
//       // If refresh fails, logout user
//       logout();
//       throw error;
//     }
//   };

//   const updateUser = (updatedUser: AdminProfile): void => {
//     setUser(updatedUser);
//     // Update stored user data
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('auth-user', JSON.stringify(updatedUser));
//     }
//   };

//   const getDefaultRoute = (): string => {
//     if (user && user.role) {
//       return getDefaultDashboard(user.role as UserRole);
//     }
//     return '/dashboard/system-admin';
//   };

//   const canAccessRoute = (path: string): boolean => {
//     if (user && user.role) {
//       return validateRoleAccess(user.role as UserRole, path);
//     }
//     return false;
//   };

//   const isAuthenticated = Boolean(token && user && authService.isAuthenticated());

//   const contextValue: AuthContextType = {
//     user,
//     token,
//     isLoading,
//     isAuthenticated,
//     login,
//     loginUnified,
//     logout,
//     refreshToken,
//     updateUser,
//     getDefaultRoute,
//     canAccessRoute,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth(): AuthContextType {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// // Higher-order component for protecting routes
// export function withAuth<P extends object>(
//   WrappedComponent: React.ComponentType<P>
// ): React.ComponentType<P> {
//   return function AuthenticatedComponent(props: P) {
//     const { isAuthenticated, isLoading } = useAuth();
//     const router = useRouter();

//     useEffect(() => {
//       if (!isLoading && !isAuthenticated) {
//         router.push('/auth/login');
//       }
//     }, [isAuthenticated, isLoading, router]);

//     if (isLoading) {
//       return (
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//         </div>
//       );
//     }

//     if (!isAuthenticated) {
//       return null;
//     }

//     return <WrappedComponent {...props} />;
//   };
// }