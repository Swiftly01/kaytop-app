/**
 * Reports Management Service
 * Handles report CRUD operations, approval workflow, and statistics
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import type {
  Report,
  ReportStatistics,
  ReportApprovalData,
  ReportFilters,
  PaginatedResponse,
} from '../api/types';

export interface ReportsService {
  getAllReports(filters?: ReportFilters): Promise<PaginatedResponse<Report>>;
  getReportById(id: string): Promise<Report>;
  approveReport(id: string, data: ReportApprovalData): Promise<Report>;
  declineReport(id: string, data: ReportApprovalData): Promise<Report>;
  getReportStatistics(filters?: Pick<ReportFilters, 'dateFrom' | 'dateTo' | 'branchId'>): Promise<ReportStatistics>;
}

class ReportsAPIService implements ReportsService {
  async getAllReports(filters: ReportFilters = {}): Promise<PaginatedResponse<Report>> {
    try {
      const params = new URLSearchParams();
      
      // Add filter parameters
      if (filters.creditOfficerId) params.append('creditOfficerId', filters.creditOfficerId);
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.status) params.append('status', filters.status);
      if (filters.reportType) params.append('reportType', filters.reportType);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const url = `${API_ENDPOINTS.REPORTS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<any>(url);

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format (reports list)
        else if (Array.isArray(response)) {
          // Backend returns direct array, create paginated response structure
          return {
            data: response,
            total: response.length,
            page: parseInt(filters.page?.toString() || '1'),
            limit: parseInt(filters.limit?.toString() || '50'),
            totalPages: Math.ceil(response.length / parseInt(filters.limit?.toString() || '50'))
          };
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response;
        }
      }

      throw new Error('Failed to fetch reports - invalid response format');
    } catch (error) {
      console.error('Reports fetch error:', error);
      throw error;
    }
  }

  async getReportById(id: string): Promise<Report> {
    try {
      const response = await apiClient.get<Report>(
        API_ENDPOINTS.REPORTS.BY_ID(id)
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has report fields)
        else if (response.id || response.reportId || response.title) {
          return response as Report;
        }
      }

      throw new Error('Failed to fetch report details - invalid response format');
    } catch (error) {
      console.error('Report details fetch error:', error);
      throw error;
    }
  }

  async approveReport(id: string, data: ReportApprovalData): Promise<Report> {
    try {
      const response = await apiClient.post<Report>(
        API_ENDPOINTS.REPORTS.APPROVE(id),
        data
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has report fields)
        else if (response.id || response.reportId || response.title) {
          return response as Report;
        }
      }

      throw new Error('Failed to approve report - invalid response format');
    } catch (error) {
      console.error('Report approval error:', error);
      throw error;
    }
  }

  async declineReport(id: string, data: ReportApprovalData): Promise<Report> {
    try {
      const response = await apiClient.post<Report>(
        API_ENDPOINTS.REPORTS.DECLINE(id),
        data
      );

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has report fields)
        else if (response.id || response.reportId || response.title) {
          return response as Report;
        }
      }

      throw new Error('Failed to decline report - invalid response format');
    } catch (error) {
      console.error('Report decline error:', error);
      throw error;
    }
  }

  async getReportStatistics(filters: Pick<ReportFilters, 'dateFrom' | 'dateTo' | 'branchId'> = {}): Promise<ReportStatistics> {
    try {
      const params = new URLSearchParams();
      
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.branchId) params.append('branchId', filters.branchId);

      const url = `${API_ENDPOINTS.REPORTS.STATISTICS}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<ReportStatistics>(url);

      // Backend returns direct data format, not wrapped in success/data
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has statistics fields)
        else if (response.totalReports !== undefined || response.pendingReports !== undefined) {
          return response as ReportStatistics;
        }
      }

      throw new Error('Failed to fetch report statistics - invalid response format');
    } catch (error) {
      console.error('Report statistics fetch error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const reportsService = new ReportsAPIService();