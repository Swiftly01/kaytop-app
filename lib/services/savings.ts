/**
 * Savings Management Service
 * Handles savings deposits, withdrawals, and loan coverage transactions
 */

import { apiClient } from '../api/client';
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
}

class SavingsAPIService implements SavingsService {
  async recordDeposit(customerId: string, data: DepositData): Promise<Transaction> {
    try {
      const response = await apiClient.post<Transaction>(
        API_ENDPOINTS.SAVINGS.DEPOSIT(customerId),
        data
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to record deposit');
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

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to record withdrawal');
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

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to use savings for loan coverage');
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

      const response = await apiClient.put<Transaction>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to approve transaction');
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

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch customer savings');
    } catch (error) {
      console.error('Customer savings fetch error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const savingsService = new SavingsAPIService();