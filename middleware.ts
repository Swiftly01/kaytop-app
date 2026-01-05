import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define user roles
enum UserRole {
  SYSTEM_ADMIN = 'system_admin',
  BRANCH_MANAGER = 'branch_manager',
  ACCOUNT_MANAGER = 'account_manager',
  HQ_MANAGER = 'hq_manager',
  CREDIT_OFFICER = 'credit_officer',
  CUSTOMER = 'customer'
}

// Route configuration for role-based access
interface RouteConfig {
  path: string;
  allowedRoles: UserRole[];
  isDefault: boolean;
  requiresAuth: boolean;
}

// Route mappings for different user roles
const ROUTE_MAPPINGS: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: '/dashboard/system-admin',
  [UserRole.BRANCH_MANAGER]: '/dashboard/bm',
  [UserRole.ACCOUNT_MANAGER]: '/dashboard/am',
  [UserRole.HQ_MANAGER]: '/dashboard/am',
  [UserRole.CREDIT_OFFICER]: '/dashboard/credit-officer',
  [UserRole.CUSTOMER]: '/dashboard/customer'
};

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings'
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth',
  '/',
  '/about',
  '/contact'
];

// Auth routes that should redirect if already authenticated
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/bm/login',
  '/auth/system-admin/login'
];

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
 * Extract user role from token with backend role mapping
 */
function extractUserRole(token: string): UserRole | null {
  const payload = parseJWTPayload(token);
  if (!payload) return null;
  
  // Get role from JWT payload
  const backendRole = payload.role;
  if (!backendRole) return null;
  
  // Handle backend role mapping - same logic as roleUtils.ts
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
    'user': UserRole.CUSTOMER, // Backend returns 'user' for various roles - this is the key mapping
    'client': UserRole.CUSTOMER
  };
  
  // First try direct mapping
  if (Object.values(UserRole).includes(backendRole as UserRole)) {
    return backendRole as UserRole;
  }
  
  // Then try role mapping
  const normalizedRole = backendRole.toLowerCase().replace(/[-_\s]/g, '');
  const mappedRole = roleMapping[normalizedRole] || roleMapping[backendRole.toLowerCase()];
  
  if (mappedRole) {
    return mappedRole;
  }
  
  // Special case: if backend returns 'user' and we can't determine the specific role,
  // we need additional context. For now, default to customer but this should be handled
  // by the auth service during login with proper role detection.
  if (backendRole.toLowerCase() === 'user') {
    return UserRole.CUSTOMER;
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
 * Check if path requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
}

/**
 * Check if path is an auth route
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname === route || pathname.startsWith('/auth/'));
}

/**
 * Get default dashboard for user role
 */
function getDefaultDashboard(role: UserRole): string {
  return ROUTE_MAPPINGS[role] || '/dashboard/system-admin';
}

/**
 * Check if user has permission to access route
 */
function hasRoutePermission(role: UserRole, pathname: string): boolean {
  // System admin can access all routes
  if (role === UserRole.SYSTEM_ADMIN) {
    return true;
  }
  
  // Branch manager can access system admin, BM, and AM routes
  if (role === UserRole.BRANCH_MANAGER) {
    return pathname.startsWith('/dashboard/system-admin') || 
           pathname.startsWith('/dashboard/bm') ||
           pathname.startsWith('/dashboard/am');
  }
  
  // Account manager and HQ manager can access AM and credit officer routes
  if (role === UserRole.ACCOUNT_MANAGER || role === UserRole.HQ_MANAGER) {
    return pathname.startsWith('/dashboard/am') ||
           pathname.startsWith('/dashboard/credit-officer');
  }
  
  // Credit officer can access their own routes
  if (role === UserRole.CREDIT_OFFICER) {
    return pathname.startsWith('/dashboard/credit-officer');
  }
  
  // Customer can only access customer routes
  if (role === UserRole.CUSTOMER) {
    return pathname.startsWith('/dashboard/customer');
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Get authentication data from cookies
  const token = request.cookies.get('token')?.value;
  const cookieRole = request.cookies.get('role')?.value as UserRole;

  // Handle authentication logic
  const tokenExpired = token ? isTokenExpired(token) : true;
  const isAuthenticated = !!(token && !tokenExpired && cookieRole);
  const needsAuth = requiresAuth(pathname);
  const isAuthPath = isAuthRoute(pathname);
  const isPublicPath = isPublicRoute(pathname);

  // Determine user role - prioritize cookie role over JWT parsing
  let userRole: UserRole | null = null;
  if (cookieRole && Object.values(UserRole).includes(cookieRole)) {
    userRole = cookieRole;
  } else if (token) {
    // Fallback to extracting from token if cookie role is missing/invalid
    userRole = extractUserRole(token);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && isAuthPath && userRole) {
    const dashboardUrl = getDefaultDashboard(userRole);
    console.log('🔄 Authenticated user accessing auth page, redirecting to:', dashboardUrl);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // If route requires auth but user is not authenticated
  if (needsAuth && !isAuthenticated) {
    // Store intended destination for post-login redirect
    const loginUrl = new URL('/auth/login', request.url);
    if (pathname !== '/auth/login') {
      loginUrl.searchParams.set('returnUrl', pathname);
    }
    console.log('🔒 Unauthenticated user accessing protected route, redirecting to login');
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and accessing protected route
  if (isAuthenticated && needsAuth && userRole) {
    // Check if user has permission for this route
    if (!hasRoutePermission(userRole, pathname)) {
      // Redirect to user's default dashboard
      const dashboardUrl = getDefaultDashboard(userRole);
      console.log('🚫 User lacks permission for route, redirecting to:', dashboardUrl, 'User role:', userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }

  // Handle root path redirect for authenticated users
  if (pathname === '/' && isAuthenticated && userRole) {
    const dashboardUrl = getDefaultDashboard(userRole);
    console.log('🏠 Root path access, redirecting to dashboard:', dashboardUrl);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};