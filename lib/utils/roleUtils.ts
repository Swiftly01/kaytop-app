/**
 * Role Detection and Routing Utilities
 * Handles user role detection, route mapping, and access control
 */

import type { AdminProfile } from '../api/types';

// User role enumeration
export enum UserRole {
  SYSTEM_ADMIN = 'system_admin',
  BRANCH_MANAGER = 'branch_manager',
  CREDIT_OFFICER = 'credit_officer',
  CUSTOMER = 'customer'
}

// Route configuration interface
export interface RouteConfig {
  path: string;
  allowedRoles: UserRole[];
  isDefault: boolean;
  requiresAuth: boolean;
}

// Default dashboard routes for each role
export const ROLE_DASHBOARD_MAPPINGS: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: '/dashboard/system-admin',
  [UserRole.BRANCH_MANAGER]: '/dashboard/bm',
  [UserRole.CREDIT_OFFICER]: '/dashboard/credit-officer',
  [UserRole.CUSTOMER]: '/dashboard/customer'
};

// Route configurations for role-based access control
export const ROUTE_CONFIGURATIONS: RouteConfig[] = [
  // System Admin routes
  {
    path: '/dashboard/system-admin',
    allowedRoles: [UserRole.SYSTEM_ADMIN],
    isDefault: true,
    requiresAuth: true
  },
  
  // Branch Manager routes
  {
    path: '/dashboard/bm',
    allowedRoles: [UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER],
    isDefault: true,
    requiresAuth: true
  },
  
  // Credit Officer routes
  {
    path: '/dashboard/credit-officer',
    allowedRoles: [UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER, UserRole.CREDIT_OFFICER],
    isDefault: true,
    requiresAuth: true
  },
  
  // Customer routes
  {
    path: '/dashboard/customer',
    allowedRoles: [UserRole.CUSTOMER],
    isDefault: true,
    requiresAuth: true
  },
  
  // Shared routes
  {
    path: '/profile',
    allowedRoles: [UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER, UserRole.CREDIT_OFFICER, UserRole.CUSTOMER],
    isDefault: false,
    requiresAuth: true
  },
  
  {
    path: '/settings',
    allowedRoles: [UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER],
    isDefault: false,
    requiresAuth: true
  }
];

/**
 * Detect user role from authentication response
 */
export function detectUserRole(authResponse: any): UserRole {
  // Check if role is directly provided in response
  if (authResponse.role && Object.values(UserRole).includes(authResponse.role)) {
    return authResponse.role as UserRole;
  }
  
  // Check if user object has role
  if (authResponse.user?.role && Object.values(UserRole).includes(authResponse.user.role)) {
    return authResponse.user.role as UserRole;
  }
  
  // Check for role in token payload (if available)
  if (authResponse.token) {
    const role = extractRoleFromToken(authResponse.token);
    if (role) {
      return role;
    }
  }
  
  // Default fallback - this should not happen in normal operation
  console.warn('Unable to detect user role from auth response, defaulting to system_admin');
  return UserRole.SYSTEM_ADMIN;
}

/**
 * Extract role from JWT token payload
 */
export function extractRoleFromToken(token: string): UserRole | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    if (payload.role && Object.values(UserRole).includes(payload.role)) {
      return payload.role as UserRole;
    }
  } catch (error) {
    console.error('Error extracting role from token:', error);
  }
  
  return null;
}

/**
 * Get default dashboard route for a user role
 */
export function getDefaultDashboard(role: UserRole): string {
  return ROLE_DASHBOARD_MAPPINGS[role] || ROLE_DASHBOARD_MAPPINGS[UserRole.SYSTEM_ADMIN];
}

/**
 * Check if user role has access to a specific route
 */
export function validateRoleAccess(role: UserRole, path: string): boolean {
  // Find matching route configuration
  const routeConfig = ROUTE_CONFIGURATIONS.find(config => 
    path.startsWith(config.path)
  );
  
  if (!routeConfig) {
    // If no specific config found, allow access for system admin
    return role === UserRole.SYSTEM_ADMIN;
  }
  
  return routeConfig.allowedRoles.includes(role);
}

/**
 * Get appropriate redirect URL based on user role and intended destination
 */
export function getRedirectUrl(role: UserRole, intendedPath?: string): string {
  // If intended path is provided and user has access, redirect there
  if (intendedPath && validateRoleAccess(role, intendedPath)) {
    return intendedPath;
  }
  
  // Otherwise, redirect to default dashboard
  return getDefaultDashboard(role);
}

/**
 * Check if a route requires authentication
 */
export function requiresAuthentication(path: string): boolean {
  const routeConfig = ROUTE_CONFIGURATIONS.find(config => 
    path.startsWith(config.path)
  );
  
  return routeConfig?.requiresAuth ?? false;
}

/**
 * Get all allowed routes for a user role
 */
export function getAllowedRoutes(role: UserRole): string[] {
  return ROUTE_CONFIGURATIONS
    .filter(config => config.allowedRoles.includes(role))
    .map(config => config.path);
}

/**
 * Create user profile with detected role
 */
export function createUserProfile(
  authResponse: any, 
  credentials: { email: string }
): AdminProfile {
  const role = detectUserRole(authResponse);
  
  // If user data is provided in response, use it
  if (authResponse.user) {
    return {
      ...authResponse.user,
      role,
      email: credentials.email // Ensure email is set from credentials
    };
  }
  
  // Create basic user profile from available data
  return {
    id: authResponse.userId || 'user-' + Date.now(),
    firstName: authResponse.firstName || getDefaultFirstName(role),
    lastName: authResponse.lastName || getDefaultLastName(role),
    email: credentials.email,
    mobileNumber: authResponse.mobileNumber || '',
    role,
    branch: authResponse.branch,
    state: authResponse.state,
    verificationStatus: 'verified' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Get default first name based on role (for fallback)
 */
function getDefaultFirstName(role: UserRole): string {
  switch (role) {
    case UserRole.SYSTEM_ADMIN:
      return 'System';
    case UserRole.BRANCH_MANAGER:
      return 'Branch';
    case UserRole.CREDIT_OFFICER:
      return 'Credit';
    case UserRole.CUSTOMER:
      return 'Customer';
    default:
      return 'User';
  }
}

/**
 * Get default last name based on role (for fallback)
 */
function getDefaultLastName(role: UserRole): string {
  switch (role) {
    case UserRole.SYSTEM_ADMIN:
      return 'Administrator';
    case UserRole.BRANCH_MANAGER:
      return 'Manager';
    case UserRole.CREDIT_OFFICER:
      return 'Officer';
    case UserRole.CUSTOMER:
      return 'User';
    default:
      return 'User';
  }
}

/**
 * Validate user role enum value
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Get role display name for UI
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.SYSTEM_ADMIN:
      return 'System Administrator';
    case UserRole.BRANCH_MANAGER:
      return 'Branch Manager';
    case UserRole.CREDIT_OFFICER:
      return 'Credit Officer';
    case UserRole.CUSTOMER:
      return 'Customer';
    default:
      return 'User';
  }
}