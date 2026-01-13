'use client';

import { useState } from 'react';
import { getAuthDebugInfo, logAuthDebugInfo, testAuthentication } from '@/lib/debug/authDebug';

/**
 * Authentication Debug Panel
 * A debug component to help troubleshoot authentication issues
 * Add this to any page to debug auth problems
 */
export default function AuthDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestSystemSettings = async () => {
    setIsLoading(true);
    try {
      const result = await testAuthentication();
      setTestResults({ endpoint: '/admin/system-settings', ...result });
    } catch (error) {
      setTestResults({ 
        endpoint: '/admin/system-settings', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestActivityLogs = async () => {
    setIsLoading(true);
    try {
      const result = await testAuthentication();
      setTestResults({ endpoint: '/admin/activity-logs', ...result });
    } catch (error) {
      setTestResults({ 
        endpoint: '/admin/activity-logs', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAuth = () => {
    // Simple refresh by reloading auth info
    setTestResults(null);
  };

  const authInfo = getAuthDebugInfo();
  const isAuthenticated = authInfo.authManager.isAuthenticated;
  const hasToken = authInfo.authManager.hasToken;
  const tokenLength = authInfo.authManager.tokenLength;
  const userEmail = authInfo.authManager.user?.email;
  const userRole = authInfo.authManager.user?.role;

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
        >
          🔍 Auth Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Auth Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Authentication Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Authentication Status</h4>
        <div className="text-sm space-y-1">
          <div className={`flex items-center gap-2 ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
            <span>{isAuthenticated ? '✅' : '❌'}</span>
            <span>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</span>
          </div>
          <div className={`flex items-center gap-2 ${hasToken ? 'text-green-600' : 'text-red-600'}`}>
            <span>{hasToken ? '✅' : '❌'}</span>
            <span>Has Token: {hasToken ? 'Yes' : 'No'}</span>
          </div>
          {hasToken && (
            <div className="text-gray-600">
              <span>Token Length: {tokenLength}</span>
            </div>
          )}
          {userEmail && (
            <div className="text-gray-600">
              <span>User: {userEmail} ({userRole})</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mb-4 space-y-2">
        <button
          onClick={() => logAuthDebugInfo()}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
        >
          📋 Log Auth Info to Console
        </button>
        <button
          onClick={handleRefreshAuth}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
        >
          🔄 Refresh Auth State
        </button>
      </div>

      {/* Endpoint Tests */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Test Endpoints</h4>
        <div className="space-y-2">
          <button
            onClick={handleTestSystemSettings}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm"
          >
            {isLoading ? '⏳' : '🧪'} Test System Settings
          </button>
          <button
            onClick={handleTestActivityLogs}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm"
          >
            {isLoading ? '⏳' : '🧪'} Test Activity Logs
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Test Results</h4>
          <div className="text-sm space-y-1">
            <div>Endpoint: {testResults.endpoint}</div>
            <div className={`flex items-center gap-2 ${testResults.success ? 'text-green-600' : 'text-red-600'}`}>
              <span>{testResults.success ? '✅' : '❌'}</span>
              <span>Status: {testResults.status}</span>
            </div>
            {testResults.error && (
              <div className="text-red-600 text-xs">
                Error: {testResults.error}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        💡 Check browser console for detailed logs
      </div>
    </div>
  );
}