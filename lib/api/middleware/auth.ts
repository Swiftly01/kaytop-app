/**
 * Authentication Middleware for API Routes
 * Validates JWT tokens and role-based access control
 */

import { NextRequest } from 'next/server';
import { UserRole } from '@/lib/utils/roleUtils';

interface AuthResult {
  success: boolean;
  message?: string;
  status?: number;
  user?: {
    id: string;
    role: UserRole;
    email?: string;
  };
  token?: string;
}

/**
 * Parse JWT token payload without verification (for role extraction)
 * Note: This is only for role extraction, actual verification should be done server-side
 */
function parseJWTPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Extract user role from token
 */
function extractUserRole(token: string): UserRole | null {
  const payload = parseJWTPayload(token);
  if (!payload) return null;
  
  // Check if role exists in payload and is valid
  const role = payload.role;
  if (role && Object.values(UserRole).includes(role)) {
    return role as UserRole;
  }
  
  return null;
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const payload = parseJWTPayload(token);
  if (!payload) {
    return true;
  }
  
  if (!payload.exp) {
    return false; // If no expiration, consider it valid
  }
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Validate authentication and role-based access
 */
export async function validateAuth(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthResult & { token?: string }> {
  try {
    // Get token from Authorization header or cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Try to get from cookies as fallback
      token = request.cookies.get('auth-token')?.value;
    }

    if (!token) {
      return {
        success: false,
        message: 'No authentication token provided',
        status: 401
      };
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      return {
        success: false,
        message: 'Authentication token has expired',
        status: 401
      };
    }

    // Extract user role from token
    const userRole = extractUserRole(token);
    if (!userRole) {
      return {
        success: false,
        message: 'Invalid authentication token - no role found',
        status: 401
      };
    }

    // Check if user role is allowed for this endpoint
    if (!allowedRoles.includes(userRole)) {
      return {
        success: false,
        message: `Insufficient permissions. Required: ${allowedRoles.join(', ')}, Found: ${userRole}`,
        status: 403
      };
    }

    // Extract user information from token
    const payload = parseJWTPayload(token);
    const user = {
      id: payload.sub || payload.userId || payload.id || 'unknown',
      role: userRole,
      email: payload.email
    };

    return {
      success: true,
      user,
      token
    };

  } catch (error) {
    console.error('Auth validation error:', error);
    return {
      success: false,
      message: 'Authentication validation failed',
      status: 500
    };
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  // Define role-based permissions
  const rolePermissions: Record<UserRole, string[]> = {
    [UserRole.SYSTEM_ADMIN]: [
      'view_all',
      'manage_all',
      'create_users',
      'delete_users',
      'system_settings'
    ],
    [UserRole.BRANCH_MANAGER]: [
      'view_branches',
      'manage_branches',
      'view_customers',
      'manage_customers',
      'view_loans',
      'approve_loans',
      'view_reports',
      'manage_staff'
    ],
    [UserRole.ACCOUNT_MANAGER]: [
      'view_customers',
      'manage_customer_assignments',
      'view_loans',
      'view_branches',
      'approve_reports',
      'view_branch_performance',
      'manage_credit_officers'
    ],
    [UserRole.HQ_MANAGER]: [
      'view_customers',
      'manage_customer_assignments',
      'view_loans',
      'view_branches',
      'approve_reports',
      'view_branch_performance',
      'manage_credit_officers'
    ],
    [UserRole.CREDIT_OFFICER]: [
      'view_customers',
      'manage_assigned_customers',
      'create_loans',
      'view_loans',
      'submit_reports'
    ],
    [UserRole.CUSTOMER]: [
      'view_profile',
      'view_loans',
      'view_savings',
      'make_payments'
    ]
  };

  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission) || permissions.includes('view_all') || permissions.includes('manage_all');
}