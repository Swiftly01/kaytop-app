/**
 * Account Manager Loans Service
 * Handles AM-specific loan pipeline management and operations
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { DataTransformers } from '../api/transformers';
import { APIErrorHandler } from '../api/errorHandler';
import type {
  Loan,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '../api/types';

export interface AMLoanFilterParams extends PaginationParams {
  status?: 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'overdue';
  stage?: 'inquiry' | 'documentation' | 'review' | 'approval' | 'disbursement';
  branch?: string;
  creditOfficer?: string;
  customerId?: string;
  search?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface AMLoanApproval {
  id: string;
  loanId: string;
  approvedBy: string;
  approvedAt: string;
  approvalNotes?: string;
  conditions?: string[];
}

export interface AMLoanPipelineSummary {
  totalApplications: number;
  pendingReview: number;
  inDocumentation: number;
  awaitingApproval: number;
  readyForDisbursement: number;
  totalValue: number;
  averageAmount: number;
  conversionRate: number;
}

export interface AMLoansService {
  getLoans(params?: AMLoanFilterParams): Promise<PaginatedResponse<Loan>>;
  getLoanById(id: string): Promise<Loan>;
  updateLoanStage(id: string, stage: string, notes?: string): Promise<Loan>;
  approveLoan(id: string, notes?: string, conditions?: string[]): Promise<AMLoanApproval>;
  declineLoan(id: string, reason: string, notes?: string): Promise<any>;
  getPipelineSummary(): Promise<AMLoanPipelineSummary>;
  getLoansByCustomer(customerId: string, params?: PaginationParams): Promise<PaginatedResponse<Loan>>;
  getLoanApplications(params?: AMLoanFilterParams): Promise<PaginatedResponse<any>>;
}

class AMLoansAPIService implements AMLoansService {
  async getLoans(params?: AMLoanFilterParams): Promise<PaginatedResponse<Loan>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      
      if (params?.stage) {
        queryParams.append('stage', params.stage);
      }
      
      if (params?.branch) {
        queryParams.append('branch', params.branch);
      }
      
      if (params?.creditOfficer) {
        queryParams.append('creditOfficer', params.creditOfficer);
      }
      
      if (params?.customerId) {
        queryParams.append('customerId', params.customerId);
      }
      
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      
      if (params?.amountMin) {
        queryParams.append('amountMin', params.amountMin.toString());
      }
      
      if (params?.amountMax) {
        queryParams.append('amountMax', params.amountMax.toString());
      }
      
      if (params?.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom);
      }
      
      if (params?.dateTo) {
        queryParams.append('dateTo', params.dateTo);
      }
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.AM.LOANS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('🔄 Fetching loans from:', url);
      
      const response = await apiClient.get<any>(url);

      // Handle different response formats from the backend
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          if (response.data.loans && Array.isArray(response.data.loans)) {
            // AM API format: { success: true, data: { loans: [], pagination: {} } }
            return {
              data: response.data.loans,
              pagination: response.data.pagination || this.createDefaultPagination(response.data.loans.length, params)
            };
          } else if (Array.isArray(response.data)) {
            // Direct array in data: { success: true, data: [] }
            return this.createPaginatedResponse(response.data, response.data.length, params);
          }
        }
        // Check if it's direct array format (loans list)
        else if (Array.isArray(response)) {
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return DataTransformers.transformPaginatedResponse(response, DataTransformers.transformLoan);
        }
      }

      // Fallback: return empty result
      console.warn('⚠️ Unexpected loans response format, returning empty result');
      return this.createPaginatedResponse([], 0, params);
    } catch (error) {
      console.error('❌ AM Loans fetch error:', error);
      const errorMessage = APIErrorHandler.handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async getLoanById(id: string): Promise<Loan> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.AM.LOAN_BY_ID(id));

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return DataTransformers.transformLoan(response.data);
        }
        // Check if it's direct data format (has loan fields)
        else if (response.id || response.loanId || response.amount) {
          return DataTransformers.transformLoan(response);
        }
      }

      throw new Error('Failed to fetch AM loan details - invalid response format');
    } catch (error) {
      console.error('❌ AM Loan details fetch error:', error);
      const errorMessage = APIErrorHandler.handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async updateLoanStage(id: string, stage: string, notes?: string): Promise<Loan> {
    try {
      const data = {
        stage,
        notes,
        updatedAt: new Date().toISOString()
      };

      const response = await apiClient.put<any>(API_ENDPOINTS.AM.LOAN_BY_ID(id), data);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has loan fields)
        else if (response.id || response.loanId || response.amount) {
          return response as unknown as Loan;
        }
      }

      throw new Error('Failed to update AM loan stage - invalid response format');
    } catch (error) {
      console.error('AM Loan stage update error:', error);
      throw error;
    }
  }

  async approveLoan(id: string, notes?: string, conditions?: string[]): Promise<AMLoanApproval> {
    try {
      const data = {
        status: 'approved',
        approvalNotes: notes,
        conditions,
        approvedAt: new Date().toISOString()
      };

      const response = await apiClient.post<any>(`${API_ENDPOINTS.AM.LOAN_BY_ID(id)}/approve`, data);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format
        else if (response.id || response.loanId) {
          return response as unknown as AMLoanApproval;
        }
      }

      throw new Error('Failed to approve AM loan - invalid response format');
    } catch (error) {
      console.error('AM Loan approval error:', error);
      throw error;
    }
  }

  async declineLoan(id: string, reason: string, notes?: string): Promise<any> {
    try {
      const data = {
        status: 'declined',
        declineReason: reason,
        declineNotes: notes,
        declinedAt: new Date().toISOString()
      };

      const response = await apiClient.post<any>(`${API_ENDPOINTS.AM.LOAN_BY_ID(id)}/decline`, data);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format
        else if (response.id || response.loanId) {
          return response;
        }
      }

      throw new Error('Failed to decline AM loan - invalid response format');
    } catch (error) {
      console.error('AM Loan decline error:', error);
      throw error;
    }
  }

  async getPipelineSummary(): Promise<AMLoanPipelineSummary> {
    try {
      const response = await apiClient.get<any>(`${API_ENDPOINTS.AM.LOANS}/pipeline-summary`);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format
        else if (response.totalApplications !== undefined) {
          return response as unknown as AMLoanPipelineSummary;
        }
      }

      throw new Error('Failed to fetch AM pipeline summary - invalid response format');
    } catch (error) {
      console.error('AM Pipeline summary fetch error:', error);
      throw error;
    }
  }

  async getLoansByCustomer(customerId: string, params?: PaginationParams): Promise<PaginatedResponse<Loan>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.AM.LOANS}/customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format
        else if (Array.isArray(response)) {
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response as unknown as PaginatedResponse<Loan>;
        }
      }

      throw new Error('Failed to fetch customer loans - invalid response format');
    } catch (error) {
      console.error('Customer loans fetch error:', error);
      throw error;
    }
  }

  async getLoanApplications(params?: AMLoanFilterParams): Promise<PaginatedResponse<any>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.stage) {
        queryParams.append('stage', params.stage);
      }
      
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.AM.LOANS}/applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format
        else if (Array.isArray(response)) {
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response as unknown as PaginatedResponse<any>;
        }
      }

      throw new Error('Failed to fetch loan applications - invalid response format');
    } catch (error) {
      console.error('Loan applications fetch error:', error);
      throw error;
    }
  }

  // Helper function to create paginated response structure
  private createPaginatedResponse<T>(data: T[], total: number, params?: { page?: number; limit?: number }): PaginatedResponse<T> {
    const page = parseInt(params?.page?.toString() || '1');
    const limit = parseInt(params?.limit?.toString() || '10');
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Helper function to create default pagination
  private createDefaultPagination(total: number, params?: { page?: number; limit?: number }) {
    const page = parseInt(params?.page?.toString() || '1');
    const limit = parseInt(params?.limit?.toString() || '10');
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
}

// Export singleton instance
export const amLoansService = new AMLoansAPIService();