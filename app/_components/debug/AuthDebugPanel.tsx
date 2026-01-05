'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function AuthDebugPanel() {
  const { user, token } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg hover:bg-blue-700"
      >
        🔍 Auth Debug
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Auth Debug Info</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-gray-700">User:</strong>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                {user ? JSON.stringify(user, null, 2) : 'null'}
              </pre>
            </div>
            
            <div>
              <strong className="text-gray-700">Token:</strong>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs break-all">
                {token ? `${token.substring(0, 50)}...` : 'null'}
              </div>
            </div>
            
            <div>
              <strong className="text-gray-700">Cookies:</strong>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                {typeof document !== 'undefined' ? document.cookie : 'N/A'}
              </pre>
            </div>
            
            <div>
              <strong className="text-gray-700">LocalStorage:</strong>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                {typeof localStorage !== 'undefined' ? JSON.stringify({
                  'auth-token': localStorage.getItem('auth-token') ? 'exists' : 'null',
                  'auth-user': localStorage.getItem('auth-user') ? JSON.parse(localStorage.getItem('auth-user') || '{}') : 'null'
                }, null, 2) : 'N/A'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}