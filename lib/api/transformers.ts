/**
 * Data Transformers
 * Handles transformation between backend API responses and frontend data models
 */

import type { 
  User, 
  AdminProfile, 
  Loan, 
  DashboardKPIs, 
  StatisticValue, 
  BranchPerformance,
  PaginatedResponse 
} from './types';

// Export individual transformer functions for convenience
export const transformUserData = (data: any) => DataTransformers.transformUser(data);
export const transformAdminProfileData = (data: any) => DataTransformers.transformAdminProfile(data);
export const transformLoanData = (data: any) => DataTransformers.transformLoan(data);
export const transformDashboardKPIData = (data: any) => DataTransformers.transformDashboardKPIs(data);
export const transformSavingsData = (data: any) => DataTransformers.transformSavingsAccount(data);
export const transformTransactionData = (data: any) => DataTransformers.transformTransaction(data);

export class DataTransformers {
  
  /**
   * Transform backend user data to frontend User interface
   */
  static transformUser(backendUser: any): User {
    return {
      id: backendUser.id?.toString() || backendUser.userId?.toString() || '',
      firstName: backendUser.firstName || backendUser.first_name || '',
      lastName: backendUser.lastName || backendUser.last_name || '',
      email: backendUser.email || '',
      mobileNumber: backendUser.mobileNumber || backendUser.mobile_number || backendUser.phone || '',
      role: this.normalizeRole(backendUser.role),
      branch: backendUser.branch || backendUser.branchName || '',
      state: backendUser.state || '',
      verificationStatus: this.normalizeVerificationStatus(backendUser.verificationStatus || backendUser.verification_status),
      createdAt: backendUser.createdAt || backendUser.created_at || new Date().toISOString(),
      updatedAt: backendUser.updatedAt || backendUser.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Transform backend admin profile data to frontend AdminProfile interface
   */
  static transformAdminProfile(backendProfile: any): AdminProfile {
    return {
      id: backendProfile.id?.toString() || backendProfile.userId?.toString() || '',
      firstName: backendProfile.firstName || backendProfile.first_name || '',
      lastName: backendProfile.lastName || backendProfile.last_name || '',
      email: backendProfile.email || '',
      mobileNumber: backendProfile.mobileNumber || backendProfile.mobile_number || backendProfile.phone || '',
      role: this.normalizeRole(backendProfile.role),
      branch: backendProfile.branch || backendProfile.branchName || '',
      state: backendProfile.state || '',
      verificationStatus: this.normalizeVerificationStatus(backendProfile.verificationStatus || backendProfile.verification_status),
      createdAt: backendProfile.createdAt || backendProfile.created_at || new Date().toISOString(),
      updatedAt: backendProfile.updatedAt || backendProfile.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Transform backend loan data to frontend Loan interface
   */
  static transformLoan(backendLoan: any): Loan {
    return {
      id: backendLoan.id?.toString() || backendLoan.loanId?.toString() || '',
      customerId: backendLoan.customerId?.toString() || backendLoan.customer_id?.toString() || '',
      amount: parseFloat(backendLoan.amount) || 0,
      term: parseInt(backendLoan.term) || parseInt(backendLoan.tenure) || 0,
      interestRate: parseFloat(backendLoan.interestRate) || parseFloat(backendLoan.interest_rate) || 0,
      status: this.normalizeLoanStatus(backendLoan.status),
      disbursementDate: backendLoan.disbursementDate || backendLoan.disbursement_date || backendLoan.expectedDisbursement,
      nextRepaymentDate: backendLoan.nextRepaymentDate || backendLoan.next_repayment_date,
      createdAt: backendLoan.createdAt || backendLoan.created_at || backendLoan.applicationDate || new Date().toISOString(),
      updatedAt: backendLoan.updatedAt || backendLoan.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Transform backend dashboard KPI data to frontend DashboardKPIs interface
   */
  static transformDashboardKPIs(backendKPIs: any): DashboardKPIs {
    return {
      branches: this.transformStatisticValue(
        backendKPIs.totalBranches || backendKPIs.branches || 0,
        backendKPIs.branchesGrowth || 0
      ),
      creditOfficers: this.transformStatisticValue(
        backendKPIs.totalCreditOfficers || backendKPIs.creditOfficers || 0,
        backendKPIs.creditOfficersGrowth || 0
      ),
      customers: this.transformStatisticValue(
        backendKPIs.totalCustomers || backendKPIs.customers || 0,
        backendKPIs.customersGrowth || 0
      ),
      loansProcessed: this.transformStatisticValue(
        backendKPIs.loansProcessed || backendKPIs.totalLoans || 0,
        backendKPIs.loansProcessedGrowth || backendKPIs.loansGrowth || 0
      ),
      loanAmounts: this.transformStatisticValue(
        backendKPIs.totalLoanAmount || backendKPIs.loanAmounts || 0,
        backendKPIs.loanAmountGrowth || backendKPIs.loanAmountsGrowth || 0,
        true // isCurrency
      ),
      activeLoans: this.transformStatisticValue(
        backendKPIs.activeLoans || 0,
        backendKPIs.activeLoansGrowth || 0
      ),
      missedPayments: this.transformStatisticValue(
        backendKPIs.missedPayments || 0,
        backendKPIs.missedPaymentsGrowth || 0
      ),
      bestPerformingBranches: this.transformBranchPerformance(
        backendKPIs.bestPerformingBranches || backendKPIs.topBranches || []
      ),
      worstPerformingBranches: this.transformBranchPerformance(
        backendKPIs.worstPerformingBranches || backendKPIs.bottomBranches || []
      ),
    };
  }

  /**
   * Transform individual statistic values
   */
  private static transformStatisticValue(
    value: number | string,
    change: number,
    isCurrency: boolean = false
  ): StatisticValue {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
    const numericChange = typeof change === 'string' ? parseFloat(change) || 0 : change || 0;
    
    // Generate change label
    let changeLabel = '';
    if (numericChange > 0) {
      changeLabel = `+${numericChange}% this month`;
    } else if (numericChange < 0) {
      changeLabel = `${numericChange}% this month`;
    } else {
      changeLabel = 'No change this month';
    }

    return {
      value: numericValue,
      change: numericChange,
      changeLabel,
      isCurrency,
    };
  }

  /**
   * Transform branch performance data
   */
  private static transformBranchPerformance(branches: any[]): BranchPerformance[] {
    if (!Array.isArray(branches)) {
      return [];
    }

    return branches.map(branch => ({
      name: branch.name || branch.branchName || 'Unknown Branch',
      activeLoans: branch.activeLoans || branch.loans || 0,
      amount: branch.amount || branch.totalAmount || branch.loanAmount || 0,
    }));
  }

  /**
   * Transform paginated response from backend to frontend format
   */
  static transformPaginatedResponse<T>(
    backendResponse: any,
    transformItem: (item: any) => T
  ): PaginatedResponse<T> {
    // Handle different backend response formats
    let data: any[] = [];
    let pagination: any = {};

    if (backendResponse.success && backendResponse.data) {
      // Format: { success: true, data: { items: [], pagination: {} } }
      if (Array.isArray(backendResponse.data)) {
        data = backendResponse.data;
      } else if (backendResponse.data.data && Array.isArray(backendResponse.data.data)) {
        data = backendResponse.data.data;
        pagination = backendResponse.data.pagination || {};
      } else if (backendResponse.data.items && Array.isArray(backendResponse.data.items)) {
        data = backendResponse.data.items;
        pagination = backendResponse.data.pagination || {};
      }
    } else if (Array.isArray(backendResponse.data)) {
      // Format: { data: [], pagination: {} }
      data = backendResponse.data;
      pagination = backendResponse.pagination || {};
    } else if (Array.isArray(backendResponse)) {
      // Format: direct array
      data = backendResponse;
    }

    // Transform each item
    const transformedData = data.map(transformItem);

    // Ensure pagination has default values
    const normalizedPagination = {
      page: pagination.page || pagination.currentPage || 1,
      limit: pagination.limit || pagination.pageSize || pagination.per_page || 10,
      total: pagination.total || pagination.totalItems || data.length,
      totalPages: pagination.totalPages || pagination.total_pages || Math.ceil((pagination.total || data.length) / (pagination.limit || 10)),
    };

    return {
      data: transformedData,
      pagination: normalizedPagination,
    };
  }

  /**
   * Normalize user role to match frontend expectations
   */
  private static normalizeRole(role: string): 'system_admin' | 'branch_manager' | 'account_manager' | 'hq_manager' | 'credit_officer' | 'customer' {
    if (!role) return 'customer';
    
    const normalizedRole = role.toLowerCase().replace(/[-\s]/g, '_');
    
    switch (normalizedRole) {
      case 'system_admin':
      case 'systemadmin':
      case 'admin':
        return 'system_admin';
      case 'branch_manager':
      case 'branchmanager':
      case 'manager':
        return 'branch_manager';
      case 'account_manager':
      case 'accountmanager':
        return 'account_manager';
      case 'hq_manager':
      case 'hqmanager':
        return 'hq_manager';
      case 'credit_officer':
      case 'creditofficer':
      case 'officer':
        return 'credit_officer';
      case 'customer':
      case 'client':
      default:
        return 'customer';
    }
  }

  /**
   * Normalize verification status to match frontend expectations
   */
  private static normalizeVerificationStatus(status: string): 'pending' | 'verified' | 'rejected' {
    if (!status) return 'pending';
    
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'verified':
      case 'approved':
      case 'active':
        return 'verified';
      case 'rejected':
      case 'declined':
      case 'inactive':
        return 'rejected';
      case 'pending':
      case 'review':
      default:
        return 'pending';
    }
  }

  /**
   * Normalize loan status to match frontend expectations
   */
  private static normalizeLoanStatus(status: string): 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted' {
    if (!status) return 'pending';
    
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
      case 'review':
      case 'documentation':
        return 'pending';
      case 'approved':
      case 'approval':
        return 'approved';
      case 'disbursed':
      case 'disbursement':
        return 'disbursed';
      case 'active':
      case 'ongoing':
        return 'active';
      case 'completed':
      case 'closed':
      case 'paid':
        return 'completed';
      case 'defaulted':
      case 'overdue':
      case 'missed':
        return 'defaulted';
      default:
        return 'pending';
    }
  }

  /**
   * Validate and sanitize data to prevent errors
   */
  static validateAndSanitize<T>(data: any, validator: (item: any) => T): T | null {
    try {
      if (!data || typeof data !== 'object') {
        return null;
      }
      return validator(data);
    } catch (error) {
      console.error('Data validation error:', error);
      return null;
    }
  }

  /**
   * Transform array of items with error handling
   */
  static transformArray<T>(
    items: any[],
    transformer: (item: any) => T
  ): T[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map(item => this.validateAndSanitize(item, transformer))
      .filter((item): item is T => item !== null);
  }

  /**
   * Transform backend savings account data to frontend format
   */
  static transformSavingsAccount(backendSavings: any): any {
    return {
      id: backendSavings.id?.toString() || backendSavings.accountId?.toString() || '',
      customerId: backendSavings.customerId?.toString() || backendSavings.customer_id?.toString() || '',
      customerName: backendSavings.customerName || backendSavings.customer_name || 
                   `${backendSavings.firstName || ''} ${backendSavings.lastName || ''}`.trim() || 'Unknown Customer',
      accountNumber: backendSavings.accountNumber || backendSavings.account_number || '',
      balance: parseFloat(backendSavings.balance) || 0,
      status: this.normalizeSavingsStatus(backendSavings.status),
      createdAt: backendSavings.createdAt || backendSavings.created_at || new Date().toISOString(),
      updatedAt: backendSavings.updatedAt || backendSavings.updated_at || new Date().toISOString(),
      branch: backendSavings.branch || backendSavings.branchName || '',
      interestRate: parseFloat(backendSavings.interestRate) || parseFloat(backendSavings.interest_rate) || 0,
    };
  }

  /**
   * Transform backend transaction data to frontend format
   */
  static transformTransaction(backendTransaction: any): any {
    return {
      id: backendTransaction.id?.toString() || backendTransaction.transactionId?.toString() || '',
      customerId: backendTransaction.customerId?.toString() || backendTransaction.customer_id?.toString() || '',
      customerName: backendTransaction.customerName || backendTransaction.customer_name || 
                   `${backendTransaction.firstName || ''} ${backendTransaction.lastName || ''}`.trim() || 'Unknown Customer',
      accountId: backendTransaction.accountId?.toString() || backendTransaction.account_id?.toString() || '',
      type: this.normalizeTransactionType(backendTransaction.type),
      amount: parseFloat(backendTransaction.amount) || 0,
      status: this.normalizeTransactionStatus(backendTransaction.status),
      description: backendTransaction.description || backendTransaction.notes || '',
      createdAt: backendTransaction.createdAt || backendTransaction.created_at || new Date().toISOString(),
      approvedAt: backendTransaction.approvedAt || backendTransaction.approved_at,
      approvedBy: backendTransaction.approvedBy || backendTransaction.approved_by,
      branch: backendTransaction.branch || backendTransaction.branchName || '',
    };
  }

  /**
   * Transform chart data from backend to frontend format
   */
  static transformChartData(backendData: any): any {
    // Handle different backend response formats
    if (Array.isArray(backendData)) {
      // Format: [{ month: 'Jan', amount: 1000000 }, ...]
      const labels = backendData.map(item => item.month || item.label || item.name || '');
      const data = backendData.map(item => item.amount || item.value || item.total || 0);
      
      return {
        labels,
        datasets: [{
          label: 'Data',
          data,
          backgroundColor: '#7F56D9',
          borderColor: '#7F56D9'
        }]
      };
    } else if (backendData && typeof backendData === 'object') {
      // Format: { labels: [], data: [] } or { months: [], amounts: [] }
      const labels = backendData.labels || backendData.months || [];
      const data = backendData.data || backendData.amounts || backendData.values || [];
      
      return {
        labels,
        datasets: [{
          label: 'Data',
          data,
          backgroundColor: '#7F56D9',
          borderColor: '#7F56D9'
        }]
      };
    }

    // Fallback to empty data
    return {
      labels: [],
      datasets: [{
        label: 'Data',
        data: [],
        backgroundColor: '#7F56D9',
        borderColor: '#7F56D9'
      }]
    };
  }

  /**
   * Transform API response with proper error handling and validation
   */
  static transformApiResponse<T>(
    response: any,
    transformer: (item: any) => T,
    options: {
      isArray?: boolean;
      isPaginated?: boolean;
      fallbackValue?: T | T[];
    } = {}
  ): T | T[] | any {
    const { isArray = false, isPaginated = false, fallbackValue } = options;

    try {
      // Handle null/undefined responses
      if (!response) {
        return fallbackValue || (isArray ? [] : null);
      }

      // Handle paginated responses
      if (isPaginated) {
        return this.transformPaginatedResponse(response, transformer);
      }

      // Handle array responses
      if (isArray || Array.isArray(response.data) || Array.isArray(response)) {
        const dataArray = response.data || response;
        if (!Array.isArray(dataArray)) {
          return fallbackValue || [];
        }
        return this.transformArray(dataArray, transformer);
      }

      // Handle single item responses
      const item = response.data || response;
      return this.validateAndSanitize(item, transformer) || fallbackValue || null;
    } catch (error) {
      console.error('Data transformation error:', error);
      return fallbackValue || (isArray ? [] : null);
    }
  }

  /**
   * Normalize savings account status
   */
  private static normalizeSavingsStatus(status: string): 'active' | 'inactive' | 'suspended' {
    if (!status) return 'active';
    
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'active':
      case 'open':
        return 'active';
      case 'inactive':
      case 'closed':
        return 'inactive';
      case 'suspended':
      case 'frozen':
        return 'suspended';
      default:
        return 'active';
    }
  }

  /**
   * Normalize transaction type
   */
  private static normalizeTransactionType(type: string): 'deposit' | 'withdrawal' | 'loan_coverage' {
    if (!type) return 'deposit';
    
    const normalizedType = type.toLowerCase();
    
    switch (normalizedType) {
      case 'deposit':
      case 'credit':
        return 'deposit';
      case 'withdrawal':
      case 'withdraw':
      case 'debit':
        return 'withdrawal';
      case 'loan_coverage':
      case 'loancoverage':
      case 'loan-coverage':
      case 'coverage':
        return 'loan_coverage';
      default:
        return 'deposit';
    }
  }

  /**
   * Normalize transaction status
   */
  private static normalizeTransactionStatus(status: string): 'pending' | 'approved' | 'declined' | 'completed' {
    if (!status) return 'pending';
    
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
      case 'review':
        return 'pending';
      case 'approved':
      case 'approval':
        return 'approved';
      case 'declined':
      case 'rejected':
        return 'declined';
      case 'completed':
      case 'processed':
      case 'success':
        return 'completed';
      default:
        return 'pending';
    }
  }
}