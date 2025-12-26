/**
 * Unified Savings Service
 */

import { unifiedApiClient } from '../api/client';
import type {
  SavingsAccount,
  Transaction,
  PaginatedResponse,
  ApiResponse,
} from '../api/types';

export interface SavingsFilterParams {
  branch?: string;
  status?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionFilterParams {
  accountId?: string;
  type?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface WithdrawalApprovalRequest {
  action: 'approve' | 'decline';
  notes?: string;
  amount?: number;
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

class UnifiedSavingsAPIService {
  async getSavingsAccounts(params?: SavingsFilterParams): Promise<PaginatedResponse<SavingsAccount> & { summary?: any }> {
    const queryParams = new URLSearchParams();
    
    if (params?.branch) queryParams.append('branch', params.branch);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/savings/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response: ApiResponse<PaginatedResponse<SavingsAccount> & { summary?: any }> = await unifiedApiClient.get(endpoint);
    return response.data;
  }

  async getCustomerSavings(customerId: string): Promise<SavingsAccount> {
    const response: ApiResponse<SavingsAccount> = await unifiedApiClient.get(`/savings/customer/${customerId}`);
    return response.data;
  }

  async getSavingsTransactions(params?: TransactionFilterParams): Promise<PaginatedResponse<SavingsTransaction> & { summary?: any }> {
    const queryParams = new URLSearchParams();
    
    if (params?.accountId) queryParams.append('accountId', params.accountId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/savings/transactions/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response: ApiResponse<PaginatedResponse<SavingsTransaction> & { summary?: any }> = await unifiedApiClient.get(endpoint);
    return response.data;
  }

  async approveWithdrawal(transactionId: string): Promise<Transaction> {
    const response: ApiResponse<Transaction> = await unifiedApiClient.post(`/savings/transactions/${transactionId}/approve-withdraw`);
    return response.data;
  }

  async approveLoanCoverage(transactionId: string): Promise<Transaction> {
    const response: ApiResponse<Transaction> = await unifiedApiClient.post(`/savings/transactions/${transactionId}/approve-loan-coverage`);
    return response.data;
  }

  async depositToCustomer(customerId: string, amount: number, description: string): Promise<Transaction> {
    const response: ApiResponse<Transaction> = await unifiedApiClient.post(`/savings/customer/${customerId}/deposit`, {
      amount,
      description
    });
    return response.data;
  }

  async withdrawFromCustomer(customerId: string, amount: number, description: string): Promise<Transaction> {
    const response: ApiResponse<Transaction> = await unifiedApiClient.post(`/savings/customer/${customerId}/withdraw`, {
      amount,
      description
    });
    return response.data;
  }
}

export const unifiedSavingsService = new UnifiedSavingsAPIService();