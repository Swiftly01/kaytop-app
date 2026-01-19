/**
 * Unified Loan Service
 */

import apiClient from '@/lib/apiClient';
import type {
  Loan,
  PaginatedResponse,
  ApiResponse,
  CreateLoanData,
} from '../api/types';

export interface LoanFilterParams {
  status?: string;
  branch?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class UnifiedLoanAPIService {
  async getLoans(params?: LoanFilterParams): Promise<PaginatedResponse<Loan>> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.branch) queryParams.append('branch', params.branch);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/loans/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response: ApiResponse<PaginatedResponse<Loan>> = await apiClient.get(endpoint);
    return response.data;
  }

  async getLoanById(id: string): Promise<Loan> {
    const response: ApiResponse<Loan> = await apiClient.get(`/loans/${id}`);
    return response.data;
  }

  async getCustomerLoans(customerId: string): Promise<PaginatedResponse<Loan>> {
    const response: ApiResponse<PaginatedResponse<Loan>> = await apiClient.get(`/loans/customer/${customerId}`);
    return response.data;
  }

  async getDisbursedLoans(params?: LoanFilterParams): Promise<PaginatedResponse<Loan>> {
    const queryParams = new URLSearchParams();
    
    if (params?.branch) queryParams.append('branch', params.branch);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/loans/disbursed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response: ApiResponse<PaginatedResponse<Loan>> = await apiClient.get(endpoint);
    return response.data;
  }

  async getRecollections(params?: LoanFilterParams): Promise<PaginatedResponse<Loan>> {
    const queryParams = new URLSearchParams();
    
    if (params?.branch) queryParams.append('branch', params.branch);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/loans/recollections${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response: ApiResponse<PaginatedResponse<Loan>> = await apiClient.get(endpoint);
    return response.data;
  }

  async getMissedPayments(params?: LoanFilterParams): Promise<PaginatedResponse<Loan>> {
    const queryParams = new URLSearchParams();
    
    if (params?.branch) queryParams.append('branch', params.branch);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/loans/missed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response: ApiResponse<PaginatedResponse<Loan>> = await apiClient.get(endpoint);
    return response.data;
  }

  /**
   * Create new loan for customer
   */
  async createLoan(customerId: string, loanData: CreateLoanData): Promise<Loan> {
    const response: ApiResponse<Loan> = await apiClient.post(`/loans/customer/${customerId}`, loanData);
    return response.data;
  }

  /**
   * Disburse loan
   */
  async disburseLoan(loanId: string): Promise<Loan> {
    const response: ApiResponse<Loan> = await apiClient.post(`/loans/${loanId}/disburse`);
    return response.data;
  }

  /**
   * Get loan repayments
   */
  async getLoanRepayments(loanId: string): Promise<any[]> {
    const response: ApiResponse<any[]> = await apiClient.get(`/loans/${loanId}/repayments`);
    return response.data;
  }

  /**
   * Get loan summary for customer
   */
  async getLoanSummary(customerId: string): Promise<any> {
    const response: ApiResponse<any> = await apiClient.get(`/loans/customer/${customerId}/loan-summary`);
    return response.data;
  }

  /**
   * Get disbursement summary for customer
   */
  async getDisbursementSummary(customerId: string): Promise<any> {
    const response: ApiResponse<any> = await apiClient.get(`/loans/customer/${customerId}/disbursement-summary`);
    return response.data;
  }

  /**
   * Approve loan
   */
  async approveLoan(id: string, notes?: string, conditions?: string[]): Promise<any> {
    const response: ApiResponse<any> = await apiClient.post(`/loans/${id}/approve`, {
      notes,
      conditions
    });
    return response.data;
  }

  /**
   * Decline loan
   */
  async declineLoan(id: string, reason: string, notes?: string): Promise<any> {
    const response: ApiResponse<any> = await apiClient.post(`/loans/${id}/decline`, {
      reason,
      notes
    });
    return response.data;
  }

  /**
   * Update loan stage
   */
  async updateLoanStage(id: string, stage: string, notes?: string): Promise<Loan> {
    const response: ApiResponse<Loan> = await apiClient.put(`/loans/${id}/stage`, {
      stage,
      notes
    });
    return response.data;
  }
}

export const unifiedLoanService = new UnifiedLoanAPIService();
