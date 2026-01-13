/**
 * Authentication Debug Utilities
 * Helps troubleshoot authentication issues
 */

import { authenticationManager } from '../api/authManager';

export interface AuthDebugInfo {
  authContext: {
    hasSession: boolean;
    sessionData: any;
  };
  authManager: {
    isAuthenticated: boolean;
    hasToken: boolean;
    tokenLength?: number;
    tokenPrefix?: string;
    user: any;
    authState: any;
  };
  localStorage: {
    authSession: any;
    authToken: string | null;
    authUser: any;
  };
  cookies: {
    token: string | null;
    role: string | null;
    user: string | null;
  };
}

/**
 * Get comprehensive authentication debug information
 */
export function getAuthDebugInfo(): AuthDebugInfo {
  const debugInfo: AuthDebugInfo = {
    authContext: {
      hasSession: false,
      sessionData: null,
    },
    authManager: {
      isAuthenticated: false,
      hasToken: false,
      user: null,
      authState: null,
    },
    localStorage: {
      authSession: null,
      authToken: null,
      authUser: null,
    },
    cookies: {
      token: null,
      role: null,
      user: null,
    },
  };

  try {
    // Check AuthContext localStorage
    const authSession = localStorage.getItem('auth_session');
    if (authSession) {
      debugInfo.authContext.hasSession = true;
      debugInfo.authContext.sessionData = JSON.parse(authSession);
    }

    // Check AuthManager state
    const authState = authenticationManager.getAuthState();
    debugInfo.authManager.isAuthenticated = authState.isAuthenticated;
    debugInfo.authManager.hasToken = !!authState.tokens?.accessToken;
    debugInfo.authManager.user = authState.user;
    debugInfo.authManager.authState = authState;

    if (authState.tokens?.accessToken) {
      debugInfo.authManager.tokenLength = authState.tokens.accessToken.length;
      debugInfo.authManager.tokenPrefix = authState.tokens.accessToken.substring(0, 20) + '...';
    }

    // Check localStorage tokens
    debugInfo.localStorage.authToken = localStorage.getItem('auth_token');
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      debugInfo.localStorage.authUser = JSON.parse(authUser);
    }

    // Check cookies
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      debugInfo.cookies.token = cookies.token || null;
      debugInfo.cookies.role = cookies.role || null;
      debugInfo.cookies.user = cookies.user ? decodeURIComponent(cookies.user) : null;
    }
  } catch (error) {
    console.error('Error getting auth debug info:', error);
  }

  return debugInfo;
}

/**
 * Log comprehensive authentication debug information
 */
export function logAuthDebugInfo(): void {
  const debugInfo = getAuthDebugInfo();
  
  console.group('🔍 Authentication Debug Information');
  
  console.group('📱 AuthContext');
  console.log('Has Session:', debugInfo.authContext.hasSession);
  console.log('Session Data:', debugInfo.authContext.sessionData);
  console.groupEnd();
  
  console.group('🔐 AuthManager');
  console.log('Is Authenticated:', debugInfo.authManager.isAuthenticated);
  console.log('Has Token:', debugInfo.authManager.hasToken);
  console.log('Token Length:', debugInfo.authManager.tokenLength);
  console.log('Token Prefix:', debugInfo.authManager.tokenPrefix);
  console.log('User:', debugInfo.authManager.user);
  console.log('Auth State:', debugInfo.authManager.authState);
  console.groupEnd();
  
  console.group('💾 LocalStorage');
  console.log('Auth Session:', debugInfo.localStorage.authSession);
  console.log('Auth Token:', debugInfo.localStorage.authToken);
  console.log('Auth User:', debugInfo.localStorage.authUser);
  console.groupEnd();
  
  console.group('🍪 Cookies');
  console.log('Token:', debugInfo.cookies.token);
  console.log('Role:', debugInfo.cookies.role);
  console.log('User:', debugInfo.cookies.user);
  console.groupEnd();
  
  console.groupEnd();
}

/**
 * Test authentication by making a simple API call
 */
export async function testAuthentication(): Promise<{
  success: boolean;
  error?: string;
  status?: number;
}> {
  try {
    const headers = await authenticationManager.getAuthHeaders();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://kaytop-production.up.railway.app'}/admin/system-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    return {
      success: response.ok,
      status: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Log authentication attempt with context
 */
export function logAuthAttempt(context: string, success: boolean, error?: any): void {
  const timestamp = new Date().toISOString();
  const debugInfo = getAuthDebugInfo();
  
  console.group(`🔐 Auth Attempt: ${context} - ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log('Timestamp:', timestamp);
  console.log('Success:', success);
  if (error) {
    console.log('Error:', error);
  }
  console.log('Auth State:', {
    contextHasSession: debugInfo.authContext.hasSession,
    managerAuthenticated: debugInfo.authManager.isAuthenticated,
    hasToken: debugInfo.authManager.hasToken,
  });
  console.groupEnd();
}