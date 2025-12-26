/**
 * Account Manager Branch Service
 * Handles AM-specific branch operations, reports, and oversight
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import type {
  PaginatedResponse,
  PaginationParams,
} from '../api/types';

export interface AMBranch {
  id: string;
  name: string;
  code: string;
  address: string;
  state: string;
  region: string;
  manager?: string;
  managerId?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  dateCreated: string;
  createdAt: string;
  updatedAt: string;
}

export interface AMBranchStatistics {
  totalCreditOfficers: number;
  totalCustomers: number;
  activeLoans: number;
  loansProcessed: number;
  creditOfficersGrowth: number;
  customersGrowth: number;
  activeLoansGrowth: number;
  loansProcessedGrowth: number;
}

export interface AMBranchDetails extends AMBranch {
  statistics: AMBranchStatistics;
}

export interface AMReport {
  id: string;
  reportId: string;
  creditOfficer: string;
  creditOfficerId: string;
  branchName: string;
  branchId: string;
  status: 'pending' | 'approved' | 'declined' | 'missed';
  dateDue?: string;
  dateSubmitted?: string;
  timeSent?: string;
  loansDisburse: number;
  loansValueDisbursed: number;
  savingsCollected: number;
  repaymentsCollected: number;
  notes?: string;
}

export interface AMReportApprovalData {
  action: 'approve' | 'decline';
  notes?: string;
  reason?: string;
}

export interface AMBranchService {
  getAllBranches(params?: PaginationParams): Promise<PaginatedResponse<AMBranch>>;
  getBranchById(id: string): Promise<AMBranchDetails>;
  getBranchStatistics(id: string): Promise<AMBranchStatistics>;
  getBranchReports(id: string, params?: PaginationParams): Promise<PaginatedResponse<AMReport>>;
  getBranchMissedReports(id: string, params?: PaginationParams): Promise<PaginatedResponse<AMReport>>;
  getBranchCreditOfficers(id: string, params?: PaginationParams): Promise<PaginatedResponse<any>>;
  approveReport(reportId: string, data: AMReportApprovalData): Promise<void>;
  declineReport(reportId: string, data: AMReportApprovalData): Promise<void>;
  getReportById(reportId: string): Promise<AMReport>;
}

class AMBranchAPIService implements AMBranchService {
  async getAllBranches(params?: PaginationParams): Promise<PaginatedResponse<AMBranch>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.AM.BRANCHES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format (branches list)
        else if (Array.isArray(response)) {
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response as unknown as PaginatedResponse<AMBranch>;
        }
      }

      throw new Error('Failed to fetch AM branches - invalid response format');
    } catch (error) {
      console.error('AM Branches fetch error:', error);
      throw error;
    }
  }

  async getBranchById(id: string): Promise<AMBranchDetails> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.AM.BRANCH_BY_ID(id));

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has branch fields)
        else if (response.id || response.name) {
          return response as AMBranchDetails;
        }
      }

      throw new Error('Failed to fetch AM branch details - invalid response format');
    } catch (error) {
      console.error('AM Branch details fetch error:', error);
      throw error;
    }
  }

  async getBranchStatistics(id: string): Promise<AMBranchStatistics> {
    try {
      const response = await apiClient.get<any>(`${API_ENDPOINTS.AM.BRANCH_BY_ID(id)}/statistics`);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format
        else if (response.totalCreditOfficers !== undefined) {
          return response as AMBranchStatistics;
        }
      }

      throw new Error('Failed to fetch AM branch statistics - invalid response format');
    } catch (error) {
      console.error('AM Branch statistics fetch error:', error);
      throw error;
    }
  }

  async getBranchReports(id: string, params?: PaginationParams): Promise<PaginatedResponse<AMReport>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.AM.BRANCH_REPORTS(id)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
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
          return response as unknown as PaginatedResponse<AMReport>;
        }
      }

      throw new Error('Failed to fetch AM branch reports - invalid response format');
    } catch (error) {
      console.error('AM Branch reports fetch error:', error);
      throw error;
    }
  }

  async getBranchMissedReports(id: string, params?: PaginationParams): Promise<PaginatedResponse<AMReport>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.AM.BRANCH_MISSED_REPORTS(id)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
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
          return response as unknown as PaginatedResponse<AMReport>;
        }
      }

      throw new Error('Failed to fetch AM branch missed reports - invalid response format');
    } catch (error) {
      console.error('AM Branch missed reports fetch error:', error);
      throw error;
    }
  }

  async getBranchCreditOfficers(id: string, params?: PaginationParams): Promise<PaginatedResponse<any>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.AM.BRANCH_CREDIT_OFFICERS(id)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
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

      throw new Error('Failed to fetch AM branch credit officers - invalid response format');
    } catch (error) {
      console.error('AM Branch credit officers fetch error:', error);
      throw error;
    }
  }

  async approveReport(reportId: string, data: AMReportApprovalData): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AM.REPORT_APPROVE(reportId), data);

      if (response && typeof response === 'object') {
        // Check if it's wrapped format with success field
        if (response.success === false) {
          throw new Error(response.message || 'Failed to approve report');
        }
        // If response exists and no explicit failure, consider it successful
        return;
      }

      // If response is truthy, consider it successful
      if (response) {
        return;
      }

      throw new Error('Failed to approve report - no response');
    } catch (error) {
      console.error('AM Report approval error:', error);
      throw error;
    }
  }

  async declineReport(reportId: string, data: AMReportApprovalData): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AM.REPORT_DECLINE(reportId), data);

      if (response && typeof response === 'object') {
        // Check if it's wrapped format with success field
        if (response.success === false) {
          throw new Error(response.message || 'Failed to decline report');
        }
        // If response exists and no explicit failure, consider it successful
        return;
      }

      // If response is truthy, consider it successful
      if (response) {
        return;
      }

      throw new Error('Failed to decline report - no response');
    } catch (error) {
      console.error('AM Report decline error:', error);
      throw error;
    }
  }

  async getReportById(reportId: string): Promise<AMReport> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.AM.REPORT_BY_ID(reportId));

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has report fields)
        else if (response.id || response.reportId) {
          return response as AMReport;
        }
      }

      throw new Error('Failed to fetch AM report details - invalid response format');
    } catch (error) {
      console.error('AM Report details fetch error:', error);
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
}

// Export singleton instance
export const amBranchService = new AMBranchAPIService();