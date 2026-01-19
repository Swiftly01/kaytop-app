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

export interface SavingsService {
  recordDeposit(customerId: string, data: DepositData): Promise<Transaction>;
  recordWithdrawal(customerId: string, data: WithdrawalData): Promise<Transaction>;
  useSavingsForLoanCoverage(customerId: string, data: LoanCoverageData): Promise<Transaction>;
  approveTransaction(transactionId: string, type: 'withdrawal' | 'loan-coverage'): Promise<Transaction>;
  getCustomerSavings(customerId: string): Promise<SavingsAccount>;
  getCustomerTransactions(customerId: string, filters?: { page?: number; limit?: number; type?: string }): Promise<{ transactions: Transaction[]; pagination: { total: number; page: number; limit: number } }>;
}

class SavingsAPIService implements SavingsService {
  async recordDeposit(customerId: string, data: DepositData): Promise<Transaction> {
    try {
      const response = await apiClient.post<Transaction>(
        API_ENDPOINTS.SAVINGS.DEPOSIT(customerId),
        data
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if ((response as any).success && (response as any).data) {
          return (response as any).data;
        }
        // Check if it's direct data format (has transaction fields)
        else if ((response as any).id || (response as any).transactionId || (response as any).amount) {
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
        // Check if it's wrapped in success/data format
        if ((response as any).success && (response as any).data) {
          return (response as any).data;
        }
        // Check if it's direct data format (has transaction fields)
        else if ((response as any).id || (response as any).transactionId || (response as any).amount) {
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
        // Check if it's wrapped in success/data format
        if ((response as any).success && (response as any).data) {
          return (response as any).data;
        }
        // Check if it's direct data format (has transaction fields)
        else if ((response as any).id || (response as any).transactionId || (response as any).amount) {
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
        // Check if it's wrapped in success/data format
        if ((response as any).success && (response as any).data) {
          return (response as any).data;
        }
        // Check if it's direct data format (has transaction fields)
        else if ((response as any).id || (response as any).transactionId || (response as any).amount) {
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
        // Check if it's wrapped in success/data format
        if ((response as any).success && (response as any).data) {
          return (response as any).data;
        }
        // Check if it's direct data format (has savings fields)
        else if ((response as any).id || (response as any).customerId || (response as any).balance !== undefined) {
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
}

// Export singleton instance
export const savingsService = new SavingsAPIService();
