/**
 * API Types and Interfaces
 * TypeScript definitions for API requests and responses
 */

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

// Request Configuration
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  userType?: string;
}

export interface AuthResponse {
  token: string;
  user: AdminProfile;
  expiresIn?: number;
}

export interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: 'system_admin' | 'branch_manager' | 'credit_officer' | 'customer';
  branch?: string;
  state?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: 'system_admin' | 'branch_manager' | 'credit_officer' | 'customer';
  branch?: string;
  state?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface UserFilterParams {
  branch?: string;
  state?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CreateStaffData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: 'credit_officer' | 'branch_manager';
  branch: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  branch?: string;
  state?: string;
}

// Loan Types
export interface Loan {
  id: string;
  customerId: string;
  amount: number;
  term: number;
  interestRate: number;
  status: 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted';
  disbursementDate?: string;
  nextRepaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanData {
  amount: number;
  term: number;
  interestRate: number;
}

export interface RepaymentData {
  amount: number;
  paymentDate: string;
  proof: File;
}

export interface LoanSummary {
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface DisbursementSummary {
  totalDisbursed: number;
  pendingDisbursements: number;
  disbursedAmount: number;
  pendingAmount: number;
}

// Savings Types
export interface SavingsAccount {
  id: string;
  customerId: string;
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'loan_coverage';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface DepositData {
  amount: number;
  description: string;
}

export interface WithdrawalData {
  amount: number;
  description: string;
}

export interface LoanCoverageData {
  loanId: string;
  amount: number;
}

// OTP Types
export interface OTPSendData {
  email: string;
  purpose: 'password_reset' | 'email_verification';
}

export interface OTPVerifyData {
  email: string;
  code: string;
  purpose: 'password_reset' | 'email_verification';
}

// Dashboard Types
export interface DashboardParams {
  timeFilter?: 'last_24_hours' | 'last_7_days' | 'last_30_days' | 'custom';
  startDate?: string;
  endDate?: string;
  branch?: string;
}

export interface StatisticValue {
  value: number;
  change: number;
  changeLabel: string;
  isCurrency?: boolean;
}

export interface BranchPerformance {
  name: string;
  activeLoans: number;
  amount: number;
}

export interface DashboardKPIs {
  branches: StatisticValue;
  creditOfficers: StatisticValue;
  customers: StatisticValue;
  loansProcessed: StatisticValue;
  loanAmounts: StatisticValue;
  activeLoans: StatisticValue;
  missedPayments: StatisticValue;
  bestPerformingBranches: BranchPerformance[];
  worstPerformingBranches: BranchPerformance[];
}

// Error Types
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export interface NetworkError extends ApiError {
  type: 'network';
}

export interface AuthError extends ApiError {
  type: 'auth';
}

export interface ServerError extends ApiError {
  type: 'server';
}