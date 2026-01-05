'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-600 mb-6">
            Customer Dashboard - Coming Soon
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">My Loans</h3>
              <p className="text-blue-700 text-sm">View and manage your loans</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">My Savings</h3>
              <p className="text-green-700 text-sm">Track your savings account</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Transactions</h3>
              <p className="text-purple-700 text-sm">View transaction history</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Notice</h3>
            <p className="text-yellow-800 text-sm">
              The customer dashboard is currently under development. Please contact your branch for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}