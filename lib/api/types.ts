/**
 * API Types and Interfaces
 * TypeScript definitions for API requests and responses
 */

// Base API Response Types
export interface ApiResponse<T = unknown> {
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
  suppressErrorLog?: boolean;
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
  id: string | number; // Backend returns numeric IDs but we handle both
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: 'system_admin' | 'branch_manager' | 'account_manager' | 'hq_manager' | 'credit_officer' | 'customer';
  branch?: string;
  state?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  profilePicture?: string;
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
  id: string | number; // Backend returns numeric IDs but we handle both
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email: string;
  mobileNumber: string;
  role: 'system_admin' | 'branch_manager' | 'account_manager' | 'hq_manager' | 'credit_officer' | 'customer';
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
  role: 'credit_officer' | 'branch_manager' | 'account_manager' | 'hq_manager';
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
  id: string | number; // Backend returns numeric IDs but we handle both
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
  id: string | number; // Backend returns numeric IDs but we handle both
  customerId: string;
  customerName?: string;
  accountNumber?: string;
  balance: number;
  status?: 'active' | 'inactive' | 'suspended';
  branch?: string;
  interestRate?: number;
  createdAt?: string;
  updatedAt?: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string | number; // Backend returns numeric IDs but we handle both
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
  // Report statistics KPIs
  totalReports: StatisticValue;
  pendingReports: StatisticValue;
  approvedReports: StatisticValue;
  missedReports: StatisticValue;
}

// Error Types
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
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

// Reports Management Types
export interface Report {
  id: string;
  reportId: string;
  creditOfficer: string;
  creditOfficerId: string;
  branch: string;
  branchId: string;
  email: string;
  dateSent: string;
  timeSent: string;
  reportType: 'daily' | 'weekly' | 'monthly';
  status: 'submitted' | 'pending' | 'approved' | 'declined';
  isApproved?: boolean;
  loansDispursed: number;
  loansValueDispursed: string;
  savingsCollected: string;
  repaymentsCollected: number;
  createdAt: string;
  updatedAt: string;
  // Approval history metadata
  approvedBy?: string;
  approvedAt?: string;
  declineReason?: string;
  approvalHistory?: Array<{
    action: 'approved' | 'declined';
    actionBy: string;
    actionAt: string;
    comments?: string;
  }>;
}

// Enhanced types for HQ Dashboard functionality
export interface BranchReport {
  id: string;
  branchName: string;
  branchId: string;
  totalSavings: number;
  totalDisbursed: number;
  totalRepaid: number;
  status: 'pending' | 'approved' | 'declined' | 'mixed';
  reportCount: number;
  pendingReports: number;
  approvedReports: number;
  declinedReports: number;
  lastSubmissionDate: string;
  oldestPendingDate?: string;
  creditOfficerCount: number;
  activeCreditOfficers: string[];
}

export interface HQReviewData {
  action: 'APPROVE' | 'DECLINE';
  remarks: string;
}

// Branch Performance and Ratings Types
export type RatingPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type RatingType = 'SAVINGS' | 'MONEY_DISBURSED' | 'LOAN_REPAYMENT';

export interface BranchRating {
  branchName: string;
  branchId?: string;
  rank: number;
  totalScore: number;
  savingsScore: number;
  disbursementScore: number;
  repaymentScore: number;
  period: RatingPeriod;
  calculatedAt: string;
  // Raw performance data
  savingsCollected?: number;
  loansDispursed?: number;
  repaymentsReceived?: number;
}

export interface RatingCalculationParams {
  period: RatingPeriod;
  periodDate?: string;
}

export interface RatingCalculationResult {
  success: boolean;
  message?: string;
  calculatedAt?: string;
  period?: RatingPeriod;
  periodDate?: string;
  error?: string;
}

export interface LeaderboardFilters {
  type?: RatingType;
  period?: RatingPeriod;
  limit?: number;
}

export interface BranchReportFilters {
  branchId?: string;
  status?: string;
  reportType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ReportStatistics {
  totalReports: { count: number; growth: number };
  submittedReports: { count: number; growth: number };
  pendingReports: { count: number; growth: number };
  approvedReports: { count: number; growth: number };
  missedReports: { count: number; growth: number };
}

export interface ReportApprovalData {
  status: 'approved' | 'declined';
  comments?: string;
  approvedBy: string;
  approvedAt: string;
}

export interface ReportFilters {
  creditOfficerId?: string;
  branchId?: string;
  status?: string;
  reportType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Activity Logs Types
export interface ActivityLog {
  id: string;
  userId: string;
  userFullName: string;
  userRole: string;
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'decline';
  entityType: 'user' | 'loan' | 'report' | 'savings' | 'system';
  entityId?: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  createdAt: string;
}

export interface ActivityLogFilters {
  userId?: string;
  userRole?: string;
  actionType?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// System Settings Types
export interface SystemSettings {
  id: string;
  globalDefaults: {
    interestRate: number;
    loanDuration: number;
    maxLoanAmount: number;
    minSavingsBalance: number;
  };
  reportTemplate: {
    requiredFields: string[];
    customParameters: string[];
    submissionDeadline: string;
  };
  alertRules: {
    missedPayments: boolean;
    missedReports: boolean;
    dailyEmailSummary: boolean;
    customAlerts: string[];
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      requireUppercase: boolean;
    };
    twoFactorAuth: {
      enabled: boolean;
      methods: ('sms' | 'email')[];
    };
  };
  updatedAt: string;
  updatedBy: string;
}

// Bulk Operations Types
export interface BulkLoansResponse {
  loans: Loan[];
  statistics: {
    totalLoans: number;
    activeLoans: number;
    completedLoans: number;
    totalValue: number;
    averageAmount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkLoansFilters {
  status?: string[];
  branchId?: string;
  creditOfficerId?: string;
  customerId?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LoanStatistics {
  totalLoans: { count: number; value: number; growth: number };
  activeLoans: { count: number; value: number; growth: number };
  completedLoans: { count: number; value: number; growth: number };
  overdueLoans: { count: number; value: number; growth: number };
  disbursedThisMonth: { count: number; value: number; growth: number };
  collectedThisMonth: { count: number; value: number; growth: number };
  averageLoanAmount: { value: number; growth: number };
  averageRepaymentPeriod: { value: number; growth: number };
}