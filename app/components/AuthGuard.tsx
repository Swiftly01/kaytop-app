/**
 * Authentication Guard Component
 * Protects routes and redirects unauthenticated users
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../_components/ui/LoadingSpinner';
import { UserRole, validateRoleAccess, getDefaultDashboard } from '../../lib/utils/roleUtils';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

export default function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
  allowedRoles = [],
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, canAccessRoute, getDefaultRoute } = useAuth();
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

    if (requireAuth && isAuthenticated && user) {
      const userRole = user.role as UserRole;
      
      // Check role-based access using utility functions
      if (allowedRoles.length > 0) {
        // Check if user has one of the allowed roles
        if (!allowedRoles.includes(userRole)) {
          // Redirect to user's default dashboard
          const defaultDashboard = getDefaultDashboard(userRole);
          if (pathname !== defaultDashboard) {
            router.push(defaultDashboard);
          }
          return;
        }
      } else {
        // Use general route validation if no specific roles provided
        if (!canAccessRoute(pathname)) {
          // Redirect to user's default dashboard
          const defaultDashboard = getDefaultRoute();
          if (pathname !== defaultDashboard) {
            router.push(defaultDashboard);
          }
          return;
        }
      }
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && pathname.startsWith('/auth/') && user) {
      const defaultDashboard = getDefaultRoute();
      if (pathname !== defaultDashboard) {
        router.push(defaultDashboard);
      }
      return;
    }
  }, [isAuthenticated, isLoading, user, requireAuth, allowedRoles, router, pathname, redirectTo, canAccessRoute, getDefaultRoute]);

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
  if (requireAuth && isAuthenticated && user) {
    const userRole = user.role as UserRole;
    
    if (allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRole)) {
        return null;
      }
    } else {
      // Use general route validation if no specific roles provided
      if (!canAccessRoute(pathname)) {
        return null;
      }
    }
  }

  return <>{children}</>;
}

// Specific guards for different user types
export function SystemAdminGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={[UserRole.SYSTEM_ADMIN]}>
      {children}
    </AuthGuard>
  );
}

export function BranchManagerGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER]}>
      {children}
    </AuthGuard>
  );
}

export function AccountManagerGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER, UserRole.ACCOUNT_MANAGER, UserRole.HQ_MANAGER]}>
      {children}
    </AuthGuard>
  );
}

export function CreditOfficerGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER, UserRole.ACCOUNT_MANAGER, UserRole.CREDIT_OFFICER]}>
      {children}
    </AuthGuard>
  );
}

export function CustomerGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={[UserRole.CUSTOMER]}>
      {children}
    </AuthGuard>
  );
}