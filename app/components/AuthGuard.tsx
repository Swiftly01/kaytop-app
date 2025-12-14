/**
 * Authentication Guard Component
 * Protects routes and redirects unauthenticated users
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../_components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export default function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/auth/system-admin/login',
  allowedRoles = [],
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to be determined

    if (requireAuth && !isAuthenticated) {
      // Store the attempted URL for redirect after login
      const returnUrl = encodeURIComponent(pathname);
      const targetUrl = `${redirectTo}?returnUrl=${returnUrl}`;
      
      // Prevent redirect loop by checking if we're already on the target page
      if (pathname !== redirectTo && !pathname.startsWith('/auth/')) {
        router.push(targetUrl);
      }
      return;
    }

    if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
      // Check if user has required role
      if (user && !allowedRoles.includes(user.role)) {
        // Redirect to unauthorized page or dashboard
        if (pathname !== '/dashboard/system-admin') {
          router.push('/dashboard/system-admin');
        }
        return;
      }
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && pathname.startsWith('/auth/') && pathname !== '/dashboard/system-admin') {
      router.push('/dashboard/system-admin');
      return;
    }
  }, [isAuthenticated, isLoading, user, requireAuth, allowedRoles, router, pathname, redirectTo]);

  // Show loading spinner while determining auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render if user doesn't have required role
  if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
    if (user && !allowedRoles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}

// Specific guards for different user types
export function SystemAdminGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['system_admin']}>
      {children}
    </AuthGuard>
  );
}

export function BranchManagerGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['system_admin', 'branch_manager']}>
      {children}
    </AuthGuard>
  );
}

export function CreditOfficerGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['system_admin', 'branch_manager', 'credit_officer']}>
      {children}
    </AuthGuard>
  );
}