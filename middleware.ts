import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings'
];

// Role-based dashboard routes (integrated from proxy.ts)
const ROLE_DASHBOARD_ROUTES: Record<string, string> = {
  BRANCH_MANAGER: '/dashboard/bm',
  ADMIN: '/dashboard/system-admin',
  ACCOUNT_MANAGER: '/dashboard/am',
  USER: '/dashboard/bm', // Default fallback
};

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
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
    
    if (!payload.exp) {
      return false; // If no expiration, consider it valid
    }
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

/**
 * Check if path requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if path is an auth route
 */
function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/auth/');
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
  const role = request.cookies.get('role')?.value;

  // Debug logging
  console.log('🔍 Middleware Debug - Path:', pathname);
  console.log('🔍 Middleware Debug - Token exists:', !!token);
  console.log('🔍 Middleware Debug - Role from cookie:', role);

  // Handle authentication logic
  const tokenExpired = token ? isTokenExpired(token) : true;
  const isAuthenticated = !!(token && !tokenExpired);
  const needsAuth = requiresAuth(pathname);
  const isAuthPath = isAuthRoute(pathname);

  console.log('🔍 Middleware Debug - Is Authenticated:', isAuthenticated);
  console.log('🔍 Middleware Debug - Needs Auth:', needsAuth);
  console.log('🔍 Middleware Debug - Is Auth Path:', isAuthPath);

  // If user is authenticated and trying to access auth pages, redirect to appropriate dashboard
  if (isAuthenticated && isAuthPath && role) {
    const targetDashboard = ROLE_DASHBOARD_ROUTES[role.toUpperCase()] || '/dashboard/bm';
    console.log(`🔄 Authenticated ${role} user accessing auth page, redirecting to ${targetDashboard}`);
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // If route requires auth but user is not authenticated
  if (needsAuth && !isAuthenticated) {
    // Store intended destination for post-login redirect
    const loginUrl = new URL('/auth/bm/login', request.url);
    if (pathname !== '/auth/bm/login') {
      loginUrl.searchParams.set('returnUrl', pathname);
    }
    console.log('🔒 Unauthenticated user accessing protected route, redirecting to login');
    return NextResponse.redirect(loginUrl);
  }

  // Handle role-based dashboard routing (integrated from proxy.ts)
  if (isAuthenticated && token && role && pathname.startsWith('/dashboard')) {
    const targetDashboard = ROLE_DASHBOARD_ROUTES[role.toUpperCase()];
    
    console.log('🎯 Role-based routing check:', {
      role,
      upperRole: role.toUpperCase(),
      targetDashboard,
      currentPath: pathname,
      shouldRedirect: targetDashboard && !pathname.startsWith(targetDashboard)
    });
    
    if (targetDashboard && !pathname.startsWith(targetDashboard)) {
      console.log(`🎯 Role-based redirect: ${role} -> ${targetDashboard}`);
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  }

  // Handle root path redirect for authenticated users
  if (pathname === '/' && isAuthenticated && role) {
    const targetDashboard = ROLE_DASHBOARD_ROUTES[role.toUpperCase()] || '/dashboard/bm';
    console.log(`🏠 Root path access, redirecting ${role} to ${targetDashboard}`);
    return NextResponse.redirect(new URL(targetDashboard, request.url));
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