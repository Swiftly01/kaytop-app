'use client';

import { useState } from 'react';
import { testActivityLogsEndpoint, testSystemAdminLogin } from '@/lib/debug/authTest';
import { getAuthDebugInfo, logAuthDebugInfo } from '@/lib/debug/authDebug';
import { authenticationManager } from '@/lib/api/authManager';
import { useAuth } from '@/app/context/AuthContext';

/**
 * Authentication Test Panel
 * Debug component to test authentication and fix synchronization issues
 */
export function AuthTestPanel() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { session, login } = useAuth();

  const runAuthDebug = () => {
    console.log('🔍 Running Authentication Debug...');
    logAuthDebugInfo();
    const debugInfo = getAuthDebugInfo();
    setTestResults({ type: 'debug', data: debugInfo });
  };

  const testActivityLogs = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Activity Logs Endpoint...');
      const result = await testActivityLogsEndpoint();
      setTestResults({ type: 'activityLogs', data: result });
    } catch (error) {
      setTestResults({ type: 'error', data: error });
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsSystemAdmin = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 Logging in as System Admin...');
      const result = await testSystemAdminLogin();
      
      if (result.success && result.token) {
        // Update both AuthContext and AuthenticationManager
        const userRole = 'system_admin';
        
        // Update AuthContext
        login(result.token, userRole);
        
        // Update AuthenticationManager
        authenticationManager.setAuth(
          {
            accessToken: result.token,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          },
          {
            role: userRole,
            email: 'admin@kaytop.com',
          }
        );
        
        console.log('✅ Login successful, authentication synchronized');
        setTestResults({ type: 'login', data: { ...result, synchronized: true } });
      } else {
        setTestResults({ type: 'login', data: result });
      }
    } catch (error) {
      setTestResults({ type: 'error', data: error });
    } finally {
      setIsLoading(false);
    }
  };

  const syncAuthentication = () => {
    console.log('🔄 Synchronizing Authentication...');
    
    if (session?.token && session?.role) {
      // Sync AuthContext to AuthenticationManager
      authenticationManager.setAuth(
        {
          accessToken: session.token,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        },
        {
          role: session.role,
          email: 'admin@kaytop.com', // Default for now
        }
      );
      
      console.log('✅ Authentication synchronized from AuthContext to AuthenticationManager');
      setTestResults({ type: 'sync', data: { success: true, session } });
    } else {
      console.log('❌ No session found in AuthContext');
      setTestResults({ type: 'sync', data: { success: false, message: 'No session found' } });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="text-lg font-semibold mb-3">🔍 Auth Debug Panel</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runAuthDebug}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Debug Auth State
        </button>
        
        <button
          onClick={loginAsSystemAdmin}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login as System Admin'}
        </button>
        
        <button
          onClick={syncAuthentication}
          className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
        >
          Sync Authentication
        </button>
        
        <button
          onClick={testActivityLogs}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Activity Logs'}
        </button>
      </div>

      <div className="text-xs text-gray-600 mb-2">
        <div>Session: {session ? '✅' : '❌'}</div>
        <div>Role: {session?.role || 'None'}</div>
      </div>

      {testResults && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs max-h-40 overflow-y-auto">
          <div className="font-semibold mb-1">Results ({testResults.type}):</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(testResults.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}