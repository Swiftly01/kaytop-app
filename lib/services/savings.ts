/**
 * Savings Management Service
 * Handles savings deposits, withdrawals, and loan coverage transactions
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '../api/config';
import type {
  SavingsAccount,
  Transaction,
  DepositData,
  WithdrawalData,
  LoanCoverageData,
} from '../api/types';

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
}

interface TransactionResponse {
  success?: boolean;
  data?: unknown;
}

export interface SavingsService {
  recordDeposit(customerId: string, data: DepositData): Promise<Transaction>;
  recordWithdrawal(customerId: string, data: WithdrawalData): Promise<Transaction>;
  useSavingsForLoanCoverage(customerId: string, data: LoanCoverageData): Promise<Transaction>;
  approveTransaction(transactionId: string, type: 'withdrawal' | 'loan-coverage'): Promise<Transaction>;
  getCustomerSavings(customerId: string): Promise<SavingsAccount>;
  getCustomerTransactions(customerId: string, filters?: { page?: number; limit?: number; type?: string }): Promise<{ transactions: Transaction[]; pagination: { total: number; page: number; limit: number } }>;
  getAllSavingsTransactions(filters?: { page?: number; limit?: number; type?: string }): Promise<Transaction[]>;
}

class SavingsAPIService implements SavingsService {
  // Type guard for transaction-like objects
  private isTransactionLike(obj: unknown): obj is Record<string, unknown> & { id?: unknown; transactionId?: unknown; amount?: unknown } {
    return typeof obj === 'object' && obj !== null && 
           ('id' in obj || 'transactionId' in obj || 'amount' in obj);
  }

  // Type guard for savings account-like objects
  private isSavingsAccountLike(obj: unknown): obj is Record<string, unknown> & { balance?: unknown; accountNumber?: unknown } {
    return typeof obj === 'object' && obj !== null && 
           ('balance' in obj || 'accountNumber' in obj);
  }
  async recordDeposit(customerId: string, data: DepositData): Promise<Transaction> {
    try {
      const response = await apiClient.post<Transaction>(
        API_ENDPOINTS.SAVINGS.DEPOSIT(customerId),
        data
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        const transactionResponse = response as TransactionResponse;
        // Check if it's wrapped in success/data format
        if (transactionResponse.success && transactionResponse.data) {
          return transactionResponse.data as Transaction;
        }
        // Check if it's direct data format (has transaction fields)
        else if (this.isTransactionLike(response)) {
          return response as unknown as Transaction;
        }
      }

      throw new Error('Failed to record deposit - invalid response format');
    } catch (error) {
      console.error('Deposit recording error:', error);
      throw error;
    }
  }

  async recordWithdrawal(customerId: string, data: WithdrawalData): Promise<Transaction> {
    try {
      const response = await apiClient.post<Transaction>(
        API_ENDPOINTS.SAVINGS.WITHDRAW(customerId),
        data
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        const transactionResponse = response as TransactionResponse;
        // Check if it's wrapped in success/data format
        if (transactionResponse.success && transactionResponse.data) {
          return transactionResponse.data as Transaction;
        }
        // Check if it's direct data format (has transaction fields)
        else if (this.isTransactionLike(response)) {
          return response as unknown as Transaction;
        }
      }

      throw new Error('Failed to record withdrawal - invalid response format');
    } catch (error) {
      console.error('Withdrawal recording error:', error);
      throw error;
    }
  }

  async useSavingsForLoanCoverage(customerId: string, data: LoanCoverageData): Promise<Transaction> {
    try {
      const response = await apiClient.post<Transaction>(
        API_ENDPOINTS.SAVINGS.LOAN_COVERAGE(customerId),
        data
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        const transactionResponse = response as TransactionResponse;
        // Check if it's wrapped in success/data format
        if (transactionResponse.success && transactionResponse.data) {
          return transactionResponse.data as Transaction;
        }
        // Check if it's direct data format (has transaction fields)
        else if (this.isTransactionLike(response)) {
          return response as unknown as Transaction;
        }
      }

      throw new Error('Failed to use savings for loan coverage - invalid response format');
    } catch (error) {
      console.error('Loan coverage error:', error);
      throw error;
    }
  }

  async approveTransaction(transactionId: string, type: 'withdrawal' | 'loan-coverage'): Promise<Transaction> {
    try {
      const endpoint = type === 'withdrawal' 
        ? API_ENDPOINTS.SAVINGS.APPROVE_WITHDRAWAL(transactionId)
        : API_ENDPOINTS.SAVINGS.APPROVE_LOAN_COVERAGE(transactionId);

      const response = await apiClient.post<Transaction>(endpoint);

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        const transactionResponse = response as TransactionResponse;
        // Check if it's wrapped in success/data format
        if (transactionResponse.success && transactionResponse.data) {
          return transactionResponse.data as Transaction;
        }
        // Check if it's direct data format (has transaction fields)
        else if (this.isTransactionLike(response)) {
          return response as unknown as Transaction;
        }
      }

      throw new Error('Failed to approve transaction - invalid response format');
    } catch (error) {
      console.error('Transaction approval error:', error);
      throw error;
    }
  }

  async getCustomerSavings(customerId: string): Promise<SavingsAccount> {
    try {
      const response = await apiClient.get<SavingsAccount>(
        API_ENDPOINTS.SAVINGS.CUSTOMER_SAVINGS(customerId)
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        const transactionResponse = response as TransactionResponse;
        // Check if it's wrapped in success/data format
        if (transactionResponse.success && transactionResponse.data) {
          return transactionResponse.data as SavingsAccount;
        }
        // Check if it's direct data format (has savings fields)
        else if (this.isSavingsAccountLike(response)) {
          return response as unknown as SavingsAccount;
        }
      }

      throw new Error('Failed to fetch customer savings - invalid response format');
    } catch (error) {
      console.error('Customer savings fetch error:', error);
      throw error;
    }
  }

  async getCustomerTransactions(customerId: string, filters: { page?: number; limit?: number; type?: string } = {}): Promise<{ transactions: Transaction[]; pagination: { total: number; page: number; limit: number } }> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.type) params.append('type', filters.type);

      const url = `${API_ENDPOINTS.SAVINGS.CUSTOMER_SAVINGS(customerId)}/transactions${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<any>(url);

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if ((response as any).success && (response as any).data) {
          return (response as any).data;
        }
        // Check if it's direct data format (has transactions and pagination)
        else if ((response as any).transactions && Array.isArray((response as any).transactions)) {
          return response as any;
        }
        // Check if it's just an array of transactions
        else if (Array.isArray(response)) {
          return {
            transactions: response,
            pagination: {
              total: response.length,
              page: filters.page || 1,
              limit: filters.limit || 50
            }
          };
        }
      }

      throw new Error('Failed to fetch customer transactions - invalid response format');
    } catch (error) {
      console.error('Customer transactions fetch error:', error);
      throw error;
    }
  }

  async getAllSavingsTransactions(filters: { page?: number; limit?: number; type?: string } = {}): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.type) params.append('type', filters.type);

      const url = `${API_ENDPOINTS.SAVINGS.ALL_TRANSACTIONS}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<any>(url);

      // Extract data from Axios response
      const data = response.data || response;

      // Log the actual response structure for debugging
      console.log('Savings transactions API response structure:', {
        hasData: !!data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        keys: data && typeof data === 'object' ? Object.keys(data) : [],
        sampleData: data && typeof data === 'object' ? JSON.stringify(data).substring(0, 200) + '...' : data
      });

      // Handle null or undefined data first
      if (data === null || data === undefined) {
        console.warn('Savings transactions API returned null/undefined data');
        return [];
      }

      // Handle empty object response early
      if (data && typeof data === 'object' && Object.keys(data).length === 0) {
        console.warn('Savings transactions API returned empty object - no transactions available');
        return [];
      }

      // Backend returns direct data format, not wrapped in success/data
      if (data && typeof data === 'object') {
        // Check if it's wrapped in success/data format
        if ((data as any).success && (data as any).data) {
          const responseData = (data as any).data;
          return Array.isArray(responseData) ? responseData : responseData.transactions || [];
        }
        // Check if it's direct data format (has transactions array)
        else if (data.transactions && Array.isArray(data.transactions)) {
          return data.transactions;
        }
        // Check if it's just an array of transactions
        else if (Array.isArray(data)) {
          return data;
        }
      }

      // Log the response format for debugging (but not as an error since empty responses are valid)
      console.warn('Unhandled savings transactions response format (returning empty array):', {
        data,
        type: typeof data,
        isArray: Array.isArray(data),
        keys: data && typeof data === 'object' ? Object.keys(data) : []
      });

      // Return empty array to prevent page crashes - this is a safe fallback
      return [];
    } catch (error) {
      console.error('All savings transactions fetch error:', error);
      
      // If it's a network error or API is down, return empty array instead of throwing
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || 
            error.message.includes('timeout') || 
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('invalid response format')) {
          console.warn('API error fetching savings transactions, returning empty array:', error.message);
          return [];
        }
      }
      
      // For any other errors, also return empty array to prevent page crashes
      console.warn('Unexpected error fetching savings transactions, returning empty array:', error);
      return [];
    }
  }
}

// Export singleton instance
export const savingsService = new SavingsAPIService();
