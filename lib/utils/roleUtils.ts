/**
 * Role Detection and Routing Utilities
 * Handles user role detection, route mapping, and access control
 */

import type { AdminProfile } from '../api/types';

// User role enumeration
export enum UserRole {
  SYSTEM_ADMIN = 'system_admin',
  BRANCH_MANAGER = 'branch_manager',
  ACCOUNT_MANAGER = 'account_manager',
  HQ_MANAGER = 'hq_manager', // Backend uses this instead of account_manager
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
  [UserRole.ACCOUNT_MANAGER]: '/dashboard/am',
  [UserRole.HQ_MANAGER]: '/dashboard/am', // HQ Manager uses AM dashboard
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
  
  // Account Manager routes
  {
    path: '/dashboard/am',
    allowedRoles: [UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER, UserRole.ACCOUNT_MANAGER, UserRole.HQ_MANAGER],
    isDefault: true,
    requiresAuth: true
  },
  
  // Credit Officer routes
  {
    path: '/dashboard/credit-officer',
    allowedRoles: [UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER, UserRole.ACCOUNT_MANAGER, UserRole.HQ_MANAGER, UserRole.CREDIT_OFFICER],
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
    allowedRoles: [UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER, UserRole.ACCOUNT_MANAGER, UserRole.HQ_MANAGER, UserRole.CREDIT_OFFICER, UserRole.CUSTOMER],
    isDefault: false,
    requiresAuth: true
  },
  
  {
    path: '/settings',
    allowedRoles: [UserRole.SYSTEM_ADMIN, UserRole.BRANCH_MANAGER, UserRole.ACCOUNT_MANAGER, UserRole.HQ_MANAGER],
    isDefault: false,
    requiresAuth: true
  }
];

/**
 * Debug function to analyze authentication response structure
 */
export function debugAuthResponse(authResponse: any): void {
  console.log('🔍 === AUTH RESPONSE DEBUG ===');
  console.log('📊 Response structure:', {
    type: typeof authResponse,
    isArray: Array.isArray(authResponse),
    keys: Object.keys(authResponse),
    hasRole: 'role' in authResponse,
    hasUser: 'user' in authResponse,
    hasData: 'data' in authResponse,
    hasToken: 'token' in authResponse || 'access_token' in authResponse
  });
  
  if (authResponse.role) {
    console.log('📋 Direct role:', authResponse.role, 'Valid:', Object.values(UserRole).includes(authResponse.role));
  }
  
  if (authResponse.user) {
    console.log('👤 User object:', {
      keys: Object.keys(authResponse.user),
      role: authResponse.user.role,
      roleValid: authResponse.user.role ? Object.values(UserRole).includes(authResponse.user.role) : false
    });
  }
  
  if (authResponse.data) {
    console.log('📦 Data object:', {
      keys: Object.keys(authResponse.data),
      role: authResponse.data.role,
      roleValid: authResponse.data.role ? Object.values(UserRole).includes(authResponse.data.role) : false
    });
  }
  
  console.log('🎯 Available roles:', Object.values(UserRole));
  console.log('🔍 === END DEBUG ===');
}
export function detectUserRole(authResponse: any, credentials?: { email: string }): UserRole {
  console.log('🔍 Detecting user role from auth response');
  
  // Debug the response structure
  debugAuthResponse(authResponse);
  
  // Check if role is directly provided in response
  if (authResponse.role && Object.values(UserRole).includes(authResponse.role)) {
    console.log('✅ Role found directly in response:', authResponse.role);
    return authResponse.role as UserRole;
  }
  
  // Check if user object has role
  if (authResponse.user?.role && Object.values(UserRole).includes(authResponse.user.role)) {
    console.log('✅ Role found in user object:', authResponse.user.role);
    return authResponse.user.role as UserRole;
  }
  
  // Handle backend role mapping - PRIORITIZE HQ_MANAGER detection
  let backendRole = authResponse.role || authResponse.user?.role;
  
  // Get email from various sources
  const email = credentials?.email || authResponse.email || authResponse.user?.email;
  
  // CRITICAL: Handle HQ Manager with generic "user" role based on email
  if (backendRole === 'user' && email) {
    console.log('🔍 Generic "user" role detected, checking email for specific role mapping:', email);
    
    // Explicit HQ Manager email detection
    if (email === 'hqmanager@kaytop.com' || email.toLowerCase().includes('hqmanager')) {
      console.log('✅ HQ Manager detected via email pattern - mapping user → hq_manager');
      return UserRole.HQ_MANAGER;
    }
    
    // Other email-based role inference for "user" role
    const emailInferredRole = inferRoleFromEmail(email);
    if (emailInferredRole) {
      console.log('✅ Role inferred from email for generic "user" role:', emailInferredRole);
      return emailInferredRole;
    }
    
    // Default generic "user" to customer
    console.log('✅ Converting generic "user" role to customer (default)');
    return UserRole.CUSTOMER;
  }
  
  // Direct role checks
  if (backendRole === 'hq_manager' || backendRole === 'hqmanager' || 
      backendRole === 'headquarters_manager' || backendRole === 'headquartersmanager') {
    console.log('✅ Direct HQ Manager role detected:', backendRole);
    return UserRole.HQ_MANAGER;
  }
  
  // Handle branch_manager as HQ_MANAGER for AM dashboard access
  if (backendRole === 'branch_manager' || backendRole === 'branchmanager') {
    console.log('✅ Converting branch_manager to hq_manager for AM dashboard access');
    return UserRole.HQ_MANAGER;
  }
  
  // Handle "admin" role from backend - map to system_admin
  if (backendRole === 'admin') {
    console.log('✅ Converting generic "admin" role to system_admin');
    return UserRole.SYSTEM_ADMIN;
  }
  
  // Handle specific backend roles that might not match our enum exactly
  if (backendRole) {
    // Map common backend role variations
    const roleMapping: Record<string, UserRole> = {
      'system_admin': UserRole.SYSTEM_ADMIN,
      'systemadmin': UserRole.SYSTEM_ADMIN,
      'admin': UserRole.SYSTEM_ADMIN,
      'branch_manager': UserRole.HQ_MANAGER, // Map branch_manager to HQ_MANAGER for AM dashboard access
      'branchmanager': UserRole.HQ_MANAGER,
      'manager': UserRole.HQ_MANAGER, // Generic manager -> HQ_MANAGER
      'account_manager': UserRole.ACCOUNT_MANAGER,
      'accountmanager': UserRole.ACCOUNT_MANAGER,
      'hq_manager': UserRole.HQ_MANAGER,
      'hqmanager': UserRole.HQ_MANAGER,
      'headquarters_manager': UserRole.HQ_MANAGER,
      'headquartersmanager': UserRole.HQ_MANAGER,
      'credit_officer': UserRole.CREDIT_OFFICER,
      'creditofficer': UserRole.CREDIT_OFFICER,
      'officer': UserRole.CREDIT_OFFICER,
      'customer': UserRole.CUSTOMER,
      'user': UserRole.CUSTOMER,
      'client': UserRole.CUSTOMER
    };
    
    const normalizedRole = backendRole.toLowerCase().replace(/[-_\s]/g, '');
    const mappedRole = roleMapping[normalizedRole] || roleMapping[backendRole.toLowerCase()];
    
    if (mappedRole) {
      console.log('✅ Role mapped from backend:', backendRole, '->', mappedRole);
      return mappedRole;
    }
    
    // Additional check for HQ Manager variations
    if (backendRole.toLowerCase().includes('hq') || 
        backendRole.toLowerCase().includes('headquarters') ||
        (backendRole.toLowerCase().includes('manager') && !backendRole.toLowerCase().includes('account'))) {
      console.log('✅ Role inferred as HQ_MANAGER from pattern:', backendRole);
      return UserRole.HQ_MANAGER;
    }
  }
  
  // Check for role in token payload (if available)
  if (authResponse.token || authResponse.access_token) {
    const token = authResponse.token || authResponse.access_token;
    const role = extractRoleFromToken(token);
    if (role) {
      console.log('✅ Role found in token:', role);
      return role;
    }
  }
  
  // Additional checks for different response formats
  if (authResponse.data?.role && Object.values(UserRole).includes(authResponse.data.role)) {
    console.log('✅ Role found in data object:', authResponse.data.role);
    return authResponse.data.role as UserRole;
  }
  
  // Check if the response itself contains user data at root level
  if (authResponse.firstName || authResponse.lastName || authResponse.email) {
    // This might be a user object at root level, check for role
    const roleFromRoot = authResponse.role;
    if (roleFromRoot && Object.values(UserRole).includes(roleFromRoot)) {
      console.log('✅ Role found at root level:', roleFromRoot);
      return roleFromRoot as UserRole;
    }
  }
  
  // Try to infer role from email patterns as a fallback
  if (email) {
    const inferredRole = inferRoleFromEmail(email);
    if (inferredRole) {
      console.log('✅ Role inferred from email pattern:', inferredRole);
      return inferredRole;
    }
  }
  
  // Log detailed error information for debugging
  console.error('❌ Unable to detect user role from auth response. Response structure:', {
    hasRole: !!authResponse.role,
    hasUserRole: !!authResponse.user?.role,
    hasToken: !!(authResponse.token || authResponse.access_token),
    responseKeys: Object.keys(authResponse),
    actualRole: authResponse.role || authResponse.user?.role,
    userKeys: authResponse.user ? Object.keys(authResponse.user) : [],
    email: email,
    hasData: !!authResponse.data,
    dataKeys: authResponse.data ? Object.keys(authResponse.data) : []
  });
  
  // Emergency fallback: If we have any indication this might be a manager/admin, default to HQ_MANAGER
  if (backendRole && (
    backendRole.toLowerCase().includes('manager') ||
    backendRole.toLowerCase().includes('admin') ||
    backendRole.toLowerCase().includes('hq') ||
    backendRole.toLowerCase().includes('branch')
  )) {
    console.log('🔧 Emergency fallback: treating as HQ_MANAGER based on role pattern:', backendRole);
    return UserRole.HQ_MANAGER;
  }
  
  // Instead of defaulting to customer, throw an error to force proper handling
  throw new Error(`Unable to detect user role from authentication response. Received role: ${authResponse.role || authResponse.user?.role || 'undefined'}. Please ensure the backend is returning a valid role.`);
}

/**
 * Infer user role from email domain or patterns
 */
export function inferRoleFromEmail(email: string): UserRole | null {
  const emailLower = email.toLowerCase();
  
  // CRITICAL: HQ Manager patterns (prioritize over other patterns)
  if (emailLower.includes('hq') || emailLower.includes('headquarters') || 
      emailLower === 'hqmanager@kaytop.com' || emailLower.includes('hqmanager')) {
    return UserRole.HQ_MANAGER;
  }
  
  // Admin email patterns
  if (emailLower.includes('admin') || emailLower.includes('system')) {
    return UserRole.SYSTEM_ADMIN;
  }
  
  // Manager email patterns (default to HQ_MANAGER for AM dashboard access)
  if (emailLower.includes('manager') || emailLower.includes('branch')) {
    return UserRole.HQ_MANAGER;
  }
  
  // Account manager patterns
  if (emailLower.includes('account') || emailLower.includes('am@')) {
    return UserRole.ACCOUNT_MANAGER;
  }
  
  // Credit officer patterns
  if (emailLower.includes('credit') || emailLower.includes('officer') || emailLower.includes('co@')) {
    return UserRole.CREDIT_OFFICER;
  }
  
  // Default to null for regular email patterns (let caller decide)
  return null;
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
  const role = detectUserRole(authResponse, credentials);
  
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
    case UserRole.ACCOUNT_MANAGER:
      return 'Account';
    case UserRole.HQ_MANAGER:
      return 'HQ';
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
    case UserRole.ACCOUNT_MANAGER:
      return 'Manager';
    case UserRole.HQ_MANAGER:
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
    case UserRole.ACCOUNT_MANAGER:
      return 'Account Manager';
    case UserRole.HQ_MANAGER:
      return 'HQ Manager';
    case UserRole.CREDIT_OFFICER:
      return 'Credit Officer';
    case UserRole.CUSTOMER:
      return 'Customer';
    default:
      return 'User';
  }
}