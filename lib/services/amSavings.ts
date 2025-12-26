import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { transformSavingsData, transformTransactionData } from '@/lib/api/transformers';

export interface SavingsAccount {
  id: string;
  customerId: string;
  customerName: string;
  accountNumber: string;
  balance: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  branch?: string;
  interestRate?: number;
}

export interface SavingsTransaction {
  id: string;
  customerId: string;
  customerName: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'loan_coverage';
  amount: number;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  description?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  branch?: string;
}

export interface WithdrawalApprovalRequest {
  action: 'approve' | 'decline';
  notes?: string;
  amount?: number;
}

export interface SavingsFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  branch?: string;
  customerId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface SavingsSummary {
  totalAccounts: number;
  totalBalance: number;
  activeAccounts: number;
  pendingTransactions: number;
  monthlyDeposits: number;
  monthlyWithdrawals: number;
}

/**
 * AM Savings Service
 * Handles all savings-related operations for Account Managers
 */
export class AMSavingsService {
  /**
   * Get all savings accounts with filtering and pagination
   */
  static async getSavingsAccounts(filters: SavingsFilters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.customerId) params.append('customerId', filters.customerId);

      const queryString = params.toString();
      const endpoint = queryString 
        ? `${API_ENDPOINTS.AM.SAVINGS}?${queryString}`
        : API_ENDPOINTS.AM.SAVINGS;

      const response = await apiClient.get(endpoint);
      
      return {
        data: response.data?.data?.map(transformSavingsData) || [],
        pagination: response.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        },
        summary: response.data?.summary || this.getDefaultSummary()
      };
    } catch (error) {
      console.error('Error fetching savings accounts:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        summary: this.getDefaultSummary()
      };
    }
  }

  /**
   * Get all savings transactions with filtering and pagination
   */
  static async getSavingsTransactions(filters: SavingsFilters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.customerId) params.append('customerId', filters.customerId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const endpoint = queryString 
        ? `${API_ENDPOINTS.AM.SAVINGS_TRANSACTIONS}?${queryString}`
        : API_ENDPOINTS.AM.SAVINGS_TRANSACTIONS;

      const response = await apiClient.get(endpoint);
      
      return {
        data: response.data?.data?.map(transformTransactionData) || [],
        pagination: response.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Error fetching savings transactions:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    }
  }

  /**
   * Get customer savings details
   */
  static async getCustomerSavings(customerId: string) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.AM.CUSTOMER_SAVINGS(customerId)
      );
      
      return {
        account: transformSavingsData(response.data?.account || {}),
        transactions: response.data?.transactions?.map(transformTransactionData) || [],
        summary: response.data?.summary || {
          totalBalance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          pendingTransactions: 0
        }
      };
    } catch (error) {
      console.error('Error fetching customer savings:', error);
      return {
        account: null,
        transactions: [],
        summary: {
          totalBalance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          pendingTransactions: 0
        }
      };
    }
  }

  /**
   * Approve or decline withdrawal request
   */
  static async approveWithdrawal(
    transactionId: string, 
    request: WithdrawalApprovalRequest
  ) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AM.APPROVE_WITHDRAWAL(transactionId),
        request
      );
      
      return {
        success: true,
        data: response.data,
        message: request.action === 'approve' 
          ? 'Withdrawal approved successfully'
          : 'Withdrawal declined successfully'
      };
    } catch (error) {
      console.error('Error processing withdrawal approval:', error);
      throw error;
    }
  }

  /**
   * Approve loan coverage request
   */
  static async approveLoanCoverage(
    transactionId: string, 
    request: WithdrawalApprovalRequest
  ) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AM.APPROVE_LOAN_COVERAGE(transactionId),
        request
      );
      
      return {
        success: true,
        data: response.data,
        message: request.action === 'approve' 
          ? 'Loan coverage approved successfully'
          : 'Loan coverage declined successfully'
      };
    } catch (error) {
      console.error('Error processing loan coverage approval:', error);
      throw error;
    }
  }

  /**
   * Get savings statistics and summary
   */
  static async getSavingsSummary(filters: { branch?: string; startDate?: string; endDate?: string } = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const endpoint = queryString 
        ? `${API_ENDPOINTS.AM.SAVINGS_SUMMARY}?${queryString}`
        : API_ENDPOINTS.AM.SAVINGS_SUMMARY;

      const response = await apiClient.get(endpoint);
      
      return response.data || this.getDefaultSummary();
    } catch (error) {
      console.error('Error fetching savings summary:', error);
      return this.getDefaultSummary();
    }
  }

  /**
   * Get default summary for fallback
   */
  private static getDefaultSummary(): SavingsSummary {
    return {
      totalAccounts: 0,
      totalBalance: 0,
      activeAccounts: 0,
      pendingTransactions: 0,
      monthlyDeposits: 0,
      monthlyWithdrawals: 0
    };
  }
}

export default AMSavingsService;