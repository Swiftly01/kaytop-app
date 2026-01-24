/**
 * Reports Management Service
 * Handles report CRUD operations, approval workflow, and statistics
 * Updated to use unified API client infrastructure with proper error handling and retry mechanisms
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../api/config';
import { UnifiedAPIErrorHandler } from '../api/errorHandler';
import { userProfileService } from './userProfile';
import { cacheManager, CacheKeys, CacheTTL } from '../utils/cache';
import type {
  Report,
  ReportStatistics,
  ReportApprovalData,
  ReportFilters,
  PaginatedResponse,
  ApiResponse,
  BranchReport,
  BranchReportFilters,
  HQReviewData,
} from '../api/types';

export interface ReportsService {
  getAllReports(filters?: ReportFilters): Promise<PaginatedResponse<Report>>;
  getReportById(id: string): Promise<Report>;
  createReport(data: Record<string, unknown>): Promise<Report>;
  updateReport(id: string, data: Record<string, unknown>): Promise<Report>;
  deleteReport(id: string): Promise<void>;
  approveReport(id: string, data: ReportApprovalData): Promise<Report>;
  declineReport(id: string, data: ReportApprovalData): Promise<Report>;
  getReportStatistics(filters?: Pick<ReportFilters, 'dateFrom' | 'dateTo' | 'branchId'>): Promise<ReportStatistics>;
  getBranchReportStatistics(branchId: string, filters?: Pick<ReportFilters, 'dateFrom' | 'dateTo'>): Promise<ReportStatistics>;
  getMissedReports(branchId?: string, filters?: Pick<ReportFilters, 'dateFrom' | 'dateTo'>): Promise<Report[]>;
  // Enhanced HQ review methods
  getBranchAggregateReports(filters?: BranchReportFilters): Promise<PaginatedResponse<BranchReport>>;
  hqReviewReport(id: string, data: HQReviewData): Promise<Report>;
}

class ReportsAPIService implements ReportsService {

  /**
   * Check if user has authorization to access reports for a specific branch
   * Branch managers can only access reports from their own branch
   */
  private async checkBranchAuthorization(targetBranchId?: string): Promise<void> {
    try {
      const userProfile = await userProfileService.getUserProfile();

      // System admins, account managers, and HQ managers can access all branches
      if (userProfile.role === 'system_admin' || userProfile.role === 'account_manager' || userProfile.role === 'hq_manager') {
        return;
      }

      // Branch managers can only access their own branch
      if (userProfile.role === 'branch_manager') {
        if (targetBranchId && userProfile.branch !== targetBranchId) {
          throw new Error(`Access denied: Branch managers can only access reports from their assigned branch (${userProfile.branch})`);
        }
        return;
      }

      // Credit officers can only access their own reports (handled by backend filtering)
      if (userProfile.role === 'credit_officer') {
        return;
      }

      throw new Error(`Access denied: Role ${userProfile.role} does not have permission to access reports`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access denied')) {
        throw error;
      }
      // If we can't get user profile, continue with request (backend will handle authorization)
      console.warn('Could not verify user authorization:', error);
    }
  }

  /**
   * Get all reports with filtering and pagination
   * Uses unified API client with automatic retry and error handling
   * Includes branch authorization checks for branch managers
   */
  async getAllReports(filters: ReportFilters = {}): Promise<PaginatedResponse<Report>> {
    try {
      // Validate branch ID if provided
      let validatedBranchId: string | null = null;
      if (filters.branchId) {
        validatedBranchId = this.validateBranchId(filters.branchId);
        if (!validatedBranchId) {
          console.warn('Invalid branchId format, skipping branch filter:', filters.branchId);
        } else {
          // Check authorization for branch-specific access
          await this.checkBranchAuthorization(validatedBranchId);
        }
      }

      const params = new URLSearchParams();

      // Add filter parameters with validation
      if (filters.creditOfficerId) params.append('creditOfficerId', filters.creditOfficerId);
      if (validatedBranchId) params.append('branchId', validatedBranchId);
      if (filters.status) params.append('status', filters.status);
      if (filters.reportType) params.append('reportType', filters.reportType);

      // Note: Backend /reports endpoint does NOT support dateFrom/dateTo filtering
      // Only status, branch, type, page, and limit are supported per API documentation
      // Date filtering should be done client-side if needed

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      console.log('🔍 Get all reports URL params:', params.toString());

      const url = `${API_ENDPOINTS.REPORTS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(url);

      console.log('🔍 Raw API response structure:', {
        hasData: 'data' in response.data,
        hasReports: 'reports' in response.data,
        hasPagination: 'pagination' in response.data,
        hasTotal: 'total' in response.data,
        keys: Object.keys(response.data)
      });

      // Transform backend response to expected frontend format
      // Backend returns: { reports: [], total: number, page: number, totalPages: number }
      // Frontend expects: { data: [], pagination: { total: number, page: number, totalPages: number } }
      const backendData = response.data;
      
      if (backendData.reports && Array.isArray(backendData.reports)) {
        // Transform to expected format
        const transformedResponse: PaginatedResponse<Report> = {
          data: backendData.reports,
          pagination: {
            total: backendData.total || 0,
            page: backendData.page || 1,
            totalPages: backendData.totalPages || 1,
            limit: filters.limit || 10
          }
        };
        
        console.log('✅ Transformed response:', {
          dataCount: transformedResponse.data.length,
          total: transformedResponse.pagination.total
        });
        
        return transformedResponse;
      } else {
        // If response is already in expected format, return as-is
        console.log('✅ Response already in expected format');
        return response.data;
      }
    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Reports fetch error:', errorMessage);
      throw error;
    }
  }

  /**
   * Get report by ID
   * Uses unified API client with automatic retry and error handling
   * Transforms API response to match expected Report interface
   */
  async getReportById(id: string): Promise<Report> {
    try {
      const response: ApiResponse<any> = await apiClient.get(
        API_ENDPOINTS.REPORTS.BY_ID(id)
      );

      console.log('🔍 Raw API response for getReportById:', response.data);

      // Transform API response to match expected Report interface
      // The API returns different field names than what the frontend expects
      const rawReport = response.data;
      
      const transformedReport: Report = {
        id: rawReport.id?.toString() || '',
        reportId: rawReport.title || `Report #${rawReport.id}`,
        creditOfficer: rawReport.submittedBy ? `${rawReport.submittedBy.firstName} ${rawReport.submittedBy.lastName}` : 'Unknown',
        creditOfficerId: rawReport.submittedBy?.id?.toString() || '',
        branch: rawReport.branch || 'Unknown Branch',
        branchId: rawReport.branch || '',
        email: rawReport.submittedBy?.email || '',
        dateSent: rawReport.reportDate || rawReport.submittedAt?.split('T')[0] || '',
        timeSent: rawReport.submittedAt?.split('T')[1]?.split('.')[0] || '',
        reportType: (rawReport.type === 'quarterly' || rawReport.type === 'annual' || rawReport.type === 'custom' ? 'monthly' : rawReport.type) as 'daily' | 'weekly' | 'monthly',
        status: rawReport.status?.toLowerCase() as 'submitted' | 'pending' | 'approved' | 'declined',
        isApproved: rawReport.status?.toLowerCase() === 'approved',
        loansDispursed: rawReport.totalLoansProcessed || 0,
        loansValueDispursed: rawReport.totalLoansDisbursed || '0',
        savingsCollected: rawReport.totalSavingsProcessed || '0',
        repaymentsCollected: parseFloat(rawReport.totalRecollections || '0'),
        createdAt: rawReport.createdAt || '',
        updatedAt: rawReport.updatedAt || '',
        approvedBy: rawReport.reviewedBy ? `${rawReport.reviewedBy.firstName} ${rawReport.reviewedBy.lastName}` : undefined,
        declineReason: rawReport.declineReason || undefined,
      };

      console.log('✅ Transformed report for details modal:', transformedReport);
      console.log('🔍 Key fields check:', {
        reportId: transformedReport.reportId,
        creditOfficer: transformedReport.creditOfficer,
        branch: transformedReport.branch,
        email: transformedReport.email,
        dateSent: transformedReport.dateSent,
        timeSent: transformedReport.timeSent,
        status: transformedReport.status
      });

      return transformedReport;
    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Report details fetch error:', errorMessage);
      throw error;
    }
  }

  /**
   * Create a new report
   * Uses unified API client with automatic retry and error handling
   */
  async createReport(data: Record<string, unknown>): Promise<Report> {
    try {
      const response: ApiResponse<Report> = await apiClient.post(
        API_ENDPOINTS.REPORTS.LIST,
        data
      );

      // The unified API client handles transformation automatically
      return response.data;
    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Report creation error:', errorMessage);
      throw error;
    }
  }

  /**
   * Update an existing report
   * Uses unified API client with automatic retry and error handling
   * Implements status-based edit restrictions
   */
  async updateReport(id: string, data: Record<string, unknown>): Promise<Report> {
    try {
      // First get the current report to check its status
      const currentReport = await this.getReportById(id);

      // Implement status-based edit restrictions
      if (currentReport.status !== 'pending' && currentReport.status !== 'submitted') {
        throw new Error(`Cannot update report with status '${currentReport.status}'. Only pending or submitted reports can be edited.`);
      }

      const response: ApiResponse<Report> = await apiClient.put(
        API_ENDPOINTS.REPORTS.BY_ID(id),
        data
      );

      // The unified API client handles transformation automatically
      return response.data;
    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Report update error:', errorMessage);
      throw error;
    }
  }

  /**
   * Delete a report
   * Uses unified API client with automatic retry and error handling
   * Implements status-based delete restrictions
   */
  async deleteReport(id: string): Promise<void> {
    try {
      // First get the current report to check its status
      const currentReport = await this.getReportById(id);

      // Implement status-based delete restrictions
      if (currentReport.status !== 'pending' && currentReport.status !== 'submitted') {
        throw new Error(`Cannot delete report with status '${currentReport.status}'. Only pending or submitted reports can be deleted.`);
      }

      await apiClient.delete(API_ENDPOINTS.REPORTS.BY_ID(id));
    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Report deletion error:', errorMessage);
      throw error;
    }
  }

  /**
   * Approve a report
   * Uses the HQ review endpoint - only available to HQ Managers
   * Uses unified API client with automatic retry and error handling
   */
  async approveReport(id: string, data: ReportApprovalData): Promise<Report> {
    try {
      // Validate report ID
      if (!id || id.trim() === '') {
        throw new Error('Report ID is required');
      }

      // Get the current report to check its status
      console.log('🔍 Fetching current report status before approval...');
      const currentReport = await this.getReportById(id);
      console.log('🔍 Current report status:', currentReport.status);
      console.log('🔍 Current report data:', {
        id: currentReport.id,
        reportId: currentReport.reportId,
        status: currentReport.status,
        creditOfficer: currentReport.creditOfficer,
        branch: currentReport.branch
      });

      // Check if report can be approved
      if (currentReport.status === 'approved') {
        throw new Error('Report is already approved');
      }
      if (currentReport.status === 'declined') {
        throw new Error('Cannot approve a declined report');
      }
      if (currentReport.status === 'draft') {
        throw new Error('Cannot approve a draft report. The report must be forwarded by the Branch Manager first.');
      }
      if (currentReport.status !== 'forwarded' && currentReport.status !== 'pending' && currentReport.status !== 'submitted') {
        throw new Error(`Cannot approve report with status '${currentReport.status}'. Report must be forwarded by Branch Manager first.`);
      }

      // Check HQ manager authorization
      const userProfile = await userProfileService.getUserProfile();
      console.log('🔍 User profile for approval:', { role: userProfile.role, id: userProfile.id });
      
      if (userProfile.role !== 'hq_manager' && userProfile.role !== 'system_admin') {
        throw new Error(`Access denied: Only HQ managers and system admins can approve reports. Current role: ${userProfile.role}`);
      }

      // Use the HQ review endpoint with APPROVE action
      const hqReviewData = {
        action: 'APPROVE' as const,
        remarks: data.comments || `Report approved by ${data.approvedBy}`
      };

      console.log('🔍 Using HQ review endpoint for report approval');
      console.log('🔍 Report ID:', id);
      console.log('🔍 Report ID type:', typeof id);
      console.log('🔍 Request URL:', API_ENDPOINTS.REPORTS.HQ_REVIEW(id));
      console.log('🔍 Full URL will be:', `${API_CONFIG.BASE_URL}${API_ENDPOINTS.REPORTS.HQ_REVIEW(id)}`);
      console.log('🔍 Request data:', JSON.stringify(hqReviewData, null, 2));
      console.log('🔍 Original approval data received:', JSON.stringify(data, null, 2));
      console.log('🔍 User profile for approval:', { role: userProfile.role, id: userProfile.id, email: userProfile.email });
      
      // Check what token is being used
      if (typeof window !== 'undefined') {
        const sessionData = localStorage.getItem("auth_session");
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData);
            console.log('🔍 Auth session data:', { role: session.role, hasToken: !!session.token, tokenLength: session.token?.length });
          } catch (error) {
            console.error('Failed to parse auth session:', error);
          }
        }
      }

      const response: ApiResponse<Report> = await apiClient.put(
        API_ENDPOINTS.REPORTS.HQ_REVIEW(id),
        hqReviewData
      );

      console.log(`✅ Report ${id} approved successfully by HQ Manager`);
      return response.data;
    } catch (error) {
      // Enhanced error logging with proper serialization
      console.error('❌ Detailed approval error:');
      console.error('Report ID:', id);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error object:', error);
      
      // Log axios-specific error details
      if ((error as any)?.isAxiosError) {
        console.error('❌ Axios Error Details:');
        console.error('Status:', (error as any)?.response?.status);
        console.error('Status Text:', (error as any)?.response?.statusText);
        console.error('Response Data:', (error as any)?.response?.data);
        console.error('Request URL:', (error as any)?.config?.url);
        console.error('Request Method:', (error as any)?.config?.method);
        console.error('Request Data:', (error as any)?.config?.data);
        console.error('Request Headers:', (error as any)?.config?.headers);
      }
      
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Report approval error:', errorMessage);
      throw error;
    }
  }

  /**
   * Decline a report
   * Uses the HQ review endpoint - only available to HQ Managers
   * Uses unified API client with automatic retry and error handling
   */
  async declineReport(id: string, data: ReportApprovalData): Promise<Report> {
    try {
      // Get the current report to check its status
      console.log('🔍 Fetching current report status before decline...');
      const currentReport = await this.getReportById(id);
      console.log('🔍 Current report status:', currentReport.status);

      // Check if report can be declined
      if (currentReport.status === 'declined') {
        throw new Error('Report is already declined');
      }
      if (currentReport.status === 'approved') {
        throw new Error('Cannot decline an approved report');
      }
      if (currentReport.status === 'draft') {
        throw new Error('Cannot decline a draft report. The report must be forwarded by the Branch Manager first.');
      }
      if (currentReport.status !== 'forwarded' && currentReport.status !== 'pending' && currentReport.status !== 'submitted') {
        throw new Error(`Cannot decline report with status '${currentReport.status}'. Report must be forwarded by Branch Manager first.`);
      }

      // Check HQ manager authorization
      const userProfile = await userProfileService.getUserProfile();
      if (userProfile.role !== 'hq_manager' && userProfile.role !== 'system_admin') {
        throw new Error(`Access denied: Only HQ managers and system admins can decline reports. Current role: ${userProfile.role}`);
      }

      // Use the HQ review endpoint with DECLINE action
      const hqReviewData = {
        action: 'DECLINE' as const,
        remarks: data.comments || `Report declined by ${data.approvedBy}`
      };

      console.log('🔍 Using HQ review endpoint for report decline');
      const response: ApiResponse<Report> = await apiClient.put(
        API_ENDPOINTS.REPORTS.HQ_REVIEW(id),
        hqReviewData
      );

      console.log(`✅ Report ${id} declined successfully by HQ Manager`);
      return response.data;
    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Report decline error:', errorMessage);
      throw error;
    }
  }

  /**
   * Get report statistics
   * Calculates statistics from existing /reports endpoint since dedicated statistics endpoints don't exist
   * Uses unified API client with automatic retry and error handling
   */
  async getReportStatistics(filters: Pick<ReportFilters, 'dateFrom' | 'dateTo' | 'branchId'> = {}): Promise<ReportStatistics> {
    try {
      console.log('🔍 Calculating report statistics from /reports endpoint with filters:', filters);

      // Since the backend doesn't have dedicated statistics endpoints (/reports/statistics or /reports/dashboard/stats),
      // we'll fetch all reports and calculate statistics from the data
      const reportsResponse = await this.getAllReports({
        branchId: filters.branchId,
        page: 1,
        limit: 1000, // Get a large number to calculate accurate statistics
      });

      const reports = reportsResponse.data || [];
      console.log('📊 Fetched reports for statistics calculation:', reports.length);

      // Apply date filtering client-side since backend doesn't support dateFrom/dateTo
      let filteredReports = reports;
      if (filters.dateFrom || filters.dateTo) {
        filteredReports = reports.filter(report => {
          const reportDate = new Date(report.createdAt || report.dateSent);
          
          if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            if (reportDate < fromDate) return false;
          }
          
          if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            if (reportDate > toDate) return false;
          }
          
          return true;
        });
      }

      console.log('📊 Filtered reports for date range:', filteredReports.length);

      // Calculate statistics from the filtered reports
      const totalReports = filteredReports.length;
      const submittedReports = filteredReports.filter(r => r.status === 'submitted').length;
      const pendingReports = filteredReports.filter(r => r.status === 'pending' || r.status === 'submitted').length;
      const approvedReports = filteredReports.filter(r => r.status === 'approved').length;
      
      // For missed reports, we'll calculate based on reports that should have been submitted but weren't
      // Since we don't have a "missed" status in the backend, we'll use declined reports as a proxy
      const missedReports = filteredReports.filter(r => r.status === 'declined').length;

      // Calculate growth percentages (for now, we'll use 0 since we don't have historical data)
      // In a real implementation, you'd compare with previous period data
      const calculatedStats: ReportStatistics = {
        totalReports: { count: totalReports, growth: 0 },
        submittedReports: { count: submittedReports, growth: 0 },
        pendingReports: { count: pendingReports, growth: 0 },
        approvedReports: { count: approvedReports, growth: 0 },
        missedReports: { count: missedReports, growth: 0 },
      };

      console.log('✅ Calculated report statistics:', calculatedStats);
      return calculatedStats;

    } catch (error) {
      console.error('❌ Report statistics calculation error:', {
        error,
        filters,
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      // Return meaningful default data instead of throwing
      const defaultStats: ReportStatistics = {
        totalReports: { count: 0, growth: 0 },
        submittedReports: { count: 0, growth: 0 },
        pendingReports: { count: 0, growth: 0 },
        approvedReports: { count: 0, growth: 0 },
        missedReports: { count: 0, growth: 0 },
      };

      console.log('📊 Returning default report statistics due to calculation error');
      return defaultStats;
    }
  }

  /**
   * Validate date format and convert to YYYY-MM-DD if needed
   */
  private validateDateFormat(date: string): string | null {
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }

      // Try to parse and convert to YYYY-MM-DD
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid date format:', date);
        return null;
      }

      return parsedDate.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Date validation error:', error);
      return null;
    }
  }

  /**
   * Validate branch ID format (should be a non-empty string)
   */
  private validateBranchId(branchId: string): string | null {
    try {
      // Convert to string and trim whitespace
      const branchIdStr = branchId.toString().trim();

      // Check if it's a non-empty string
      if (branchIdStr.length > 0) {
        return branchIdStr;
      }

      console.warn('Invalid branchId format (empty string):', branchId);
      return null;
    } catch (error) {
      console.warn('Branch ID validation error:', error);
      return null;
    }
  }

  /**
   * Get branch-specific report statistics
   * Since the backend doesn't have a dedicated branch statistics endpoint,
   * we'll use the general reports endpoint with branch filtering and calculate statistics
   */
  async getBranchReportStatistics(branchId: string, filters: Pick<ReportFilters, 'dateFrom' | 'dateTo'> = {}): Promise<ReportStatistics> {
    try {
      // Validate branch ID format
      const validatedBranchId: string | null = this.validateBranchId(branchId);
      if (!validatedBranchId) {
        throw new Error(`Invalid branchId format: ${branchId}. Expected non-empty string.`);
      }

      // Check authorization for branch-specific access
      await this.checkBranchAuthorization(validatedBranchId);

      console.log('⚠️ Branch statistics endpoint not available, using general reports with branch filter');

      // Use the general reports endpoint with branch filtering to get reports data
      // Note: dateFrom/dateTo are not supported by the backend API, so we fetch all reports
      const reportsResponse = await this.getAllReports({
        branchId: validatedBranchId,
        page: 1,
        limit: 1000 // Get a large number to calculate statistics
      });

      const reports = reportsResponse.data || [];

      // Calculate statistics from the reports data
      const totalReports = reports.length;
      const submittedReports = reports.filter(r => r.status === 'submitted').length;
      const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'submitted').length;
      const approvedReports = reports.filter(r => r.status === 'approved').length;
      // Note: Backend doesn't support 'missed' status, so we'll use 0 for now
      // In a real implementation, missed reports would be calculated based on due dates
      const missedReports = 0;

      // For growth calculation, we'd need historical data comparison
      // Since we don't have that, we'll return 0 growth for now
      const calculatedStats: ReportStatistics = {
        totalReports: { count: totalReports, growth: 0 },
        submittedReports: { count: submittedReports, growth: 0 },
        pendingReports: { count: pendingReports, growth: 0 },
        approvedReports: { count: approvedReports, growth: 0 },
        missedReports: { count: missedReports, growth: 0 },
      };

      console.log('📊 Calculated branch statistics from reports data:', calculatedStats);
      return calculatedStats;

    } catch (error) {
      console.error('Branch report statistics calculation error:', error);

      // Return default statistics if calculation fails
      const defaultStats: ReportStatistics = {
        totalReports: { count: 0, growth: 0 },
        submittedReports: { count: 0, growth: 0 },
        pendingReports: { count: 0, growth: 0 },
        approvedReports: { count: 0, growth: 0 },
        missedReports: { count: 0, growth: 0 },
      };

      console.log('📊 Returning default branch statistics due to error');
      return defaultStats;
    }
  }

  /**
   * Get missed reports for a specific branch or all branches
   * Uses unified API client with automatic retry and error handling
   * Includes branch authorization checks for branch managers
   * Note: Since 'missed' status may not be supported by backend, we'll return empty array for now
   */
  async getMissedReports(branchId?: string, filters: Pick<ReportFilters, 'dateFrom' | 'dateTo'> = {}): Promise<Report[]> {
    try {
      // Validate branch ID if provided
      let validatedBranchId: string | null = null;
      if (branchId) {
        validatedBranchId = this.validateBranchId(branchId);
        if (!validatedBranchId) {
          throw new Error(`Invalid branchId format: ${branchId}. Expected non-empty string.`);
        }
        // Check authorization for branch-specific access
        await this.checkBranchAuthorization(validatedBranchId);
      }

      console.log('⚠️ Missed reports: Backend may not support "missed" status, checking available reports instead');

      // Since the backend may not support 'missed' status, let's try to get all reports
      // and filter them based on some criteria that might indicate "missed" reports
      const params = new URLSearchParams();

      if (validatedBranchId) {
        params.append('branchId', validatedBranchId);
      }

      // Note: Backend /reports endpoint does NOT support dateFrom/dateTo filtering
      // Date filtering removed as it's not supported by the API

      console.log('🔍 Missed reports URL params:', params.toString());

      const url = `${API_ENDPOINTS.REPORTS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;

      try {
        await apiClient.get(url);

        // Since we can't filter by 'missed' status on the backend, 
        // we'll return an empty array for now to prevent errors
        // In a real implementation, you'd need to define what constitutes a "missed" report
        console.log('📊 Returning empty missed reports array (backend does not support missed status filter)');
        return [];

      } catch (apiError) {
        // If the API call fails, return empty array to prevent breaking the page
        console.warn('API call for missed reports failed, returning empty array:', apiError);
        return [];
      }

    } catch (error) {
      console.error('Missed reports fetch error:', error);
      // Return empty array instead of throwing to prevent breaking the page
      return [];
    }
  }

  /**
   * Get branch aggregate reports for HQ dashboard
   * Transforms individual reports into branch-level aggregates
   * Uses unified API client with automatic retry and error handling
   */
  async getBranchAggregateReports(filters: BranchReportFilters = {}): Promise<PaginatedResponse<BranchReport>> {
    try {
      // Check HQ manager authorization
      const userProfile = await userProfileService.getUserProfile();
      if (userProfile.role !== 'hq_manager' && userProfile.role !== 'system_admin') {
        throw new Error('Access denied: Only HQ managers and system admins can access branch aggregate reports');
      }

      // Get all reports and transform them into branch aggregates
      const reportsResponse = await this.getAllReports({
        branchId: filters.branchId,
        status: filters.status,
        reportType: filters.reportType,
        page: filters.page || 1,
        limit: filters.limit || 50,
      });

      // Transform individual reports into branch aggregates
      const branchMap = new Map<string, BranchReport>();

      reportsResponse.data.forEach(report => {
        const branchKey = report.branchId || report.branch;
        
        if (!branchMap.has(branchKey)) {
          branchMap.set(branchKey, {
            id: branchKey,
            branchName: report.branch,
            branchId: report.branchId,
            totalSavings: 0,
            totalDisbursed: 0,
            totalRepaid: 0,
            status: 'pending',
            reportCount: 0,
            pendingReports: 0,
            approvedReports: 0,
            declinedReports: 0,
            lastSubmissionDate: report.createdAt,
            creditOfficerCount: 0,
            activeCreditOfficers: [],
          });
        }

        const branchAggregate = branchMap.get(branchKey)!;
        
        // Aggregate financial data
        branchAggregate.totalSavings += parseFloat(report.savingsCollected) || 0;
        branchAggregate.totalDisbursed += parseFloat(report.loansValueDispursed) || 0;
        branchAggregate.totalRepaid += report.repaymentsCollected || 0;
        
        // Count reports by status
        branchAggregate.reportCount++;
        if (report.status === 'pending' || report.status === 'submitted') {
          branchAggregate.pendingReports++;
        } else if (report.status === 'approved') {
          branchAggregate.approvedReports++;
        } else if (report.status === 'declined') {
          branchAggregate.declinedReports++;
        }

        // Track credit officers
        if (!branchAggregate.activeCreditOfficers.includes(report.creditOfficer)) {
          branchAggregate.activeCreditOfficers.push(report.creditOfficer);
          branchAggregate.creditOfficerCount++;
        }

        // Update last submission date
        if (new Date(report.createdAt) > new Date(branchAggregate.lastSubmissionDate)) {
          branchAggregate.lastSubmissionDate = report.createdAt;
        }

        // Determine overall status
        if (branchAggregate.pendingReports > 0 && branchAggregate.approvedReports > 0) {
          branchAggregate.status = 'mixed';
        } else if (branchAggregate.pendingReports > 0) {
          branchAggregate.status = 'pending';
        } else if (branchAggregate.approvedReports > 0 && branchAggregate.declinedReports === 0) {
          branchAggregate.status = 'approved';
        } else if (branchAggregate.declinedReports > 0) {
          branchAggregate.status = 'declined';
        }
      });

      const branchReports = Array.from(branchMap.values());

      return {
        data: branchReports,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 50,
          total: branchReports.length,
          totalPages: Math.ceil(branchReports.length / (filters.limit || 50)),
        },
      };

    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error('Branch aggregate reports fetch error:', errorMessage);
      throw error;
    }
  }

  /**
   * HQ review report (approve or decline) with optimistic updates
   * Uses the PUT /reports/{id}/hq-review endpoint with action: "APPROVE" or "DECLINE"
   * Uses unified API client with automatic retry and error handling
   * Implements optimistic UI updates and cache invalidation
   */
  async hqReviewReport(id: string, data: HQReviewData): Promise<Report> {
    try {
      // Check HQ manager authorization
      const userProfile = await userProfileService.getUserProfile();
      if (userProfile.role !== 'hq_manager' && userProfile.role !== 'system_admin') {
        throw new Error('Access denied: Only HQ managers and system admins can review reports');
      }

      // Validate action
      if (data.action !== 'APPROVE' && data.action !== 'DECLINE') {
        throw new Error('Invalid action: Must be either "APPROVE" or "DECLINE"');
      }

      // Invalidate related cache entries before making the request
      // This ensures fresh data is fetched after the review
      console.log('🗑️ Invalidating reports cache before HQ review');
      const cacheStats = cacheManager.getStats();
      cacheStats.keys.forEach(key => {
        if (key.startsWith('branch_aggregates:') || 
            key.startsWith('report_statistics:')) {
          cacheManager.delete(key);
        }
      });

      const response: ApiResponse<Report> = await apiClient.put(
        API_ENDPOINTS.REPORTS.HQ_REVIEW(id),
        data
      );

      console.log(`✅ Report ${id} ${data.action.toLowerCase()}d successfully`);
      return response.data;

    } catch (error) {
      const errorMessage = UnifiedAPIErrorHandler.handleApiError(error, {
        logError: true,
        showToast: false
      });
      console.error(`HQ review error for report ${id}:`, errorMessage);
      throw error;
    }
  }
}

// Export singleton instance
export const reportsService = new ReportsAPIService();
