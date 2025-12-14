/**
 * Loan Management Service
 * Handles loan CRUD operations, disbursements, and repayments
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import type {
  Loan,
  CreateLoanData,
  RepaymentData,
  LoanSummary,
  DisbursementSummary,
} from '../api/types';

export interface LoanService {
  createLoan(customerId: string, data: CreateLoanData): Promise<Loan>;
  disburseLoan(loanId: string, proof: File): Promise<Loan>;
  recordRepayment(loanId: string, data: RepaymentData): Promise<any>;
  getLoanSummary(customerId: string): Promise<LoanSummary>;
  getDisbursementSummary(customerId: string): Promise<DisbursementSummary>;
  getCustomerLoans(customerId: string): Promise<Loan[]>;
}

class LoanAPIService implements LoanService {
  async createLoan(customerId: string, data: CreateLoanData): Promise<Loan> {
    try {
      const response = await apiClient.post<Loan>(
        API_ENDPOINTS.LOANS.CREATE(customerId),
        data
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create loan');
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

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to disburse loan');
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

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to record repayment');
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

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch loan summary');
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

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch disbursement summary');
    } catch (error) {
      console.error('Disbursement summary fetch error:', error);
      throw error;
    }
  }

  async getCustomerLoans(customerId: string): Promise<Loan[]> {
    try {
      const response = await apiClient.get<Loan[]>(
        API_ENDPOINTS.LOANS.CUSTOMER_LOANS(customerId)
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch customer loans');
    } catch (error) {
      console.error('Customer loans fetch error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const loanService = new LoanAPIService();