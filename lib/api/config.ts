/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

import { apiBaseUrl } from "../config";

export const API_CONFIG = {
  BASE_URL: apiBaseUrl,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    ME: '/users/me',
    PROFILE_PICTURE: '/users/me/profile-picture',
    FILTER: '/users/filter',
    MY_BRANCH: '/users/my-branch',
    STATES: '/users/states',
    BRANCHES: '/users/branches',
  },
  
  // Admin
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
  
  // Loans (Staff endpoints)
  LOANS: {
    CREATE: (customerId: string) => `/loans/customer/${customerId}`,
    DISBURSE: (loanId: string) => `/loans/${loanId}/disburse`,
    REPAYMENTS: (loanId: string) => `/loans/${loanId}/repayments`,
    LOAN_SUMMARY: (customerId: string) => `/loans/customer/${customerId}/loan-summary`,
    DISBURSEMENT_SUMMARY: (customerId: string) => `/loans/customer/${customerId}/disbursement-summary`,
    CUSTOMER_LOANS: (customerId: string) => `/loans/customer/${customerId}`,
  },
  
  // Customer Loans
  CUSTOMER_LOANS: {
    MY_LOANS: '/customer/loans/my-loans',
    ACTIVE_LOAN: '/customer/loans/active-loan',
  },
  
  // Savings
  SAVINGS: {
    DEPOSIT: (customerId: string) => `/savings/customer/${customerId}/deposit`,
    LOAN_COVERAGE: (customerId: string) => `/savings/customer/${customerId}/loan-coverage`,
    APPROVE_LOAN_COVERAGE: (transactionId: string) => `/savings/transactions/${transactionId}/approve-loan-coverage`,
    WITHDRAW: (customerId: string) => `/savings/customer/${customerId}/withdraw`,
    APPROVE_WITHDRAWAL: (transactionId: string) => `/savings/transactions/${transactionId}/approve-withdrawal`,
    CUSTOMER_SAVINGS: (customerId: string) => `/savings/customer/${customerId}`,
  },
  
  // Customer Savings
  CUSTOMER_SAVINGS: {
    MY_BALANCE: '/customer/savings/my-balance',
    MY_TRANSACTIONS: '/customer/savings/my-transactions',
  },
  
  // OTP
  OTP: {
    SEND: '/otp/send',
    VERIFY: '/otp/verify',
  },
  
  // Dashboard
  DASHBOARD: {
    KPI: '/dashboard/kpi',
    // Note: /dashboard/loan-statistics doesn't exist, use KPI endpoint instead
  },
  
  // Reports
  REPORTS: {
    LIST: '/reports',
    BY_ID: (id: string) => `/reports/${id}`,
    APPROVE: (id: string) => `/reports/${id}/approve`,
    DECLINE: (id: string) => `/reports/${id}/decline`,
    STATISTICS: '/reports/statistics',
  },
  
  // Activity Logs
  ACTIVITY_LOGS: {
    LIST: '/admin/activity-logs',
    BY_USER: (userId: string) => `/admin/activity-logs/user/${userId}`,
  },
  
  // System Settings
  SYSTEM_SETTINGS: {
    GET: '/admin/system-settings',
    UPDATE: '/admin/system-settings',
  },
  
  // Bulk Operations (Note: /loans/bulk doesn't exist on backend)
  BULK: {
    USERS: '/admin/users/bulk', // This may not exist either, needs verification
  },
} as const;