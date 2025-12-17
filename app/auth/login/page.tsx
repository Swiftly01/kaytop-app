'use client';

import { Suspense } from 'react';
import UnifiedLoginForm from '@/app/_components/ui/auth/UnifiedLoginForm';
import Logo from '@/app/_components/ui/Logo';
import { LoadingSpinner } from '@/app/_components/ui/LoadingSpinner';

export default function UnifiedLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>
        
        {/* Page Title */}
        <h2 
          id="unified-login-heading"
          className="mt-6 text-center text-3xl font-extrabold text-gray-900"
        >
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your dashboard with your credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<LoadingSpinner />}>
            <UnifiedLoginForm />
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © 2024 Your Company. All rights reserved.
        </p>
      </div>
    </div>
  );
}