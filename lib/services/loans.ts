/**
 * Loan Management Service
 * Handles loan CRUD operations, disbursements, and repayments
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '../api/config';
import type {
  Loan,
  CreateLoanData,
  RepaymentData,
  LoanSummary,
  DisbursementSummary,
} from '../api/types';
import { isSuccessResponse } from '../utils/responseHelpers';

export interface LoanService {
  createLoan(customerId: string, data: CreateLoanData): Promise<Loan>;
  disburseLoan(loanId: string, proof: File): Promise<Loan>;
  recordRepayment(loanId: string, data: RepaymentData): Promise<Loan>;
  getLoanSummary(customerId: string): Promise<LoanSummary>;
  getDisbursementSummary(customerId: string): Promise<DisbursementSummary>;
  getCustomerLoans(customerId: string): Promise<Loan[]>;
  getAllLoans(): Promise<Loan[]>;
}

class LoanAPIService implements LoanService {
  // Type guard for loan-like objects
  private isLoanLike(obj: unknown): obj is Record<string, unknown> & { id?: unknown; loanId?: unknown; customerId?: unknown } {
    return typeof obj === 'object' && obj !== null && 
           ('id' in obj || 'loanId' in obj || 'customerId' in obj);
  }

  // Type guard for repayment-like objects
  private isRepaymentLike(obj: unknown): obj is Record<string, unknown> & { id?: unknown; amount?: unknown; loanId?: unknown } {
    return typeof obj === 'object' && obj !== null && 
           ('id' in obj || 'amount' in obj || 'loanId' in obj);
  }

  // Type guard for loan summary-like objects
  private isLoanSummaryLike(obj: unknown): obj is Record<string, unknown> & { totalLoans?: unknown; activeLoans?: unknown } {
    return typeof obj === 'object' && obj !== null && 
           ('totalLoans' in obj || 'activeLoans' in obj);
  }

  // Type guard for disbursement summary-like objects
  private isDisbursementSummaryLike(obj: unknown): obj is Record<string, unknown> & { totalDisbursed?: unknown; pendingDisbursements?: unknown } {
    return typeof obj === 'object' && obj !== null && 
           ('totalDisbursed' in obj || 'pendingDisbursements' in obj);
  }
  async createLoan(customerId: string, data: CreateLoanData): Promise<Loan> {
    try {
      const response = await apiClient.post<Loan>(
        API_ENDPOINTS.LOANS.CREATE(customerId),
        data
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (isSuccessResponse(response)) {
          return response.data;
        }
        // Check if it's direct data format (has loan fields)
        else if (this.isLoanLike(response)) {
          return response as unknown as Loan;
        }
      }

      throw new Error('Failed to create loan - invalid response format');
    } catch (error) {
      console.error('Loan creation error:', error);
      throw error;
    }
  }

  async disburseLoan(loanId: string, proof: File): Promise<Loan> {
    try {
      const formData = new FormData();
      formData.append('proof', proof);

      const response = await apiClient.put<Loan>(
        API_ENDPOINTS.LOANS.DISBURSE(loanId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (isSuccessResponse(response)) {
          return response.data;
        }
        // Check if it's direct data format (has loan fields)
        else if (this.isLoanLike(response)) {
          return response as unknown as Loan;
        }
      }

      throw new Error('Failed to disburse loan - invalid response format');
    } catch (error) {
      console.error('Loan disbursement error:', error);
      throw error;
    }
  }

  async recordRepayment(loanId: string, data: RepaymentData): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('amount', data.amount.toString());
      formData.append('paymentDate', data.paymentDate);
      formData.append('proof', data.proof);

      const response = await apiClient.post(
        API_ENDPOINTS.LOANS.REPAYMENTS(loanId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (isSuccessResponse(response)) {
          return response.data;
        }
        // Check if it's direct data format (has repayment fields)
        else if (this.isRepaymentLike(response)) {
          return response as unknown as Loan;
        }
      }

      throw new Error('Failed to record repayment - invalid response format');
    } catch (error) {
      console.error('Repayment recording error:', error);
      throw error;
    }
  }

  async getLoanSummary(customerId: string): Promise<LoanSummary> {
    try {
      const response = await apiClient.get<LoanSummary>(
        API_ENDPOINTS.LOANS.LOAN_SUMMARY(customerId)
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (isSuccessResponse(response)) {
          return response.data;
        }
        // Check if it's direct data format (has summary fields)
        else if ((response as any).totalLoans !== undefined || (response as any).activeLoans !== undefined) {
          return response as unknown as LoanSummary;
        }
      }

      throw new Error('Failed to fetch loan summary - invalid response format');
    } catch (error) {
      console.error('Loan summary fetch error:', error);
      throw error;
    }
  }

  async getDisbursementSummary(customerId: string): Promise<DisbursementSummary> {
    try {
      const response = await apiClient.get<DisbursementSummary>(
        API_ENDPOINTS.LOANS.DISBURSEMENT_SUMMARY(customerId)
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (isSuccessResponse(response)) {
          return response.data;
        }
        // Check if it's direct data format (has disbursement fields)
        else if ((response as any).totalDisbursed !== undefined || (response as any).pendingDisbursements !== undefined) {
          return response as unknown as DisbursementSummary;
        }
      }

      throw new Error('Failed to fetch disbursement summary - invalid response format');
    } catch (error) {
      console.error('Disbursement summary fetch error:', error);
      throw error;
    }
  }

  async getCustomerLoans(customerId: string): Promise<Loan[]> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.LOANS.CUSTOMER_LOANS(customerId)
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (isSuccessResponse(response)) {
          return response.data;
        }
        // Check if it's direct array format (loans list)
        else if (Array.isArray(response)) {
          return response;
        }
      }

      throw new Error('Failed to fetch customer loans - invalid response format');
    } catch (error) {
      console.error('Customer loans fetch error:', error);
      throw error;
    }
  }

  async getLoanRepayments(loanId: string): Promise<RepaymentData[]> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.LOANS.REPAYMENTS(loanId)
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (isSuccessResponse(response)) {
          return response.data;
        }
        // Check if it's direct array format (repayments list)
        else if (Array.isArray(response)) {
          return response;
        }
      }

      throw new Error('Failed to fetch loan repayments - invalid response format');
    } catch (error) {
      console.error('Loan repayments fetch error:', error);
      throw error;
    }
  }

  async getAllLoans(): Promise<Loan[]> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.LOANS.ALL);

      // Extract data from Axios response
      const data = response.data || response;

      // Backend returns direct data format, not wrapped in success/data
      if (data && typeof data === 'object') {
        // Check if it's wrapped in success/data format
        if ((data as any).success && (data as any).data) {
          return (data as any).data;
        }
        // Check if it's direct array format (loans list)
        else if (Array.isArray(data)) {
          return data;
        }
      }

      throw new Error('Failed to fetch all loans - invalid response format');
    } catch (error) {
      console.error('All loans fetch error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const loanService = new LoanAPIService();
