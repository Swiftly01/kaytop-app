/**
 * Authentication Test Utility
 * Quick test to verify authentication state and endpoint connectivity
 */

import { authenticationManager } from '../api/authManager';
import { API_CONFIG } from '../api/config';

export async function testActivityLogsEndpoint(): Promise<{
  success: boolean;
  error?: string;
  status?: number;
  authState?: any;
  headers?: any;
}> {
  try {
    // Get current auth state
    const authState = authenticationManager.getAuthState();
    const headers = await authenticationManager.getAuthHeaders();
    
    console.log('🔍 Testing Activity Logs Endpoint');
    console.log('Auth State:', authState);
    console.log('Headers:', headers);
    
    const url = `${API_CONFIG.BASE_URL}/admin/activity-logs?page=1&limit=10`;
    console.log('Request URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    const responseText = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Text:', responseText);

    return {
      success: response.ok,
      status: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      authState,
      headers,
    };
  } catch (error) {
    console.error('Test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function testSystemAdminLogin(): Promise<{
  success: boolean;
  error?: string;
  token?: string;
}> {
  try {
    const url = `${API_CONFIG.BASE_URL}/auth/login`;
    
    const response = await fetch(url, {
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

    const responseData = await response.json();
    console.log('Login Response:', responseData);

    if (response.ok && responseData.access_token) {
      return {
        success: true,
        token: responseData.access_token,
      };
    } else {
      return {
        success: false,
        error: `Login failed: ${response.status} - ${JSON.stringify(responseData)}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}