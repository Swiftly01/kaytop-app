/**
 * API Response Types
 * Comprehensive type definitions to replace 'any' types throughout the application
 */

// Base response structure
export interface BaseApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T = unknown> extends BaseApiResponse<T> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error response structure
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
}

// User-related types
export interface UserApiData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobileNumber?: string;
  role: string;
  branch?: string;
  verificationStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse extends PaginatedApiResponse<UserApiData[]> {
  // Extends PaginatedApiResponse with UserApiData array
}

// Loan-related types
export interface LoanApiData {
  id: number;
  loanId: number;
  amount: string;
  amountPaid: string;
  remainingBalance: string;
  dailyRepayment: string;
  interestRate: string;
  term: number;
  status: string;
  disbursementDate: string;
  dueDate: string;
  customerName: string;
  customerBranch: string;
  daysOverdue: number;
  totalRepayable: string;
  createdAt: string;
}

export interface LoanListResponse extends PaginatedApiResponse<LoanApiData[]> {
  // Extends PaginatedApiResponse with LoanApiData array
}

// Branch-related types
export interface BranchApiData {
  id: number;
  name: string;
  location: string;
  state: string;
  manager?: string;
  totalCreditOfficers: number;
  totalCustomers: number;
  totalActiveLoans: number;
  totalDisbursed: string;
  createdAt: string;
}

export interface BranchListResponse extends PaginatedApiResponse<BranchApiData[]> {
  // Extends PaginatedApiResponse with BranchApiData array
}

// Dashboard KPI types
export interface DashboardKPIData {
  totalUsers: number;
  totalLoans: number;
  totalDisbursed: string;
  totalCollected: string;
  activeLoans: number;
  completedLoans: number;
  overdueLoans: number;
  totalBranches: number;
  totalCreditOfficers: number;
}

export interface DashboardKPIResponse extends BaseApiResponse<DashboardKPIData> {
  // Extends BaseApiResponse with DashboardKPIData
}

// Generic transformation function type
export type DataTransformer<TInput, TOutput> = (input: TInput) => TOutput;

// Generic API call result
export type ApiResult<T> = Promise<BaseApiResponse<T> | ApiErrorResponse>;