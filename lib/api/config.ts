/**
 * API Configuration
 * Centralized configuration for API endpoints and settings with environment-based configuration
 */

// Environment-based configuration with fallbacks
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const API_CONFIG = {
  // Backend URL configuration
  BASE_URL: process.env.NEXT_PUBLIC_KAYTOP_API_BASE_URL || 'https://kaytop-production.up.railway.app',

  // Timeout configuration (configurable via environment)
  TIMEOUT: getEnvNumber('NEXT_PUBLIC_API_TIMEOUT', 30000), // 30 seconds default

  // Retry configuration (configurable via environment)
  RETRY_ATTEMPTS: getEnvNumber('NEXT_PUBLIC_API_RETRY_ATTEMPTS', 3),
  RETRY_DELAY: getEnvNumber('NEXT_PUBLIC_API_RETRY_DELAY', 1000), // 1 second default
  RETRY_MAX_DELAY: getEnvNumber('NEXT_PUBLIC_API_RETRY_MAX_DELAY', 10000), // 10 seconds default

  // Debug mode configuration
  DEBUG: getEnvBoolean('NEXT_PUBLIC_API_DEBUG', process.env.NODE_ENV === 'development'),

  // Logging configuration
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'
  LOG_API_CALLS: getEnvBoolean('NEXT_PUBLIC_LOG_API_CALLS', process.env.NODE_ENV === 'development'),

  // Error tracking configuration
  ENABLE_ERROR_TRACKING: getEnvBoolean('NEXT_PUBLIC_ENABLE_ERROR_TRACKING', process.env.NODE_ENV === 'production'),
  ERROR_TRACKING_ENDPOINT: process.env.NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT,

  // Rate limiting configuration
  RATE_LIMIT_ENABLED: getEnvBoolean('NEXT_PUBLIC_RATE_LIMIT_ENABLED', true),
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('NEXT_PUBLIC_RATE_LIMIT_MAX_REQUESTS', 100),
  RATE_LIMIT_WINDOW_MS: getEnvNumber('NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS', 60000), // 1 minute

  // Cache configuration
  CACHE_ENABLED: getEnvBoolean('NEXT_PUBLIC_CACHE_ENABLED', true),
  CACHE_TTL: getEnvNumber('NEXT_PUBLIC_CACHE_TTL', 300000), // 5 minutes default

  // Authentication configuration
  TOKEN_REFRESH_THRESHOLD: getEnvNumber('NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD', 300000), // 5 minutes before expiry
  AUTO_LOGOUT_ON_TOKEN_EXPIRE: getEnvBoolean('NEXT_PUBLIC_AUTO_LOGOUT_ON_TOKEN_EXPIRE', true),
} as const;

/**
 * Configuration validation
 * Validates that all required configuration is properly set
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateConfiguration(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required configuration
  if (!API_CONFIG.BASE_URL) {
    errors.push('BASE_URL is required but not set');
  }

  // Validate URL format
  if (API_CONFIG.BASE_URL && !API_CONFIG.BASE_URL.startsWith('http')) {
    errors.push('BASE_URL must start with http:// or https://');
  }

  // Validate timeout values
  if (API_CONFIG.TIMEOUT < 1000) {
    warnings.push('TIMEOUT is less than 1 second, which may cause issues');
  }

  if (API_CONFIG.TIMEOUT > 120000) {
    warnings.push('TIMEOUT is greater than 2 minutes, which may cause poor user experience');
  }

  // Validate retry configuration
  if (API_CONFIG.RETRY_ATTEMPTS < 0) {
    errors.push('RETRY_ATTEMPTS cannot be negative');
  }

  if (API_CONFIG.RETRY_ATTEMPTS > 10) {
    warnings.push('RETRY_ATTEMPTS is greater than 10, which may cause long delays');
  }

  if (API_CONFIG.RETRY_DELAY < 100) {
    warnings.push('RETRY_DELAY is less than 100ms, which may cause server overload');
  }

  // Validate log level
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(API_CONFIG.LOG_LEVEL)) {
    warnings.push(`LOG_LEVEL "${API_CONFIG.LOG_LEVEL}" is not valid. Valid values: ${validLogLevels.join(', ')}`);
  }

  // Validate error tracking configuration
  if (API_CONFIG.ENABLE_ERROR_TRACKING && !API_CONFIG.ERROR_TRACKING_ENDPOINT) {
    warnings.push('Error tracking is enabled but ERROR_TRACKING_ENDPOINT is not set');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get configuration summary for debugging
 */
export function getConfigurationSummary(): Record<string, any> {
  return {
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
    retryDelay: API_CONFIG.RETRY_DELAY,
    debug: API_CONFIG.DEBUG,
    logLevel: API_CONFIG.LOG_LEVEL,
    logApiCalls: API_CONFIG.LOG_API_CALLS,
    errorTracking: API_CONFIG.ENABLE_ERROR_TRACKING,
    rateLimit: API_CONFIG.RATE_LIMIT_ENABLED,
    cache: API_CONFIG.CACHE_ENABLED,
    environment: process.env.NODE_ENV,
  };
}

/**
 * Initialize and validate configuration on startup
 */
export function initializeConfiguration(): void {
  const validation = validateConfiguration();

  if (API_CONFIG.DEBUG || API_CONFIG.LOG_LEVEL === 'debug') {
    console.log('🔧 API Configuration Summary:', getConfigurationSummary());
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Configuration warnings:', validation.warnings);
  }

  if (!validation.isValid) {
    console.error('❌ Configuration errors:', validation.errors);
    throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
  }

  if (API_CONFIG.DEBUG) {
    console.log('✅ Configuration validation passed');
  }
}

export const API_ENDPOINTS = {
  // Authentication endpoints (from Postman collection)
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Users endpoints (from Postman collection)
  USERS: {
    PROFILE: '/users/profile',
    ME: '/users/me',
    PROFILE_PICTURE: '/users/me/profile-picture',
    FILTER: '/users/filter',
    MY_BRANCH: '/users/my-branch',
    STATES: '/users/states',
    BRANCHES: '/users/branches',
  },

  // Admin endpoints (from Postman collection)
  ADMIN: {
    PROFILE: '/admin/profile',
    USERS: '/admin/users',
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    USER_BY_EMAIL: (email: string) => `/admin/user/${email}`,
    UPDATE_ROLE: (id: string) => `/admin/user/${id}/update-role`,
    DELETE_USER: (id: string) => `/admin/users/${id}`,
    CUSTOMER_DETAILS: '/admin/users/customer-details',
    GUARANTOR_DETAILS: (id: string) => `/admin/users/${id}/guarantor-details`,
    ID_VERIFICATION: (id: string) => `/admin/users/${id}/id-verification`,
    VERIFICATION_STATUS: (id: string) => `/admin/users/${id}/verification-status`,
    UPDATE_USER: (id: string) => `/admin/users/${id}`,
    UPDATE_PROFILE_PICTURE: (id: string) => `/admin/users/${id}/profile-picture`,
    USERS_BY_BRANCH: (branch: string) => `/admin/users/branch/${branch}`,
    USERS_BY_STATE: (state: string) => `/admin/users/state/${state}`,
    CREATE_STAFF: '/admin/staff/create',
    MY_STAFF: '/admin/staff/my-staff',
  },

  // Loans endpoints (from Postman collection)
  LOANS: {
    // Staff operations
    CREATE: (customerId: string) => `/loans/customer/${customerId}`,
    DISBURSE: (loanId: string) => `/loans/${loanId}/disburse`,
    REPAYMENTS: (loanId: string) => `/loans/${loanId}/repayments`,
    LOAN_SUMMARY: (customerId: string) => `/loans/customer/${customerId}/loan-summary`,
    DISBURSEMENT_SUMMARY: (customerId: string) => `/loans/customer/${customerId}/disbursement-summary`,
    CUSTOMER_LOANS: (customerId: string) => `/loans/customer/${customerId}`,

    // New endpoints from Postman collection
    DISBURSED: '/loans/disbursed',
    RECOLLECTIONS: '/loans/recollections',
    MISSED: '/loans/missed',
    ALL: '/loans/all',
    DISBURSEMENT_VOLUME: '/loans/disbursed/volume',
  },

  // Customer Loans endpoints (from Postman collection)
  CUSTOMER_LOANS: {
    MY_LOANS: '/customer/loans/my-loans',
    ACTIVE_LOAN: '/customer/loans/active-loan',
  },

  // Savings endpoints (from Postman collection)
  SAVINGS: {
    // Staff operations
    DEPOSIT: (customerId: string) => `/savings/customer/${customerId}/deposit`,
    LOAN_COVERAGE: (customerId: string) => `/savings/customer/${customerId}/loan-coverage`,
    APPROVE_LOAN_COVERAGE: (transactionId: string) => `/savings/transactions/${transactionId}/approve-loan-coverage`,
    WITHDRAW: (customerId: string) => `/savings/customer/${customerId}/withdraw`,
    APPROVE_WITHDRAWAL: (transactionId: string) => `/savings/transactions/${transactionId}/approve-withdraw`,
    CUSTOMER_SAVINGS: (customerId: string) => `/savings/customer/${customerId}`,

    // New endpoints from Postman collection
    ALL_ACCOUNTS: '/savings/all',
    ALL_TRANSACTIONS: '/savings/transactions/all',
  },

  // Customer Savings endpoints (from Postman collection)
  CUSTOMER_SAVINGS: {
    MY_BALANCE: '/customer/savings/my-balance',
    MY_TRANSACTIONS: '/customer/savings/my-transactions',
  },

  // OTP endpoints (from Postman collection)
  OTP: {
    SEND: '/otp/send',
    VERIFY: '/otp/verify',
  },

  // Dashboard endpoints (from Postman collection)
  DASHBOARD: {
    KPI: '/dashboard/kpi',
  },

  // Reports endpoints
  REPORTS: {
    LIST: '/reports',
    BY_ID: (id: string) => `/reports/${id}`,
    APPROVE: (id: string) => `/reports/${id}/approve`,
    DECLINE: (id: string) => `/reports/${id}/decline`,
    STATISTICS: '/reports/statistics',
    DASHBOARD_STATS: '/reports/dashboard/stats',
  },

  // Activity Logs endpoints
  ACTIVITY_LOGS: {
    LIST: '/admin/activity-logs',
    BY_USER: (userId: string) => `/admin/activity-logs/user/${userId}`,
  },

  // System Settings endpoints
  SYSTEM_SETTINGS: {
    GET: '/admin/system-settings',
    UPDATE: '/admin/system-settings',
  },

  // Bulk Operations endpoints
  BULK: {
    USERS: '/admin/users/bulk',
  },
} as const;