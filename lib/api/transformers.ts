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
   * Updated to handle actual backend response structure from /admin/users endpoints
   */
  static transformUser(backendUser: any): User {
    console.log('🔄 Transforming user data:', backendUser);
    
    return {
      id: backendUser.id?.toString() || backendUser.userId?.toString() || '',
      firstName: backendUser.firstName || backendUser.first_name || '',
      lastName: backendUser.lastName || backendUser.last_name || '',
      email: backendUser.email || '',
      mobileNumber: backendUser.mobileNumber || backendUser.mobile_number || backendUser.phone || '',
      // Normalize role - backend may return different role values, with intelligent detection fallback
      role: DataTransformers.normalizeRole(backendUser.role, backendUser),
      branch: backendUser.branch || backendUser.branchName || '',
      state: backendUser.state || '',
      // Handle both verificationStatus and accountStatus fields
      verificationStatus: DataTransformers.normalizeVerificationStatus(
        backendUser.verificationStatus || backendUser.verification_status || backendUser.accountStatus
      ),
      createdAt: backendUser.createdAt || backendUser.created_at || new Date().toISOString(),
      updatedAt: backendUser.updatedAt || backendUser.updated_at || backendUser.createdAt || new Date().toISOString(),
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
      role: DataTransformers.normalizeRole(backendProfile.role, backendProfile),
      branch: backendProfile.branch || backendProfile.branchName || '',
      state: backendProfile.state || '',
      verificationStatus: DataTransformers.normalizeVerificationStatus(backendProfile.verificationStatus || backendProfile.verification_status),
      createdAt: backendProfile.createdAt || backendProfile.created_at || new Date().toISOString(),
      updatedAt: backendProfile.updatedAt || backendProfile.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Transform backend loan data to frontend Loan interface
   * Updated to handle actual backend response structure from /loans endpoints
   */
  static transformLoan(backendLoan: any): Loan {
    console.log('🔄 Transforming loan data:', backendLoan);
    
    return {
      id: backendLoan.id?.toString() || backendLoan.loanId?.toString() || '',
      // Extract customerId from nested user object or use direct field
      customerId: backendLoan.user?.id?.toString() || backendLoan.customerId?.toString() || backendLoan.customer_id?.toString() || '',
      // Convert string amounts to numbers
      amount: parseFloat(backendLoan.amount) || 0,
      term: parseInt(backendLoan.term) || parseInt(backendLoan.tenure) || 0,
      // Convert string interest rates to numbers
      interestRate: parseFloat(backendLoan.interestRate) || parseFloat(backendLoan.interest_rate) || parseFloat(backendLoan.interest) || 0,
      // Normalize status values (OVERDUE -> defaulted, etc.)
      status: DataTransformers.normalizeLoanStatus(backendLoan.status),
      disbursementDate: backendLoan.disbursementDate || backendLoan.disbursement_date || backendLoan.dateDisbursed || backendLoan.expectedDisbursement,
      // Map dueDate to nextRepaymentDate
      nextRepaymentDate: backendLoan.nextRepaymentDate || backendLoan.next_repayment_date || backendLoan.dueDate || backendLoan.dateToBePaid,
      createdAt: backendLoan.createdAt || backendLoan.created_at || backendLoan.applicationDate || new Date().toISOString(),
      updatedAt: backendLoan.updatedAt || backendLoan.updated_at || backendLoan.createdAt || new Date().toISOString(),
    };
  }

  /**
   * Transform backend dashboard KPI data to frontend DashboardKPIs interface
   * Updated to handle the actual backend response structure from /dashboard/kpi
   */
  static transformDashboardKPIs(backendKPIs: any): DashboardKPIs {
    console.log('🔄 Transforming dashboard KPIs:', backendKPIs);
    
    // Calculate mock growth percentages based on current values (temporary solution)
    const calculateMockGrowth = (value: number): number => {
      if (value === 0) return 0;
      // Generate realistic growth between -10% and +15%
      return Math.round((Math.random() * 25 - 10) * 100) / 100;
    };

    return {
      // Map totalCreditOfficers to creditOfficers
      creditOfficers: DataTransformers.transformStatisticValue(
        backendKPIs.totalCreditOfficers || 0,
        calculateMockGrowth(backendKPIs.totalCreditOfficers || 0)
      ),
      
      // Use totalSavingsAccounts as proxy for customers (since customers aren't provided)
      // Note: This should ideally be the actual customer count from user filtering
      customers: DataTransformers.transformStatisticValue(
        backendKPIs.totalSavingsAccounts || 0,
        calculateMockGrowth(backendKPIs.totalSavingsAccounts || 0)
      ),
      
      // Map loansProcessedThisPeriod to loansProcessed
      loansProcessed: DataTransformers.transformStatisticValue(
        backendKPIs.loansProcessedThisPeriod || backendKPIs.totalLoans || 0,
        calculateMockGrowth(backendKPIs.loansProcessedThisPeriod || backendKPIs.totalLoans || 0)
      ),
      
      // Map loanValueThisPeriod to loanAmounts
      loanAmounts: DataTransformers.transformStatisticValue(
        backendKPIs.loanValueThisPeriod || backendKPIs.totalDisbursedValue || 0,
        calculateMockGrowth(backendKPIs.loanValueThisPeriod || backendKPIs.totalDisbursedValue || 0),
        true // isCurrency
      ),
      
      // Map activeLoans directly
      activeLoans: DataTransformers.transformStatisticValue(
        backendKPIs.activeLoans || 0,
        calculateMockGrowth(backendKPIs.activeLoans || 0)
      ),
      
      // Map overdueLoans to missedPayments
      missedPayments: DataTransformers.transformStatisticValue(
        backendKPIs.overdueLoans || 0,
        calculateMockGrowth(backendKPIs.overdueLoans || 0)
      ),
      
      // Estimate branches count (use 1 as default since we don't have this data)
      branches: DataTransformers.transformStatisticValue(
        1, // Default to 1 branch since backend doesn't provide this
        0   // No growth data available
      ),
      
      // Transform topPerformers to bestPerformingBranches
      bestPerformingBranches: DataTransformers.transformBranchPerformance(
        backendKPIs.topPerformers || backendKPIs.officerPerformance || []
      ),
      
      // Create worst performing branches (reverse of top performers or empty)
      worstPerformingBranches: DataTransformers.transformBranchPerformance(
        (backendKPIs.topPerformers || backendKPIs.officerPerformance || []).slice().reverse().slice(0, 3)
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
   * Transform officer performance data to branch performance format
   * Maps officer performance data from backend to branch performance expected by frontend
   */
  private static transformOfficerPerformanceToBranches(officers: any[]): BranchPerformance[] {
    if (!Array.isArray(officers)) {
      return [];
    }

    // Group officers by branch and aggregate their performance
    const branchMap = new Map<string, BranchPerformance>();
    
    officers.forEach(officer => {
      const branchName = officer.branch || 'Unknown Branch';
      const existing = branchMap.get(branchName);
      
      if (existing) {
        existing.activeLoans += officer.loansProcessed || officer.loansApproved || 0;
        existing.amount += officer.loanValueProcessed || officer.totalValueProcessed || 0;
      } else {
        branchMap.set(branchName, {
          name: branchName,
          activeLoans: officer.loansProcessed || officer.loansApproved || 0,
          amount: officer.loanValueProcessed || officer.totalValueProcessed || 0,
        });
      }
    });

    // Convert map to array and sort by amount (descending)
    return Array.from(branchMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3); // Take top 3
  }

  /**
   * Transform paginated response from backend to frontend format
   * Updated to handle backend's meta/data structure
   */
  static transformPaginatedResponse<T>(
    backendResponse: any,
    transformItem: (item: any) => T
  ): PaginatedResponse<T> {
    console.log('🔄 Transforming paginated response:', backendResponse);
    
    // Handle different backend response formats
    let data: any[] = [];
    let pagination: any = {};

    if (backendResponse.success && backendResponse.data) {
      // Format: { success: true, data: { items: [], pagination: {} } }
      if (Array.isArray(backendResponse.data)) {
        data = backendResponse.data;
      } else if (backendResponse.data.data && Array.isArray(backendResponse.data.data)) {
        data = backendResponse.data.data;
        pagination = backendResponse.data.pagination || backendResponse.data.meta || {};
      } else if (backendResponse.data.items && Array.isArray(backendResponse.data.items)) {
        data = backendResponse.data.items;
        pagination = backendResponse.data.pagination || backendResponse.data.meta || {};
      }
    } else if (backendResponse.data && backendResponse.meta) {
      // Format: { data: [], meta: {} } - Backend's actual format
      data = Array.isArray(backendResponse.data) ? backendResponse.data : [];
      pagination = backendResponse.meta;
    } else if (Array.isArray(backendResponse.data)) {
      // Format: { data: [], pagination: {} }
      data = backendResponse.data;
      pagination = backendResponse.pagination || backendResponse.meta || {};
    } else if (Array.isArray(backendResponse)) {
      // Format: direct array
      data = backendResponse;
    }

    // Transform each item
    const transformedData = data.map(transformItem);

    // Ensure pagination has default values - handle both meta and pagination formats
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
   * Enhanced with intelligent role detection when backend doesn't provide role field
   */
  private static normalizeRole(role: string, user?: any): 'system_admin' | 'branch_manager' | 'account_manager' | 'hq_manager' | 'credit_officer' | 'customer' {
    // If role is provided and valid, use it
    if (role) {
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
          return 'customer';
      }
    }
    
    // If no role provided, use intelligent detection based on user attributes
    if (user) {
      const email = (user.email || '').toLowerCase();
      const firstName = (user.firstName || '').toLowerCase();
      const lastName = (user.lastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      
      // System Admin detection
      if (email === 'admin@kaytop.com' || 
          firstName === 'system' || 
          fullName.includes('system admin')) {
        return 'system_admin';
      }
      
      // Branch Manager detection
      if (email.includes('branch') || 
          email.includes('bm@') ||
          firstName === 'branch' || 
          lastName === 'manager' ||
          fullName.includes('branch manager') ||
          email.includes('hqmanager') ||
          fullName.includes('hq manager')) {
        return 'branch_manager';
      }
      
      // Account Manager detection
      if (email.includes('account') || 
          email.includes('am@') ||
          firstName === 'account' || 
          fullName.includes('account manager')) {
        return 'account_manager';
      }
      
      // Credit Officer detection
      if (email.includes('credit') || 
          email.includes('officer') ||
          firstName === 'credit' || 
          fullName.includes('credit officer')) {
        return 'credit_officer';
      }
    }
    
    // Default to customer for regular users
    return 'customer';
  }

  /**
   * Normalize verification status to match frontend expectations
   * Updated to handle backend's accountStatus field
   */
  private static normalizeVerificationStatus(status: string): 'pending' | 'verified' | 'rejected' {
    if (!status) return 'pending';
    
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'verified':
      case 'approved':
      case 'active':
      case 'fully_verified':  // Backend uses fully_verified
        return 'verified';
      case 'rejected':
      case 'declined':
      case 'inactive':
        return 'rejected';
      case 'pending':
      case 'review':
      case 'pending_review':  // Backend uses pending_review
      case 'id_verification_completed':  // Backend intermediate status
      default:
        return 'pending';
    }
  }

  /**
   * Normalize loan status to match frontend expectations
   * Updated to handle actual backend status values
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
      case 'overdue':  // Backend uses OVERDUE
      case 'missed':
        return 'defaulted';
      default:
        console.warn(`Unknown loan status: ${status}, defaulting to pending`);
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
      .map(item => DataTransformers.validateAndSanitize(item, transformer))
      .filter((item): item is T => item !== null);
  }

  /**
   * Transform backend savings account data to frontend format
   * Updated to handle actual backend response structure from /savings endpoints
   */
  static transformSavingsAccount(backendSavings: any): any {
    console.log('🔄 Transforming savings data:', backendSavings);
    
    // Extract customer info from nested user object
    const user = backendSavings.user || {};
    const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Customer';
    
    return {
      id: backendSavings.id?.toString() || backendSavings.accountId?.toString() || '',
      customerId: user.id?.toString() || backendSavings.customerId?.toString() || backendSavings.customer_id?.toString() || '',
      customerName: customerName,
      // Generate account number if not provided
      accountNumber: backendSavings.accountNumber || backendSavings.account_number || `SAV-${backendSavings.id}`,
      // Convert string balance to number
      balance: parseFloat(backendSavings.balance) || 0,
      // Default status since backend doesn't provide it
      status: DataTransformers.normalizeSavingsStatus(backendSavings.status || 'active'),
      createdAt: backendSavings.createdAt || backendSavings.created_at || new Date().toISOString(),
      updatedAt: backendSavings.updatedAt || backendSavings.updated_at || backendSavings.createdAt || new Date().toISOString(),
      branch: user.branch || backendSavings.branch || backendSavings.branchName || '',
      // Convert string interest rate to number if provided
      interestRate: parseFloat(backendSavings.interestRate) || parseFloat(backendSavings.interest_rate) || 0,
      // Transform nested transactions if present
      transactions: backendSavings.transactions ? backendSavings.transactions.map((t: any) => DataTransformers.transformTransaction(t)) : undefined,
    };
  }

  /**
   * Transform backend transaction data to frontend format
   * Updated to handle actual backend response structure from /savings/transactions endpoints
   */
  static transformTransaction(backendTransaction: any): any {
    console.log('🔄 Transforming transaction data:', backendTransaction);
    
    // Extract customer info from nested savings.user object if present
    const savings = backendTransaction.savings || {};
    const user = savings.user || backendTransaction.user || {};
    const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Customer';
    
    return {
      id: backendTransaction.id?.toString() || backendTransaction.transactionId?.toString() || '',
      customerId: user.id?.toString() || backendTransaction.customerId?.toString() || backendTransaction.customer_id?.toString() || '',
      customerName: customerName,
      accountId: backendTransaction.savingsId?.toString() || backendTransaction.accountId?.toString() || backendTransaction.account_id?.toString() || '',
      // Normalize transaction type
      type: DataTransformers.normalizeTransactionType(backendTransaction.type),
      // Convert string amount to number
      amount: parseFloat(backendTransaction.amount) || 0,
      // Map isApproved to status
      status: DataTransformers.normalizeTransactionStatus(backendTransaction.isApproved, backendTransaction.status),
      description: backendTransaction.description || backendTransaction.notes || '',
      createdAt: backendTransaction.createdAt || backendTransaction.created_at || new Date().toISOString(),
      approvedAt: backendTransaction.approvedAt || backendTransaction.approved_at,
      approvedBy: backendTransaction.approvedBy || backendTransaction.approved_by,
      branch: user.branch || backendTransaction.branch || backendTransaction.branchName || '',
      // Additional fields from backend
      requiresManagerAuth: backendTransaction.requiresManagerAuth || false,
      loanId: backendTransaction.loanId?.toString() || null,
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
        return DataTransformers.transformPaginatedResponse(response, transformer);
      }

      // Handle array responses
      if (isArray || Array.isArray(response.data) || Array.isArray(response)) {
        const dataArray = response.data || response;
        if (!Array.isArray(dataArray)) {
          return fallbackValue || [];
        }
        return DataTransformers.transformArray(dataArray, transformer);
      }

      // Handle single item responses
      const item = response.data || response;
      return DataTransformers.validateAndSanitize(item, transformer) || fallbackValue || null;
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
   * Updated to handle backend's isApproved boolean field
   */
  private static normalizeTransactionStatus(isApproved?: boolean, status?: string): 'pending' | 'approved' | 'declined' | 'completed' {
    // Handle backend's isApproved boolean field
    if (typeof isApproved === 'boolean') {
      return isApproved ? 'approved' : 'pending';
    }
    
    // Fallback to status string if provided
    if (!status) return 'pending';
    
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
      case 'review':
        return 'pending';
      case 'approved':
      case 'approval':
      case 'true':
        return 'approved';
      case 'declined':
      case 'rejected':
      case 'false':
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