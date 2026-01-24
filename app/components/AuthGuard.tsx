/**
 * Authentication Guards
 * Components to protect routes based on user roles and authentication status
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  fallbackPath?: string;
}

/**
 * Base AuthGuard component
 */
export function AuthGuard({ 
  children, 
  requiredRole, 
  requiredRoles, 
  fallbackPath = '/auth/login' 
}: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { session, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth context to finish loading
    if (authLoading) return;

    const checkAuth = () => {
      if (!session) {
        router.push(fallbackPath);
        return;
      }

      // Check role requirements
      if (requiredRole && session.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }

      if (requiredRoles && !requiredRoles.includes(session.role)) {
        router.push('/unauthorized');
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, requiredRole, requiredRoles, fallbackPath, session, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F56D9]"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

/**
 * System Admin Guard
 */
export function SystemAdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="system_admin" fallbackPath="/auth/login">
      {children}
    </AuthGuard>
  );
}

/**
 * Branch Manager Guard
 */
export function BranchManagerGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="branch_manager" fallbackPath="/auth/bm/login">
      {children}
    </AuthGuard>
  );
}

/**
 * Account Manager Guard
 */
export function AccountManagerGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={["account_manager", "hq_manager"]} fallbackPath="/auth/login">
      {children}
    </AuthGuard>
  );
}

/**
 * Credit Officer Guard
 */
export function CreditOfficerGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="credit_officer" fallbackPath="/auth/co/login">
      {children}
    </AuthGuard>
  );
}

/**
 * Staff Guard (any staff role)
 */
export function StaffGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard 
      requiredRoles={['system_admin', 'branch_manager', 'account_manager', 'hq_manager', 'credit_officer']}
      fallbackPath="/auth/login"
    >
      {children}
    </AuthGuard>
  );
}

/**
 * Customer Guard
 */
export function CustomerGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="customer" fallbackPath="/auth/customer/login">
      {children}
    </AuthGuard>
  );
}
