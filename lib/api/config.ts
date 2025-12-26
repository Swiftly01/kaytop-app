/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_KAYTOP_API_BASE_URL || 'https://kaytop-production.up.railway.app',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  // Add debugging flag for API calls
  DEBUG: process.env.NODE_ENV === 'development',
} as const;

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

  // Account Manager endpoints (proxy to real backend)
  AM: {
    PROFILE: '/api/am/profile',
    DASHBOARD: '/api/am/dashboard/kpi',
    BRANCHES: '/api/am/branches',
    BRANCH_BY_ID: (id: string) => `/api/am/branches/${id}`,
    BRANCH_REPORTS: (id: string) => `/api/am/branches/${id}/reports`,
    BRANCH_MISSED_REPORTS: (id: string) => `/api/am/branches/${id}/missed-reports`,
    BRANCH_CREDIT_OFFICERS: (id: string) => `/api/am/branches/${id}/credit-officers`,
    CUSTOMERS: '/api/am/customers',
    CUSTOMER_BY_ID: (id: string) => `/api/am/customers/${id}`,
    LOANS: '/api/am/loans',
    LOAN_BY_ID: (id: string) => `/api/am/loans/${id}`,
    REPORTS: '/api/am/reports',
    REPORT_BY_ID: (id: string) => `/api/am/reports/${id}`,
    REPORT_APPROVE: (id: string) => `/api/am/reports/${id}/approve`,
    REPORT_DECLINE: (id: string) => `/api/am/reports/${id}/decline`,
    SETTINGS: '/api/am/settings',
    ACTIVITY_LOGS: '/api/am/activity-logs',
    CREDIT_OFFICERS: '/api/am/credit-officers',
    CREDIT_OFFICER_BY_ID: (id: string) => `/api/am/credit-officers/${id}`,
    // Savings management endpoints
    SAVINGS: '/api/am/savings',
    SAVINGS_TRANSACTIONS: '/api/am/savings/transactions',
    CUSTOMER_SAVINGS: (id: string) => `/api/am/savings/customer/${id}`,
    APPROVE_WITHDRAWAL: (id: string) => `/api/am/savings/transactions/${id}/approve-withdraw`,
    APPROVE_LOAN_COVERAGE: (id: string) => `/api/am/savings/transactions/${id}/approve-loan-coverage`,
    SAVINGS_SUMMARY: '/api/am/savings/summary',
  },
  
  // Reports endpoints
  REPORTS: {
    LIST: '/reports',
    BY_ID: (id: string) => `/reports/${id}`,
    APPROVE: (id: string) => `/reports/${id}/approve`,
    DECLINE: (id: string) => `/reports/${id}/decline`,
    STATISTICS: '/reports/statistics',
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