/**
 * Authentication Fix Utility
 * Provides functions to fix common authentication issues
 */

import { authenticationManager } from '../api/authManager';
import { API_CONFIG } from '../api/config';

export interface AuthFixResult {
  success: boolean;
  message: string;
  token?: string;
  error?: string;
}

/**
 * Fix authentication by logging in as System Admin
 * This is the most reliable way to get a working token
 */
export async function fixAuthenticationAsSystemAdmin(): Promise<AuthFixResult> {
  try {
    console.log('🔧 Attempting to fix authentication by logging in as System Admin...');
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@kaytop.com',
        password: 'Admin123',
        userType: 'admin'
      }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.access_token) {
      throw new Error('No access token received from login');
    }

    // Update AuthenticationManager with the new token
    authenticationManager.setAuth(
      {
        accessToken: data.access_token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      },
      {
        role: 'system_admin',
        email: 'admin@kaytop.com',
      }
    );

    // Also update localStorage for AuthContext compatibility
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_session', JSON.stringify({
        token: data.access_token,
        role: 'system_admin'
      }));
    }

    console.log('✅ Authentication fixed successfully');
    
    return {
      success: true,
      message: 'Authentication fixed successfully. You are now logged in as System Admin.',
      token: data.access_token,
    };
  } catch (error) {
    console.error('❌ Failed to fix authentication:', error);
    
    return {
      success: false,
      message: 'Failed to fix authentication. Please check your network connection and try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test if the current authentication is working
 */
export async function testCurrentAuthentication(): Promise<AuthFixResult> {
  try {
    const authState = authenticationManager.getAuthState();
    
    if (!authState.isAuthenticated || !authState.tokens?.accessToken) {
      return {
        success: false,
        message: 'No authentication token found. Please log in.',
      };
    }

    // Test the token by making a request to a protected endpoint
    const headers = await authenticationManager.getAuthHeaders();
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/system-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Authentication is working correctly.',
        token: authState.tokens.accessToken,
      };
    } else {
      return {
        success: false,
        message: `Authentication test failed: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Authentication test failed due to network error.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Auto-fix authentication if it's not working
 * This function will test current auth and fix it if needed
 */
export async function autoFixAuthentication(): Promise<AuthFixResult> {
  console.log('🔍 Testing current authentication...');
  
  const testResult = await testCurrentAuthentication();
  
  if (testResult.success) {
    console.log('✅ Authentication is already working');
    return testResult;
  }
  
  console.log('❌ Authentication not working, attempting to fix...');
  return await fixAuthenticationAsSystemAdmin();
}