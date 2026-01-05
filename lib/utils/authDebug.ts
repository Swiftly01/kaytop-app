/**
 * Authentication Debug Utilities
 * Helper functions for debugging authentication and role detection issues
 */

import { UserRole } from './roleUtils';

export interface AuthAttemptLog {
  timestamp: string;
  email: string;
  backendResponse: any;
  detectedRole: UserRole | null;
  redirectUrl: string;
  errors: string[];
}

// Store auth attempts in memory for debugging (only in development)
const authAttempts: AuthAttemptLog[] = [];

/**
 * Log authentication attempt for debugging
 */
export function logAuthAttempt(
  email: string,
  backendResponse: any,
  detectedRole: UserRole | null,
  redirectUrl: string,
  errors: string[] = []
): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const attempt: AuthAttemptLog = {
    timestamp: new Date().toISOString(),
    email,
    backendResponse: JSON.parse(JSON.stringify(backendResponse)), // Deep clone
    detectedRole,
    redirectUrl,
    errors
  };

  authAttempts.push(attempt);
  
  // Keep only last 10 attempts
  if (authAttempts.length > 10) {
    authAttempts.shift();
  }

  console.log('🔍 Auth Attempt Logged:', attempt);
}

/**
 * Get all authentication attempts for debugging
 */
export function getAuthAttempts(): AuthAttemptLog[] {
  return [...authAttempts];
}

/**
 * Clear authentication attempt logs
 */
export function clearAuthAttempts(): void {
  authAttempts.length = 0;
}

/**
 * Analyze backend response structure for debugging
 */
export function analyzeBackendResponse(response: any): {
  structure: string;
  hasToken: boolean;
  hasRole: boolean;
  hasUser: boolean;
  tokenLocation: string | null;
  roleLocation: string | null;
  possibleRoles: string[];
} {
  const analysis = {
    structure: 'unknown',
    hasToken: false,
    hasRole: false,
    hasUser: false,
    tokenLocation: null as string | null,
    roleLocation: null as string | null,
    possibleRoles: [] as string[]
  };

  if (!response || typeof response !== 'object') {
    return analysis;
  }

  // Determine structure
  if (response.success && response.data) {
    analysis.structure = 'wrapped';
  } else if (response.access_token || response.token) {
    analysis.structure = 'direct';
  } else {
    analysis.structure = 'custom';
  }

  // Check for token
  if (response.access_token) {
    analysis.hasToken = true;
    analysis.tokenLocation = 'root.access_token';
  } else if (response.token) {
    analysis.hasToken = true;
    analysis.tokenLocation = 'root.token';
  } else if (response.data?.access_token) {
    analysis.hasToken = true;
    analysis.tokenLocation = 'data.access_token';
  } else if (response.data?.token) {
    analysis.hasToken = true;
    analysis.tokenLocation = 'data.token';
  }

  // Check for role
  if (response.role) {
    analysis.hasRole = true;
    analysis.roleLocation = 'root.role';
    analysis.possibleRoles.push(response.role);
  } else if (response.user?.role) {
    analysis.hasRole = true;
    analysis.roleLocation = 'user.role';
    analysis.possibleRoles.push(response.user.role);
  } else if (response.data?.role) {
    analysis.hasRole = true;
    analysis.roleLocation = 'data.role';
    analysis.possibleRoles.push(response.data.role);
  } else if (response.data?.user?.role) {
    analysis.hasRole = true;
    analysis.roleLocation = 'data.user.role';
    analysis.possibleRoles.push(response.data.user.role);
  }

  // Check for user object
  analysis.hasUser = !!(response.user || response.data?.user);

  return analysis;
}

/**
 * Generate debug report for authentication issues
 */
export function generateAuthDebugReport(): string {
  const attempts = getAuthAttempts();
  
  if (attempts.length === 0) {
    return 'No authentication attempts logged.';
  }

  let report = '🔍 AUTHENTICATION DEBUG REPORT\n';
  report += '=====================================\n\n';

  attempts.forEach((attempt, index) => {
    report += `Attempt ${index + 1} (${attempt.timestamp}):\n`;
    report += `  Email: ${attempt.email}\n`;
    report += `  Detected Role: ${attempt.detectedRole || 'FAILED'}\n`;
    report += `  Redirect URL: ${attempt.redirectUrl}\n`;
    
    if (attempt.errors.length > 0) {
      report += `  Errors: ${attempt.errors.join(', ')}\n`;
    }

    const analysis = analyzeBackendResponse(attempt.backendResponse);
    report += `  Backend Response Analysis:\n`;
    report += `    Structure: ${analysis.structure}\n`;
    report += `    Has Token: ${analysis.hasToken} (${analysis.tokenLocation || 'N/A'})\n`;
    report += `    Has Role: ${analysis.hasRole} (${analysis.roleLocation || 'N/A'})\n`;
    report += `    Has User: ${analysis.hasUser}\n`;
    report += `    Possible Roles: ${analysis.possibleRoles.join(', ') || 'None found'}\n`;
    
    report += '\n';
  });

  return report;
}

/**
 * Export debug data as downloadable file
 */
export function exportAuthDebugData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const report = generateAuthDebugReport();
  const attempts = getAuthAttempts();
  
  const debugData = {
    report,
    attempts,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  const blob = new Blob([JSON.stringify(debugData, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auth-debug-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}