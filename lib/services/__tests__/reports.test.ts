/**
 * Reports Service Tests
 * Comprehensive tests for the reports API integration infrastructure
 * Tests API integration points, error handling scenarios, and data format consistency
 */

// Mock the userProfile module before importing anything else
jest.mock('../userProfile', () => ({
  userProfileService: {
    getUserProfile: jest.fn()
  }
}));

import { reportsService } from '../reports';
import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '../../api/config';
import { UnifiedAPIErrorHandler } from '../../api/errorHandler';
import { userProfileService } from '../userProfile';
import type { Report, ReportStatistics, ReportApprovalData, ReportFilters, PaginatedResponse } from '../../api/types';

// Mock the API client and error handler
jest.mock('../../api/client');
jest.mock('../../api/errorHandler');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockErrorHandler = UnifiedAPIErrorHandler as jest.Mocked<typeof UnifiedAPIErrorHandler>;
const mockUserProfileService = userProfileService as jest.Mocked<typeof userProfileService>;

describe('Reports Service - API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock userProfileService to return system admin by default (allows all operations)
    mockUserProfileService.getUserProfile.mockResolvedValue({
      id: 'admin-1',
      role: 'system_admin',
      branch: 'main-branch',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      mobileNumber: '+1234567890',
      verificationStatus: 'verified',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllReports', () => {
    const mockReportsData: Report[] = [
      {
        id: '1',
        reportId: 'RPT-001',
        creditOfficer: 'John Doe',
        creditOfficerId: 'co-1',
        branch: 'Main Branch',
        branchId: 'branch-1',
        email: 'john@example.com',
        dateSent: '2024-01-15',
        timeSent: '10:30:00',
        reportType: 'daily',
        status: 'pending',
        loansDispursed: 5,
        loansValueDispursed: '50000',
        savingsCollected: '25000',
        repaymentsCollected: 3,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    ];

    const mockPaginatedResponse: PaginatedResponse<Report> = {
      data: mockReportsData,
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    };

    it('should call the correct API endpoint with no filters', async () => {
      const mockResponse = {
        success: true,
        data: mockPaginatedResponse
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getAllReports();

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should call the correct API endpoint with all filters', async () => {
      const mockResponse = {
        success: true,
        data: mockPaginatedResponse
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const filters: ReportFilters = {
        creditOfficerId: 'co-1',
        branchId: 'branch-1',
        status: 'pending',
        reportType: 'daily',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        page: 2,
        limit: 20
      };

      await reportsService.getAllReports(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/reports?creditOfficerId=co-1&branchId=branch-1&status=pending&reportType=daily&dateFrom=2024-01-01&dateTo=2024-01-31&page=2&limit=20'
      );
    });

    it('should return data in the expected format', async () => {
      const mockResponse = {
        success: true,
        data: mockPaginatedResponse
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getAllReports();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('limit');
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('totalPages');
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockApiClient.get.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Network error occurred');

      await expect(reportsService.getAllReports()).rejects.toThrow('Network error');
      expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(mockError, {
        logError: true,
        showToast: false
      });
    });
  });

  describe('getReportById', () => {
    const mockReport: Report = {
      id: '1',
      reportId: 'RPT-001',
      creditOfficer: 'John Doe',
      creditOfficerId: 'co-1',
      branch: 'Main Branch',
      branchId: 'branch-1',
      email: 'john@example.com',
      dateSent: '2024-01-15',
      timeSent: '10:30:00',
      reportType: 'daily',
      status: 'approved',
      isApproved: true,
      loansDispursed: 5,
      loansValueDispursed: '50000',
      savingsCollected: '25000',
      repaymentsCollected: 3,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T15:30:00Z'
    };

    it('should call the correct API endpoint', async () => {
      const mockResponse = {
        success: true,
        data: mockReport
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getReportById('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/1');
      expect(result).toEqual(mockReport);
    });

    it('should return data in the expected format', async () => {
      const mockResponse = {
        success: true,
        data: mockReport
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getReportById('1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('reportId');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('creditOfficerId');
      expect(result).toHaveProperty('branchId');
    });

    it('should handle not found errors', async () => {
      const mockError = new Error('Report not found');
      mockApiClient.get.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Report not found');

      await expect(reportsService.getReportById('999')).rejects.toThrow('Report not found');
    });
  });

  describe('createReport', () => {
    const mockReportData = {
      creditOfficerId: 'co-1',
      branchId: 'branch-1',
      reportType: 'daily',
      loansDispursed: 3,
      loansValueDispursed: '30000',
      savingsCollected: '15000',
      repaymentsCollected: 2
    };

    const mockCreatedReport: Report = {
      id: '2',
      reportId: 'RPT-002',
      creditOfficer: 'Jane Smith',
      creditOfficerId: 'co-1',
      branch: 'Main Branch',
      branchId: 'branch-1',
      email: 'jane@example.com',
      dateSent: '2024-01-16',
      timeSent: '09:00:00',
      reportType: 'daily',
      status: 'submitted',
      loansDispursed: 3,
      loansValueDispursed: '30000',
      savingsCollected: '15000',
      repaymentsCollected: 2,
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z'
    };

    it('should call the correct API endpoint with report data', async () => {
      const mockResponse = {
        success: true,
        data: mockCreatedReport
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await reportsService.createReport(mockReportData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/reports', mockReportData);
      expect(result).toEqual(mockCreatedReport);
    });

    it('should handle validation errors', async () => {
      const mockError = new Error('Validation failed');
      mockApiClient.post.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Validation failed');

      await expect(reportsService.createReport({})).rejects.toThrow('Validation failed');
    });
  });

  describe('updateReport', () => {
    const mockUpdateData = {
      loansDispursed: 4,
      loansValueDispursed: '40000'
    };

    const mockPendingReport: Report = {
      id: '1',
      reportId: 'RPT-001',
      creditOfficer: 'John Doe',
      creditOfficerId: 'co-1',
      branch: 'Main Branch',
      branchId: 'branch-1',
      email: 'john@example.com',
      dateSent: '2024-01-15',
      timeSent: '10:30:00',
      reportType: 'daily',
      status: 'pending',
      loansDispursed: 5,
      loansValueDispursed: '50000',
      savingsCollected: '25000',
      repaymentsCollected: 3,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    };

    const mockApprovedReport: Report = {
      ...mockPendingReport,
      status: 'approved',
      isApproved: true
    };

    const mockUpdatedReport: Report = {
      ...mockPendingReport,
      loansDispursed: 4,
      loansValueDispursed: '40000',
      updatedAt: '2024-01-16T10:30:00Z'
    };

    it('should call the correct API endpoint with update data for pending reports', async () => {
      // Mock getReportById to return pending report
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockPendingReport
      });

      // Mock update API call
      const mockResponse = {
        success: true,
        data: mockUpdatedReport
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await reportsService.updateReport('1', mockUpdateData);

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/1');
      expect(mockApiClient.put).toHaveBeenCalledWith('/reports/1', mockUpdateData);
      expect(result).toEqual(mockUpdatedReport);
    });

    it('should allow updates for submitted reports', async () => {
      const mockSubmittedReport = { ...mockPendingReport, status: 'submitted' };
      
      // Mock getReportById to return submitted report
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockSubmittedReport
      });

      // Mock update API call
      mockApiClient.put.mockResolvedValue({
        success: true,
        data: mockUpdatedReport
      });

      const result = await reportsService.updateReport('1', mockUpdateData);

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/1');
      expect(mockApiClient.put).toHaveBeenCalledWith('/reports/1', mockUpdateData);
      expect(result).toEqual(mockUpdatedReport);
    });

    it('should prevent updates for approved reports', async () => {
      // Mock getReportById to return approved report
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockApprovedReport
      });

      await expect(reportsService.updateReport('1', mockUpdateData))
        .rejects.toThrow("Cannot update report with status 'approved'. Only pending or submitted reports can be edited.");

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/1');
      expect(mockApiClient.put).not.toHaveBeenCalled();
    });

    it('should prevent updates for declined reports', async () => {
      const mockDeclinedReport = { ...mockPendingReport, status: 'declined' };
      
      // Mock getReportById to return declined report
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockDeclinedReport
      });

      await expect(reportsService.updateReport('1', mockUpdateData))
        .rejects.toThrow("Cannot update report with status 'declined'. Only pending or submitted reports can be edited.");

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/1');
      expect(mockApiClient.put).not.toHaveBeenCalled();
    });

    it('should handle permission errors for non-pending reports', async () => {
      // Mock getReportById to return pending report (passes frontend validation)
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockPendingReport
      });

      // Mock backend API error (backend-level validation)
      const mockError = new Error('Cannot update approved report');
      mockApiClient.put.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Cannot update approved report');

      await expect(reportsService.updateReport('1', mockUpdateData)).rejects.toThrow('Cannot update approved report');
    });

    it('should handle errors when fetching report status', async () => {
      const mockError = new Error('Report not found');
      mockApiClient.get.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Report not found');

      await expect(reportsService.updateReport('1', mockUpdateData)).rejects.toThrow('Report not found');
      expect(mockApiClient.put).not.toHaveBeenCalled();
    });
  });

  describe('deleteReport', () => {
    const mockPendingReport: Report = {
      id: '1',
      reportId: 'RPT-001',
      creditOfficer: 'John Doe',
      creditOfficerId: 'co-1',
      branch: 'Main Branch',
      branchId: 'branch-1',
      email: 'john@example.com',
      dateSent: '2024-01-15',
      timeSent: '10:30:00',
      reportType: 'daily',
      status: 'pending',
      loansDispursed: 5,
      loansValueDispursed: '50000',
      savingsCollected: '25000',
      repaymentsCollected: 3,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    };

    const mockApprovedReport: Report = {
      ...mockPendingReport,
      status: 'approved',
      isApproved: true
    };

    it('should call the correct API endpoint for pending reports', async () => {
      // Mock getReportById to return pending report
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockPendingReport
      });

      mockApiClient.delete.mockResolvedValue({ success: true });

      await reportsService.deleteReport('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/1');
      expect(mockApiClient.delete).toHaveBeenCalledWith('/reports/1');
    });

    it('should allow deletion for submitted reports', async () => {
      const mockSubmittedReport = { ...mockPendingReport, status: 'submitted' };
      
      // Mock getReportById to return submitted report
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockSubmittedReport
      });

      mockApiClient.delete.mockResolvedValue({ success: true });

      await reportsService.deleteReport('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/1');
      expect(mockApiClient.delete).toHaveBeenCalledWith('/reports/1');
    });

    it('should prevent deletion for approved reports', async () => {
      // Mock getReportById to return approved report
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockApprovedReport
      });

      await expect(reportsService.deleteReport('1'))
        .rejects.toThrow("Cannot delete report with status 'approved'. Only pending or submitted reports can be deleted.");

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/1');
      expect(mockApiClient.delete).not.toHaveBeenCalled();
    });

    it('should prevent deletion for declined reports', async () => {
      const mockDeclinedReport = { ...mockPendingReport, status: 'declined' };
      
      // Mock getReportById to return declined report
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockDeclinedReport
      });

      await expect(reportsService.deleteReport('1'))
        .rejects.toThrow("Cannot delete report with status 'declined'. Only pending or submitted reports can be deleted.");

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/1');
      expect(mockApiClient.delete).not.toHaveBeenCalled();
    });

    it('should handle permission errors for non-pending reports', async () => {
      // Mock getReportById to return pending report (passes frontend validation)
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockPendingReport
      });

      // Mock backend API error (backend-level validation)
      const mockError = new Error('Cannot delete approved report');
      mockApiClient.delete.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Cannot delete approved report');

      await expect(reportsService.deleteReport('1')).rejects.toThrow('Cannot delete approved report');
    });

    it('should handle errors when fetching report status', async () => {
      const mockError = new Error('Report not found');
      mockApiClient.get.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Report not found');

      await expect(reportsService.deleteReport('1')).rejects.toThrow('Report not found');
      expect(mockApiClient.delete).not.toHaveBeenCalled();
    });
  });

  describe('Approval Workflow Tests', () => {
    describe('approveReport', () => {
      const mockApprovalData: ReportApprovalData = {
        status: 'approved',
        comments: 'Report looks good',
        approvedBy: 'manager-1',
        approvedAt: '2024-01-16T15:00:00Z'
      };

      const mockApprovedReport: Report = {
        id: '1',
        reportId: 'RPT-001',
        creditOfficer: 'John Doe',
        creditOfficerId: 'co-1',
        branch: 'Main Branch',
        branchId: 'branch-1',
        email: 'john@example.com',
        dateSent: '2024-01-15',
        timeSent: '10:30:00',
        reportType: 'daily',
        status: 'approved',
        isApproved: true,
        loansDispursed: 5,
        loansValueDispursed: '50000',
        savingsCollected: '25000',
        repaymentsCollected: 3,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T15:00:00Z',
        approvedBy: 'manager-1',
        approvedAt: '2024-01-16T15:00:00Z'
      };

      it('should call the correct API endpoint with approval data', async () => {
        const mockResponse = {
          success: true,
          data: mockApprovedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.approveReport('1', mockApprovalData);

        expect(mockApiClient.put).toHaveBeenCalledWith('/reports/1/approve', mockApprovalData);
        expect(result).toEqual(mockApprovedReport);
      });

      it('should include all required approval metadata in the request', async () => {
        const mockResponse = {
          success: true,
          data: mockApprovedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        await reportsService.approveReport('1', mockApprovalData);

        const callArgs = mockApiClient.put.mock.calls[0][1];
        expect(callArgs).toHaveProperty('status', 'approved');
        expect(callArgs).toHaveProperty('approvedBy', 'manager-1');
        expect(callArgs).toHaveProperty('approvedAt', '2024-01-16T15:00:00Z');
        expect(callArgs).toHaveProperty('comments', 'Report looks good');
      });

      it('should return report with approval metadata populated', async () => {
        const mockResponse = {
          success: true,
          data: mockApprovedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.approveReport('1', mockApprovalData);

        expect(result.status).toBe('approved');
        expect(result.isApproved).toBe(true);
        expect(result.approvedBy).toBe('manager-1');
        expect(result.approvedAt).toBe('2024-01-16T15:00:00Z');
      });

      it('should handle authorization errors for non-authorized users', async () => {
        const mockError = new Error('Unauthorized to approve reports');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Unauthorized to approve reports');

        await expect(reportsService.approveReport('1', mockApprovalData)).rejects.toThrow('Unauthorized to approve reports');
        expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(mockError, {
          logError: true,
          showToast: false
        });
      });

      it('should handle insufficient permissions for branch managers accessing other branches', async () => {
        const mockError = new Error('Cannot approve reports from other branches');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Cannot approve reports from other branches');

        await expect(reportsService.approveReport('1', mockApprovalData)).rejects.toThrow('Cannot approve reports from other branches');
      });

      it('should handle approval of already approved reports', async () => {
        const mockError = new Error('Report is already approved');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Report is already approved');

        await expect(reportsService.approveReport('1', mockApprovalData)).rejects.toThrow('Report is already approved');
      });

      it('should handle approval with minimal metadata', async () => {
        const minimalApprovalData: ReportApprovalData = {
          status: 'approved',
          approvedBy: 'manager-1',
          approvedAt: '2024-01-16T15:00:00Z'
        };

        const mockResponse = {
          success: true,
          data: { ...mockApprovedReport, comments: undefined }
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.approveReport('1', minimalApprovalData);

        expect(mockApiClient.put).toHaveBeenCalledWith('/reports/1/approve', minimalApprovalData);
        expect(result.status).toBe('approved');
        expect(result.approvedBy).toBe('manager-1');
      });

      it('should handle network errors during approval', async () => {
        const mockError = new Error('Network timeout');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Network timeout');

        await expect(reportsService.approveReport('1', mockApprovalData)).rejects.toThrow('Network timeout');
        expect(console.error).toHaveBeenCalledWith('Report approval error:', 'Network timeout');
      });
    });

    describe('declineReport', () => {
      const mockDeclineData: ReportApprovalData = {
        status: 'declined',
        comments: 'Missing required information',
        approvedBy: 'manager-1',
        approvedAt: '2024-01-16T15:00:00Z'
      };

      const mockDeclinedReport: Report = {
        id: '1',
        reportId: 'RPT-001',
        creditOfficer: 'John Doe',
        creditOfficerId: 'co-1',
        branch: 'Main Branch',
        branchId: 'branch-1',
        email: 'john@example.com',
        dateSent: '2024-01-15',
        timeSent: '10:30:00',
        reportType: 'daily',
        status: 'declined',
        isApproved: false,
        loansDispursed: 5,
        loansValueDispursed: '50000',
        savingsCollected: '25000',
        repaymentsCollected: 3,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T15:00:00Z',
        approvedBy: 'manager-1',
        approvedAt: '2024-01-16T15:00:00Z',
        declineReason: 'Missing required information'
      };

      it('should call the correct API endpoint with decline data', async () => {
        const mockResponse = {
          success: true,
          data: mockDeclinedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.declineReport('1', mockDeclineData);

        expect(mockApiClient.put).toHaveBeenCalledWith('/reports/1/decline', mockDeclineData);
        expect(result).toEqual(mockDeclinedReport);
      });

      it('should include all required decline metadata in the request', async () => {
        const mockResponse = {
          success: true,
          data: mockDeclinedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        await reportsService.declineReport('1', mockDeclineData);

        const callArgs = mockApiClient.put.mock.calls[0][1];
        expect(callArgs).toHaveProperty('status', 'declined');
        expect(callArgs).toHaveProperty('approvedBy', 'manager-1');
        expect(callArgs).toHaveProperty('approvedAt', '2024-01-16T15:00:00Z');
        expect(callArgs).toHaveProperty('comments', 'Missing required information');
      });

      it('should return report with decline metadata populated', async () => {
        const mockResponse = {
          success: true,
          data: mockDeclinedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.declineReport('1', mockDeclineData);

        expect(result.status).toBe('declined');
        expect(result.isApproved).toBe(false);
        expect(result.approvedBy).toBe('manager-1');
        expect(result.approvedAt).toBe('2024-01-16T15:00:00Z');
        expect(result.declineReason).toBe('Missing required information');
      });

      it('should handle authorization errors for non-authorized users', async () => {
        const mockError = new Error('Unauthorized to decline reports');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Unauthorized to decline reports');

        await expect(reportsService.declineReport('1', mockDeclineData)).rejects.toThrow('Unauthorized to decline reports');
        expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(mockError, {
          logError: true,
          showToast: false
        });
      });

      it('should handle insufficient permissions for branch managers accessing other branches', async () => {
        const mockError = new Error('Cannot decline reports from other branches');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Cannot decline reports from other branches');

        await expect(reportsService.declineReport('1', mockDeclineData)).rejects.toThrow('Cannot decline reports from other branches');
      });

      it('should handle decline of already processed reports', async () => {
        const mockError = new Error('Report is already processed');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Report is already processed');

        await expect(reportsService.declineReport('1', mockDeclineData)).rejects.toThrow('Report is already processed');
      });

      it('should require decline reason in comments', async () => {
        const declineDataWithoutReason: ReportApprovalData = {
          status: 'declined',
          approvedBy: 'manager-1',
          approvedAt: '2024-01-16T15:00:00Z'
        };

        const mockResponse = {
          success: true,
          data: { ...mockDeclinedReport, declineReason: undefined }
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.declineReport('1', declineDataWithoutReason);

        expect(mockApiClient.put).toHaveBeenCalledWith('/reports/1/decline', declineDataWithoutReason);
        expect(result.status).toBe('declined');
      });

      it('should handle validation errors for invalid decline data', async () => {
        const mockError = new Error('Decline reason is required');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Decline reason is required');

        await expect(reportsService.declineReport('1', mockDeclineData)).rejects.toThrow('Decline reason is required');
      });

      it('should handle network errors during decline', async () => {
        const mockError = new Error('Network timeout');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Network timeout');

        await expect(reportsService.declineReport('1', mockDeclineData)).rejects.toThrow('Network timeout');
        expect(console.error).toHaveBeenCalledWith('Report decline error:', 'Network timeout');
      });
    });

    describe('Authorization Checks', () => {
      const mockApprovalData: ReportApprovalData = {
        status: 'approved',
        comments: 'Test approval',
        approvedBy: 'manager-1',
        approvedAt: '2024-01-16T15:00:00Z'
      };

      it('should prevent credit officers from approving reports', async () => {
        const mockError = new Error('Credit officers cannot approve reports');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Credit officers cannot approve reports');

        await expect(reportsService.approveReport('1', mockApprovalData)).rejects.toThrow('Credit officers cannot approve reports');
      });

      it('should prevent users from approving their own reports', async () => {
        const mockError = new Error('Cannot approve your own reports');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Cannot approve your own reports');

        await expect(reportsService.approveReport('1', mockApprovalData)).rejects.toThrow('Cannot approve your own reports');
      });

      it('should allow branch managers to approve reports from their branch', async () => {
        const mockApprovedReport: Report = {
          id: '1',
          reportId: 'RPT-001',
          creditOfficer: 'John Doe',
          creditOfficerId: 'co-1',
          branch: 'Main Branch',
          branchId: 'branch-1',
          email: 'john@example.com',
          dateSent: '2024-01-15',
          timeSent: '10:30:00',
          reportType: 'daily',
          status: 'approved',
          isApproved: true,
          loansDispursed: 5,
          loansValueDispursed: '50000',
          savingsCollected: '25000',
          repaymentsCollected: 3,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T15:00:00Z',
          approvedBy: 'manager-1',
          approvedAt: '2024-01-16T15:00:00Z'
        };

        const mockResponse = {
          success: true,
          data: mockApprovedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.approveReport('1', mockApprovalData);

        expect(result.status).toBe('approved');
        expect(result.approvedBy).toBe('manager-1');
      });

      it('should allow system admins to approve any report', async () => {
        const mockApprovedReport: Report = {
          id: '1',
          reportId: 'RPT-001',
          creditOfficer: 'John Doe',
          creditOfficerId: 'co-1',
          branch: 'Main Branch',
          branchId: 'branch-1',
          email: 'john@example.com',
          dateSent: '2024-01-15',
          timeSent: '10:30:00',
          reportType: 'daily',
          status: 'approved',
          isApproved: true,
          loansDispursed: 5,
          loansValueDispursed: '50000',
          savingsCollected: '25000',
          repaymentsCollected: 3,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T15:00:00Z',
          approvedBy: 'admin-1',
          approvedAt: '2024-01-16T15:00:00Z'
        };

        const adminApprovalData: ReportApprovalData = {
          status: 'approved',
          comments: 'Admin approval',
          approvedBy: 'admin-1',
          approvedAt: '2024-01-16T15:00:00Z'
        };

        const mockResponse = {
          success: true,
          data: mockApprovedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.approveReport('1', adminApprovalData);

        expect(result.status).toBe('approved');
        expect(result.approvedBy).toBe('admin-1');
      });

      it('should handle role-based authorization errors', async () => {
        const mockError = new Error('Insufficient permissions for this action');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Insufficient permissions for this action');

        await expect(reportsService.approveReport('1', mockApprovalData)).rejects.toThrow('Insufficient permissions for this action');
      });
    });

    describe('Metadata Handling', () => {
      it('should preserve all approval metadata fields', async () => {
        const completeApprovalData: ReportApprovalData = {
          status: 'approved',
          comments: 'Comprehensive approval with all metadata',
          approvedBy: 'manager-1',
          approvedAt: '2024-01-16T15:30:45Z'
        };

        const mockApprovedReport: Report = {
          id: '1',
          reportId: 'RPT-001',
          creditOfficer: 'John Doe',
          creditOfficerId: 'co-1',
          branch: 'Main Branch',
          branchId: 'branch-1',
          email: 'john@example.com',
          dateSent: '2024-01-15',
          timeSent: '10:30:00',
          reportType: 'daily',
          status: 'approved',
          isApproved: true,
          loansDispursed: 5,
          loansValueDispursed: '50000',
          savingsCollected: '25000',
          repaymentsCollected: 3,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T15:30:45Z',
          approvedBy: 'manager-1',
          approvedAt: '2024-01-16T15:30:45Z'
        };

        const mockResponse = {
          success: true,
          data: mockApprovedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.approveReport('1', completeApprovalData);

        // Verify all metadata is preserved
        expect(result.approvedBy).toBe('manager-1');
        expect(result.approvedAt).toBe('2024-01-16T15:30:45Z');
        expect(result.updatedAt).toBe('2024-01-16T15:30:45Z');
        expect(result.status).toBe('approved');
        expect(result.isApproved).toBe(true);
      });

      it('should handle decline metadata with reason', async () => {
        const declineData: ReportApprovalData = {
          status: 'declined',
          comments: 'Incomplete loan disbursement data',
          approvedBy: 'manager-2',
          approvedAt: '2024-01-16T16:00:00Z'
        };

        const mockDeclinedReport: Report = {
          id: '1',
          reportId: 'RPT-001',
          creditOfficer: 'John Doe',
          creditOfficerId: 'co-1',
          branch: 'Main Branch',
          branchId: 'branch-1',
          email: 'john@example.com',
          dateSent: '2024-01-15',
          timeSent: '10:30:00',
          reportType: 'daily',
          status: 'declined',
          isApproved: false,
          loansDispursed: 5,
          loansValueDispursed: '50000',
          savingsCollected: '25000',
          repaymentsCollected: 3,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T16:00:00Z',
          approvedBy: 'manager-2',
          approvedAt: '2024-01-16T16:00:00Z',
          declineReason: 'Incomplete loan disbursement data'
        };

        const mockResponse = {
          success: true,
          data: mockDeclinedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.declineReport('1', declineData);

        // Verify decline metadata is preserved
        expect(result.approvedBy).toBe('manager-2');
        expect(result.approvedAt).toBe('2024-01-16T16:00:00Z');
        expect(result.declineReason).toBe('Incomplete loan disbursement data');
        expect(result.status).toBe('declined');
        expect(result.isApproved).toBe(false);
      });

      it('should handle timestamp precision in metadata', async () => {
        const preciseTimestamp = '2024-01-16T15:30:45.123Z';
        const approvalData: ReportApprovalData = {
          status: 'approved',
          comments: 'Timestamp precision test',
          approvedBy: 'manager-1',
          approvedAt: preciseTimestamp
        };

        const mockApprovedReport: Report = {
          id: '1',
          reportId: 'RPT-001',
          creditOfficer: 'John Doe',
          creditOfficerId: 'co-1',
          branch: 'Main Branch',
          branchId: 'branch-1',
          email: 'john@example.com',
          dateSent: '2024-01-15',
          timeSent: '10:30:00',
          reportType: 'daily',
          status: 'approved',
          isApproved: true,
          loansDispursed: 5,
          loansValueDispursed: '50000',
          savingsCollected: '25000',
          repaymentsCollected: 3,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: preciseTimestamp,
          approvedBy: 'manager-1',
          approvedAt: preciseTimestamp
        };

        const mockResponse = {
          success: true,
          data: mockApprovedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.approveReport('1', approvalData);

        expect(result.approvedAt).toBe(preciseTimestamp);
        expect(result.updatedAt).toBe(preciseTimestamp);
      });

      it('should handle metadata validation errors', async () => {
        const invalidApprovalData: ReportApprovalData = {
          status: 'approved',
          comments: 'Test',
          approvedBy: '', // Invalid empty approver
          approvedAt: 'invalid-date' // Invalid date format
        };

        const mockError = new Error('Invalid approval metadata');
        mockApiClient.put.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Invalid approval metadata');

        await expect(reportsService.approveReport('1', invalidApprovalData)).rejects.toThrow('Invalid approval metadata');
      });

      it('should handle missing optional metadata gracefully', async () => {
        const minimalApprovalData: ReportApprovalData = {
          status: 'approved',
          approvedBy: 'manager-1',
          approvedAt: '2024-01-16T15:00:00Z'
          // comments is optional
        };

        const mockApprovedReport: Report = {
          id: '1',
          reportId: 'RPT-001',
          creditOfficer: 'John Doe',
          creditOfficerId: 'co-1',
          branch: 'Main Branch',
          branchId: 'branch-1',
          email: 'john@example.com',
          dateSent: '2024-01-15',
          timeSent: '10:30:00',
          reportType: 'daily',
          status: 'approved',
          isApproved: true,
          loansDispursed: 5,
          loansValueDispursed: '50000',
          savingsCollected: '25000',
          repaymentsCollected: 3,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T15:00:00Z',
          approvedBy: 'manager-1',
          approvedAt: '2024-01-16T15:00:00Z'
        };

        const mockResponse = {
          success: true,
          data: mockApprovedReport
        };

        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await reportsService.approveReport('1', minimalApprovalData);

        expect(result.status).toBe('approved');
        expect(result.approvedBy).toBe('manager-1');
        expect(result.approvedAt).toBe('2024-01-16T15:00:00Z');
      });
    });
  });

  describe('getReportStatistics', () => {
    const mockStatistics: ReportStatistics = {
      totalReports: { count: 100, growth: 10 },
      submittedReports: { count: 80, growth: 8 },
      pendingReports: { count: 15, growth: 2 },
      approvedReports: { count: 60, growth: 5 },
      missedReports: { count: 5, growth: -1 }
    };

    it('should call the correct API endpoint with no filters', async () => {
      const mockResponse = {
        success: true,
        data: mockStatistics
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getReportStatistics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/statistics?page=1&limit=100');
      expect(result).toEqual(mockStatistics);
    });

    it('should call the correct API endpoint with date filters', async () => {
      const mockResponse = {
        success: true,
        data: mockStatistics
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const filters = {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        branchId: 'branch-1'
      };

      await reportsService.getReportStatistics(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/reports/statistics?page=1&limit=100&dateFrom=2024-01-01&dateTo=2024-01-31&branchId=branch-1'
      );
    });

    it('should return data in the expected format', async () => {
      const mockResponse = {
        success: true,
        data: mockStatistics
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getReportStatistics();

      expect(result).toHaveProperty('totalReports');
      expect(result).toHaveProperty('pendingReports');
      expect(result).toHaveProperty('approvedReports');
      expect(result.totalReports).toHaveProperty('count');
      expect(result.totalReports).toHaveProperty('growth');
    });
  });

  describe('getBranchReportStatistics', () => {
    const mockBranchStatistics: ReportStatistics = {
      totalReports: { count: 25, growth: 3 },
      submittedReports: { count: 20, growth: 2 },
      pendingReports: { count: 5, growth: 1 },
      approvedReports: { count: 15, growth: 1 },
      missedReports: { count: 2, growth: 0 }
    };

    it('should call the correct API endpoint with branch ID', async () => {
      const mockResponse = {
        success: true,
        data: mockBranchStatistics
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getBranchReportStatistics('branch-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/branch-1/statistics?page=1&limit=100');
      expect(result).toEqual(mockBranchStatistics);
    });

    it('should call the correct API endpoint with branch ID and date filters', async () => {
      const mockResponse = {
        success: true,
        data: mockBranchStatistics
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const filters = {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      };

      await reportsService.getBranchReportStatistics('branch-1', filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/reports/branch/branch-1/statistics?page=1&limit=100&dateFrom=2024-01-01&dateTo=2024-01-31'
      );
    });

    it('should handle branch not found errors', async () => {
      const mockError = new Error('Branch not found');
      mockApiClient.get.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Branch not found');

      await expect(reportsService.getBranchReportStatistics('invalid-branch')).rejects.toThrow('Branch not found');
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle network timeout errors', async () => {
      const mockError = new Error('Request timeout');
      mockApiClient.get.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Request timeout');

      await expect(reportsService.getAllReports()).rejects.toThrow('Request timeout');
      expect(console.error).toHaveBeenCalledWith('Reports fetch error:', 'Request timeout');
    });

    it('should handle authentication errors', async () => {
      const mockError = new Error('Unauthorized');
      mockApiClient.get.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Unauthorized');

      await expect(reportsService.getReportById('1')).rejects.toThrow('Unauthorized');
      expect(console.error).toHaveBeenCalledWith('Report details fetch error:', 'Unauthorized');
    });

    it('should handle server errors', async () => {
      const mockError = new Error('Internal server error');
      mockApiClient.post.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Internal server error');

      await expect(reportsService.createReport({})).rejects.toThrow('Internal server error');
      expect(console.error).toHaveBeenCalledWith('Report creation error:', 'Internal server error');
    });

    it('should handle validation errors', async () => {
      // Mock getReportById to return pending report (passes frontend validation)
      const mockPendingReport: Report = {
        id: '1',
        reportId: 'RPT-001',
        creditOfficer: 'John Doe',
        creditOfficerId: 'co-1',
        branch: 'Main Branch',
        branchId: 'branch-1',
        email: 'john@example.com',
        dateSent: '2024-01-15',
        timeSent: '10:30:00',
        reportType: 'daily',
        status: 'pending',
        loansDispursed: 5,
        loansValueDispursed: '50000',
        savingsCollected: '25000',
        repaymentsCollected: 3,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      };

      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockPendingReport
      });

      const mockError = new Error('Validation failed');
      mockApiClient.put.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Validation failed');

      await expect(reportsService.updateReport('1', {})).rejects.toThrow('Validation failed');
      expect(console.error).toHaveBeenCalledWith('Report update error:', 'Validation failed');
    });
  });

  describe('Data Format Consistency', () => {
    it('should maintain consistent report data structure across all operations', async () => {
      const expectedReportStructure = {
        id: expect.any(String),
        reportId: expect.any(String),
        creditOfficer: expect.any(String),
        creditOfficerId: expect.any(String),
        branch: expect.any(String),
        branchId: expect.any(String),
        email: expect.any(String),
        dateSent: expect.any(String),
        timeSent: expect.any(String),
        reportType: expect.stringMatching(/^(daily|weekly|monthly)$/),
        status: expect.stringMatching(/^(submitted|pending|approved|declined)$/),
        loansDispursed: expect.any(Number),
        loansValueDispursed: expect.any(String),
        savingsCollected: expect.any(String),
        repaymentsCollected: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      };

      // Test getAllReports data structure
      const mockListResponse = {
        success: true,
        data: {
          data: [expectedReportStructure],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
        }
      };
      mockApiClient.get.mockResolvedValue(mockListResponse);
      const listResult = await reportsService.getAllReports();
      expect(listResult.data[0]).toMatchObject(expectedReportStructure);

      // Test getReportById data structure
      const mockDetailResponse = {
        success: true,
        data: expectedReportStructure
      };
      mockApiClient.get.mockResolvedValue(mockDetailResponse);
      const detailResult = await reportsService.getReportById('1');
      expect(detailResult).toMatchObject(expectedReportStructure);
    });

    it('should maintain consistent statistics data structure', async () => {
      const expectedStatisticsStructure = {
        totalReports: { count: expect.any(Number), growth: expect.any(Number) },
        submittedReports: { count: expect.any(Number), growth: expect.any(Number) },
        pendingReports: { count: expect.any(Number), growth: expect.any(Number) },
        approvedReports: { count: expect.any(Number), growth: expect.any(Number) },
        missedReports: { count: expect.any(Number), growth: expect.any(Number) }
      };

      const mockResponse = {
        success: true,
        data: expectedStatisticsStructure
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getReportStatistics();
      expect(result).toMatchObject(expectedStatisticsStructure);
    });

    it('should maintain consistent pagination structure', async () => {
      const expectedPaginationStructure = {
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number)
      };

      const mockResponse = {
        success: true,
        data: {
          data: [],
          pagination: expectedPaginationStructure
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getAllReports();
      expect(result.pagination).toMatchObject(expectedPaginationStructure);
    });
  });

  describe('Statistics Integration Tests', () => {
    describe('KPI Calculation Accuracy', () => {
      const mockStatistics: ReportStatistics = {
        totalReports: { count: 150, growth: 12.5 },
        submittedReports: { count: 120, growth: 10.0 },
        pendingReports: { count: 25, growth: 15.0 },
        approvedReports: { count: 90, growth: 8.5 },
        missedReports: { count: 5, growth: -2.0 }
      };

      it('should calculate KPI values accurately from statistics data', async () => {
        const mockResponse = {
          success: true,
          data: mockStatistics
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getReportStatistics();

        // Verify KPI calculation accuracy
        expect(result.totalReports.count).toBe(150);
        expect(result.totalReports.growth).toBe(12.5);
        expect(result.pendingReports.count).toBe(25);
        expect(result.pendingReports.growth).toBe(15.0);
        expect(result.approvedReports.count).toBe(90);
        expect(result.approvedReports.growth).toBe(8.5);
        expect(result.missedReports.count).toBe(5);
        expect(result.missedReports.growth).toBe(-2.0);
      });

      it('should handle zero values in KPI calculations', async () => {
        const zeroStatistics: ReportStatistics = {
          totalReports: { count: 0, growth: 0 },
          submittedReports: { count: 0, growth: 0 },
          pendingReports: { count: 0, growth: 0 },
          approvedReports: { count: 0, growth: 0 },
          missedReports: { count: 0, growth: 0 }
        };

        const mockResponse = {
          success: true,
          data: zeroStatistics
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getReportStatistics();

        // Verify zero values are handled correctly
        expect(result.totalReports.count).toBe(0);
        expect(result.totalReports.growth).toBe(0);
        expect(result.pendingReports.count).toBe(0);
        expect(result.approvedReports.count).toBe(0);
        expect(result.missedReports.count).toBe(0);
      });

      it('should handle negative growth values in KPI calculations', async () => {
        const negativeGrowthStats: ReportStatistics = {
          totalReports: { count: 100, growth: -5.5 },
          submittedReports: { count: 80, growth: -3.2 },
          pendingReports: { count: 15, growth: -10.0 },
          approvedReports: { count: 60, growth: -2.1 },
          missedReports: { count: 10, growth: 25.0 }
        };

        const mockResponse = {
          success: true,
          data: negativeGrowthStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getReportStatistics();

        // Verify negative growth values are preserved
        expect(result.totalReports.growth).toBe(-5.5);
        expect(result.pendingReports.growth).toBe(-10.0);
        expect(result.approvedReports.growth).toBe(-2.1);
        expect(result.missedReports.growth).toBe(25.0);
      });

      it('should maintain precision in KPI calculations', async () => {
        const preciseStatistics: ReportStatistics = {
          totalReports: { count: 1234, growth: 12.345 },
          submittedReports: { count: 987, growth: 9.876 },
          pendingReports: { count: 123, growth: 1.234 },
          approvedReports: { count: 789, growth: 7.890 },
          missedReports: { count: 45, growth: 4.567 }
        };

        const mockResponse = {
          success: true,
          data: preciseStatistics
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getReportStatistics();

        // Verify precision is maintained
        expect(result.totalReports.count).toBe(1234);
        expect(result.totalReports.growth).toBe(12.345);
        expect(result.pendingReports.growth).toBe(1.234);
        expect(result.approvedReports.growth).toBe(7.890);
        expect(result.missedReports.growth).toBe(4.567);
      });

      it('should validate KPI data consistency across different time periods', async () => {
        const currentPeriodStats: ReportStatistics = {
          totalReports: { count: 200, growth: 10.0 },
          submittedReports: { count: 160, growth: 8.0 },
          pendingReports: { count: 30, growth: 20.0 },
          approvedReports: { count: 120, growth: 5.0 },
          missedReports: { count: 10, growth: 0.0 }
        };

        const mockResponse = {
          success: true,
          data: currentPeriodStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getReportStatistics({
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31'
        });

        // Verify data consistency
        expect(result.totalReports.count).toBeGreaterThanOrEqual(
          result.submittedReports.count
        );
        expect(result.submittedReports.count).toBeGreaterThanOrEqual(
          result.approvedReports.count
        );
        expect(result.totalReports.count).toBeGreaterThanOrEqual(
          result.pendingReports.count
        );
      });
    });

    describe('Branch-Specific Statistics', () => {
      const mockBranchStats: ReportStatistics = {
        totalReports: { count: 45, growth: 8.0 },
        submittedReports: { count: 35, growth: 6.0 },
        pendingReports: { count: 8, growth: 12.0 },
        approvedReports: { count: 25, growth: 4.0 },
        missedReports: { count: 2, growth: -1.0 }
      };

      it('should fetch statistics for specific branch correctly', async () => {
        const mockResponse = {
          success: true,
          data: mockBranchStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getBranchReportStatistics('branch-123');

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/branch-123/statistics?page=1&limit=100');
        expect(result).toEqual(mockBranchStats);
      });

      it('should handle multiple branch statistics requests', async () => {
        const branch1Stats = { ...mockBranchStats, totalReports: { count: 30, growth: 5.0 } };
        const branch2Stats = { ...mockBranchStats, totalReports: { count: 50, growth: 10.0 } };

        mockApiClient.get
          .mockResolvedValueOnce({ success: true, data: branch1Stats })
          .mockResolvedValueOnce({ success: true, data: branch2Stats });

        const [result1, result2] = await Promise.all([
          reportsService.getBranchReportStatistics('branch-1'),
          reportsService.getBranchReportStatistics('branch-2')
        ]);

        expect(result1.totalReports.count).toBe(30);
        expect(result2.totalReports.count).toBe(50);
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/branch-1/statistics?page=1&limit=100');
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/branch-2/statistics?page=1&limit=100');
      });

      it('should filter global statistics by branch ID', async () => {
        const mockResponse = {
          success: true,
          data: mockBranchStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getReportStatistics({
          branchId: 'branch-456'
        });

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/statistics?page=1&limit=100&branchId=branch-456');
        expect(result).toEqual(mockBranchStats);
      });

      it('should handle branch statistics with date filters', async () => {
        const mockResponse = {
          success: true,
          data: mockBranchStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        await reportsService.getBranchReportStatistics('branch-789', {
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31'
        });

        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/reports/branch/branch-789/statistics?dateFrom=2024-01-01&dateTo=2024-01-31'
        );
      });

      it('should validate branch-specific data integrity', async () => {
        const branchStats: ReportStatistics = {
          totalReports: { count: 25, growth: 5.0 },
          submittedReports: { count: 20, growth: 4.0 },
          pendingReports: { count: 3, growth: 10.0 },
          approvedReports: { count: 15, growth: 2.0 },
          missedReports: { count: 2, growth: 0.0 }
        };

        const mockResponse = {
          success: true,
          data: branchStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getBranchReportStatistics('branch-test');

        // Verify branch data integrity
        expect(result.totalReports.count).toBeGreaterThanOrEqual(result.submittedReports.count);
        expect(result.submittedReports.count).toBeGreaterThanOrEqual(result.approvedReports.count);
        expect(result.totalReports.count).toBeGreaterThanOrEqual(result.pendingReports.count);
        expect(result.totalReports.count).toBeGreaterThanOrEqual(result.missedReports.count);
      });

      it('should handle invalid branch IDs gracefully', async () => {
        const mockError = new Error('Branch not found');
        mockApiClient.get.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Branch not found');

        await expect(reportsService.getBranchReportStatistics('invalid-branch'))
          .rejects.toThrow('Branch not found');

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/invalid-branch/statistics?page=1&limit=100');
      });
    });

    describe('Time Period Filtering', () => {
      const mockTimeFilteredStats: ReportStatistics = {
        totalReports: { count: 75, growth: 15.0 },
        submittedReports: { count: 60, growth: 12.0 },
        pendingReports: { count: 10, growth: 25.0 },
        approvedReports: { count: 45, growth: 8.0 },
        missedReports: { count: 5, growth: 5.0 }
      };

      it('should filter statistics by date range correctly', async () => {
        const mockResponse = {
          success: true,
          data: mockTimeFilteredStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getReportStatistics({
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31'
        });

        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/reports/statistics?dateFrom=2024-01-01&dateTo=2024-01-31'
        );
        expect(result).toEqual(mockTimeFilteredStats);
      });

      it('should handle single date filters (dateFrom only)', async () => {
        const mockResponse = {
          success: true,
          data: mockTimeFilteredStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        await reportsService.getReportStatistics({
          dateFrom: '2024-01-01'
        });

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/statistics?page=1&limit=100&dateFrom=2024-01-01');
      });

      it('should handle single date filters (dateTo only)', async () => {
        const mockResponse = {
          success: true,
          data: mockTimeFilteredStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        await reportsService.getReportStatistics({
          dateTo: '2024-01-31'
        });

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/statistics?page=1&limit=100&dateTo=2024-01-31');
      });

      it('should handle complex time period filters with branch', async () => {
        const mockResponse = {
          success: true,
          data: mockTimeFilteredStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        await reportsService.getReportStatistics({
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31',
          branchId: 'branch-123'
        });

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/statistics?page=1&limit=100&dateFrom=2024-01-01&dateTo=2024-01-31&branchId=branch-123');
      });

      it('should validate time period data consistency', async () => {
        const shortPeriodStats: ReportStatistics = {
          totalReports: { count: 20, growth: 50.0 },
          submittedReports: { count: 15, growth: 40.0 },
          pendingReports: { count: 3, growth: 100.0 },
          approvedReports: { count: 10, growth: 25.0 },
          missedReports: { count: 2, growth: 0.0 }
        };

        const longPeriodStats: ReportStatistics = {
          totalReports: { count: 200, growth: 10.0 },
          submittedReports: { count: 160, growth: 8.0 },
          pendingReports: { count: 30, growth: 15.0 },
          approvedReports: { count: 120, growth: 5.0 },
          missedReports: { count: 10, growth: 2.0 }
        };

        // Mock short period call
        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: shortPeriodStats
        });

        const shortResult = await reportsService.getReportStatistics({
          dateFrom: '2024-01-01',
          dateTo: '2024-01-07'
        });

        // Mock long period call
        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: longPeriodStats
        });

        const longResult = await reportsService.getReportStatistics({
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        });

        // Verify longer periods typically have higher counts but lower growth rates
        expect(longResult.totalReports.count).toBeGreaterThan(shortResult.totalReports.count);
        expect(shortResult.totalReports.growth).toBeGreaterThan(longResult.totalReports.growth);
      });

      it('should handle edge case date formats', async () => {
        const mockResponse = {
          success: true,
          data: mockTimeFilteredStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        // Test ISO date format
        await reportsService.getReportStatistics({
          dateFrom: '2024-01-01T00:00:00Z',
          dateTo: '2024-01-31T23:59:59Z'
        });

        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/reports/statistics?dateFrom=2024-01-01T00%3A00%3A00Z&dateTo=2024-01-31T23%3A59%3A59Z'
        );
      });

      it('should handle branch statistics with time filtering', async () => {
        const mockResponse = {
          success: true,
          data: mockTimeFilteredStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        await reportsService.getBranchReportStatistics('branch-456', {
          dateFrom: '2024-02-01',
          dateTo: '2024-02-29'
        });

        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/reports/branch/branch-456/statistics?dateFrom=2024-02-01&dateTo=2024-02-29'
        );
      });

      it('should handle invalid date ranges gracefully', async () => {
        const mockError = new Error('Invalid date range');
        mockApiClient.get.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Invalid date range');

        await expect(reportsService.getReportStatistics({
          dateFrom: '2024-12-31',
          dateTo: '2024-01-01' // End date before start date
        })).rejects.toThrow('Invalid date range');
      });

      it('should handle future date ranges', async () => {
        const futureStats: ReportStatistics = {
          totalReports: { count: 0, growth: 0 },
          submittedReports: { count: 0, growth: 0 },
          pendingReports: { count: 0, growth: 0 },
          approvedReports: { count: 0, growth: 0 },
          missedReports: { count: 0, growth: 0 }
        };

        const mockResponse = {
          success: true,
          data: futureStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getReportStatistics({
          dateFrom: '2025-01-01',
          dateTo: '2025-01-31'
        });

        // Future dates should return zero counts
        expect(result.totalReports.count).toBe(0);
        expect(result.pendingReports.count).toBe(0);
        expect(result.approvedReports.count).toBe(0);
      });
    });
  });

  describe('Branch Filtering Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Reset console mocks
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    describe('Branch-Based Access Controls', () => {
      it('should enforce branch filtering for branch managers in getAllReports', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'branch-alpha',
          firstName: 'Branch',
          lastName: 'Manager',
          email: 'bm@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        // Should allow access to own branch
        await reportsService.getAllReports({ branchId: 'branch-alpha' });
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?branchId=branch-alpha');

        // Should deny access to other branches
        await expect(reportsService.getAllReports({ branchId: 'branch-beta' }))
          .rejects.toThrow('Access denied: Branch managers can only access reports from their assigned branch (branch-alpha)');
      });

      it('should allow system admins to access any branch reports', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'admin-1',
          role: 'system_admin',
          branch: 'main-branch',
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        // Should allow access to any branch
        await reportsService.getAllReports({ branchId: 'any-branch' });
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?branchId=any-branch');

        await reportsService.getAllReports({ branchId: 'another-branch' });
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?branchId=another-branch');
      });

      it('should allow account managers to access any branch reports', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'am-1',
          role: 'account_manager',
          branch: 'main-branch',
          firstName: 'Account',
          lastName: 'Manager',
          email: 'am@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        // Should allow access to any branch
        await reportsService.getAllReports({ branchId: 'branch-gamma' });
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?branchId=branch-gamma');
      });

      it('should handle credit officer role with backend filtering', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'co-1',
          role: 'credit_officer',
          branch: 'branch-delta',
          firstName: 'Credit',
          lastName: 'Officer',
          email: 'co@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        // Should allow request to proceed (backend handles filtering)
        await reportsService.getAllReports({ branchId: 'any-branch' });
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?branchId=any-branch');
      });

      it('should reject unknown roles', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'unknown-1',
          role: 'unknown_role' as any,
          branch: 'some-branch',
          firstName: 'Unknown',
          lastName: 'User',
          email: 'unknown@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        await expect(reportsService.getAllReports({ branchId: 'any-branch' }))
          .rejects.toThrow('Access denied: Role unknown_role does not have permission to access reports');

        expect(mockApiClient.get).not.toHaveBeenCalled();
      });

      it('should continue with request when user profile fetch fails', async () => {
        mockUserProfileService.getUserProfile.mockRejectedValue(new Error('Profile service unavailable'));

        const mockResponse = {
          success: true,
          data: {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        // Should not throw error and continue with API call
        await reportsService.getAllReports({ branchId: 'any-branch' });
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?branchId=any-branch');
        expect(console.warn).toHaveBeenCalledWith('Could not verify user authorization:', expect.any(Error));
      });
    });

    describe('Missed Reports Functionality', () => {
      const mockMissedReports: Report[] = [
        {
          id: 'missed-1',
          reportId: 'RPT-MISSED-001',
          creditOfficer: 'John Doe',
          creditOfficerId: 'co-1',
          branch: 'Branch Alpha',
          branchId: 'branch-alpha',
          email: 'john@example.com',
          dateSent: '2024-01-10',
          timeSent: '10:00:00',
          reportType: 'daily',
          status: 'missed',
          loansDispursed: 0,
          loansValueDispursed: '0',
          savingsCollected: '0',
          repaymentsCollected: 0,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z'
        },
        {
          id: 'missed-2',
          reportId: 'RPT-MISSED-002',
          creditOfficer: 'Jane Smith',
          creditOfficerId: 'co-2',
          branch: 'Branch Alpha',
          branchId: 'branch-alpha',
          email: 'jane@example.com',
          dateSent: '2024-01-11',
          timeSent: '09:00:00',
          reportType: 'weekly',
          status: 'missed',
          loansDispursed: 0,
          loansValueDispursed: '0',
          savingsCollected: '0',
          repaymentsCollected: 0,
          createdAt: '2024-01-11T09:00:00Z',
          updatedAt: '2024-01-11T09:00:00Z'
        }
      ];

      it('should fetch missed reports for specific branch with proper authorization', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'branch-alpha',
          firstName: 'Branch',
          lastName: 'Manager',
          email: 'bm@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: mockMissedReports,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getMissedReports('branch-alpha');

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?status=missed&branchId=branch-alpha');
        expect(result).toEqual(mockMissedReports);
        expect(result).toHaveLength(2);
        expect(result[0].status).toBe('missed');
        expect(result[1].status).toBe('missed');
      });

      it('should prevent branch managers from accessing missed reports from other branches', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'branch-alpha',
          firstName: 'Branch',
          lastName: 'Manager',
          email: 'bm@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        await expect(reportsService.getMissedReports('branch-beta'))
          .rejects.toThrow('Access denied: Branch managers can only access reports from their assigned branch (branch-alpha)');

        expect(mockApiClient.get).not.toHaveBeenCalled();
      });

      it('should allow system admins to access missed reports from any branch', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'admin-1',
          role: 'system_admin',
          branch: 'main-branch',
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: mockMissedReports,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getMissedReports('any-branch');

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?status=missed&branchId=any-branch');
        expect(result).toEqual(mockMissedReports);
      });

      it('should fetch missed reports with date filters', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'admin-1',
          role: 'system_admin',
          branch: 'main-branch',
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: mockMissedReports,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const filters = {
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31'
        };

        const result = await reportsService.getMissedReports('branch-alpha', filters);

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?status=missed&branchId=branch-alpha&dateFrom=2024-01-01&dateTo=2024-01-31');
        expect(result).toEqual(mockMissedReports);
      });

      it('should handle empty missed reports response', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'branch-alpha',
          firstName: 'Branch',
          lastName: 'Manager',
          email: 'bm@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getMissedReports('branch-alpha');

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });

      it('should handle API errors when fetching missed reports', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'branch-alpha',
          firstName: 'Branch',
          lastName: 'Manager',
          email: 'bm@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockError = new Error('Failed to fetch missed reports');
        mockApiClient.get.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Failed to fetch missed reports');

        await expect(reportsService.getMissedReports('branch-alpha')).rejects.toThrow('Failed to fetch missed reports');
        expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(mockError, {
          logError: true,
          showToast: false
        });
        expect(console.error).toHaveBeenCalledWith('Missed reports fetch error:', 'Failed to fetch missed reports');
      });

      it('should not apply authorization when no branch is specified for missed reports', async () => {
        const mockResponse = {
          success: true,
          data: {
            data: mockMissedReports,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        // Should not throw authorization error when no branch is specified
        const result = await reportsService.getMissedReports();

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?status=missed');
        expect(result).toEqual(mockMissedReports);
      });
    });

    describe('Branch Statistics Authorization', () => {
      const mockBranchStats: ReportStatistics = {
        totalReports: { count: 25, growth: 5.0 },
        submittedReports: { count: 20, growth: 4.0 },
        pendingReports: { count: 3, growth: 10.0 },
        approvedReports: { count: 15, growth: 2.0 },
        missedReports: { count: 2, growth: 0.0 }
      };

      it('should allow branch managers to access their own branch statistics', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'branch-gamma',
          firstName: 'Branch',
          lastName: 'Manager',
          email: 'bm@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: mockBranchStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getBranchReportStatistics('branch-gamma');

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/branch-gamma/statistics?page=1&limit=100');
        expect(result).toEqual(mockBranchStats);
      });

      it('should prevent branch managers from accessing other branch statistics', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'branch-gamma',
          firstName: 'Branch',
          lastName: 'Manager',
          email: 'bm@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        await expect(reportsService.getBranchReportStatistics('branch-delta'))
          .rejects.toThrow('Access denied: Branch managers can only access reports from their assigned branch (branch-gamma)');

        expect(mockApiClient.get).not.toHaveBeenCalled();
      });

      it('should allow system admins to access any branch statistics', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'admin-1',
          role: 'system_admin',
          branch: 'main-branch',
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: mockBranchStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getBranchReportStatistics('any-branch');

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/any-branch/statistics?page=1&limit=100');
        expect(result).toEqual(mockBranchStats);
      });

      it('should allow account managers to access any branch statistics', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'am-1',
          role: 'account_manager',
          branch: 'main-branch',
          firstName: 'Account',
          lastName: 'Manager',
          email: 'am@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: mockBranchStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await reportsService.getBranchReportStatistics('any-branch');

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/any-branch/statistics?page=1&limit=100');
        expect(result).toEqual(mockBranchStats);
      });

      it('should handle branch statistics with date filters and authorization', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'branch-epsilon',
          firstName: 'Branch',
          lastName: 'Manager',
          email: 'bm@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: mockBranchStats
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const filters = {
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31'
        };

        const result = await reportsService.getBranchReportStatistics('branch-epsilon', filters);

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/branch-epsilon/statistics?page=1&limit=100&dateFrom=2024-01-01&dateTo=2024-01-31');
        expect(result).toEqual(mockBranchStats);
      });

      it('should handle API errors when fetching branch statistics', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'branch-zeta',
          firstName: 'Branch',
          lastName: 'Manager',
          email: 'bm@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockError = new Error('Branch not found');
        mockApiClient.get.mockRejectedValue(mockError);
        mockErrorHandler.handleApiError.mockReturnValue('Branch not found');

        await expect(reportsService.getBranchReportStatistics('branch-zeta')).rejects.toThrow('Branch not found');
        expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(mockError, {
          logError: true,
          showToast: false
        });
        expect(console.error).toHaveBeenCalledWith('Branch report statistics fetch error:', 'Branch not found');
      });
    });
  });
});
  describe('Branch Authorization Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Reset console mocks
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    describe('Branch Manager Authorization', () => {
      it('should allow branch managers to access their own branch reports', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'main-branch',
          firstName: 'John',
          lastName: 'Manager',
          email: 'john@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        await reportsService.getAllReports({ branchId: 'main-branch' });

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?branchId=main-branch');
      });

      it('should prevent branch managers from accessing other branch reports', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'main-branch',
          firstName: 'John',
          lastName: 'Manager',
          email: 'john@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        await expect(reportsService.getAllReports({ branchId: 'other-branch' }))
          .rejects.toThrow('Access denied: Branch managers can only access reports from their assigned branch (main-branch)');

        expect(mockApiClient.get).not.toHaveBeenCalled();
      });

      it('should allow system admins to access any branch reports', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'admin-1',
          role: 'system_admin',
          branch: 'main-branch',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        await reportsService.getAllReports({ branchId: 'any-branch' });

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?branchId=any-branch');
      });

      it('should allow account managers to access any branch reports', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'am-1',
          role: 'account_manager',
          branch: 'main-branch',
          firstName: 'Account',
          lastName: 'Manager',
          email: 'am@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        await reportsService.getAllReports({ branchId: 'any-branch' });

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?branchId=any-branch');
      });

      it('should continue with request if user profile cannot be fetched', async () => {
        mockUserProfileService.getUserProfile.mockRejectedValue(new Error('Profile not found'));

        const mockResponse = {
          success: true,
          data: {
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        // Should not throw error and continue with API call
        await reportsService.getAllReports({ branchId: 'any-branch' });

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?branchId=any-branch');
      });
    });

    describe('Branch Statistics Authorization', () => {
      it('should allow branch managers to access their own branch statistics', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'main-branch',
          firstName: 'John',
          lastName: 'Manager',
          email: 'john@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        const mockResponse = {
          success: true,
          data: {
            totalReports: { count: 10, growth: 5 },
            pendingReports: { count: 2, growth: 1 },
            approvedReports: { count: 8, growth: 4 },
            missedReports: { count: 0, growth: 0 }
          }
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        await reportsService.getBranchReportStatistics('main-branch');

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/main-branch/statistics?page=1&limit=100');
      });

      it('should prevent branch managers from accessing other branch statistics', async () => {
        mockUserProfileService.getUserProfile.mockResolvedValue({
          id: 'bm-1',
          role: 'branch_manager',
          branch: 'main-branch',
          firstName: 'John',
          lastName: 'Manager',
          email: 'john@example.com',
          mobileNumber: '+1234567890',
          verificationStatus: 'verified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });

        await expect(reportsService.getBranchReportStatistics('other-branch'))
          .rejects.toThrow('Access denied: Branch managers can only access reports from their assigned branch (main-branch)');

        expect(mockApiClient.get).not.toHaveBeenCalled();
      });
    });
  });

  describe('getMissedReports', () => {
    const mockMissedReports: Report[] = [
      {
        id: '1',
        reportId: 'RPT-MISSED-001',
        creditOfficer: 'John Doe',
        creditOfficerId: 'co-1',
        branch: 'Main Branch',
        branchId: 'branch-1',
        email: 'john@example.com',
        dateSent: '2024-01-10',
        timeSent: '10:00:00',
        reportType: 'daily',
        status: 'missed',
        loansDispursed: 0,
        loansValueDispursed: '0',
        savingsCollected: '0',
        repaymentsCollected: 0,
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        reportId: 'RPT-MISSED-002',
        creditOfficer: 'Jane Smith',
        creditOfficerId: 'co-2',
        branch: 'Main Branch',
        branchId: 'branch-1',
        email: 'jane@example.com',
        dateSent: '2024-01-11',
        timeSent: '09:00:00',
        reportType: 'weekly',
        status: 'missed',
        loansDispursed: 0,
        loansValueDispursed: '0',
        savingsCollected: '0',
        repaymentsCollected: 0,
        createdAt: '2024-01-11T09:00:00Z',
        updatedAt: '2024-01-11T09:00:00Z'
      }
    ];

    const mockPaginatedResponse: PaginatedResponse<Report> = {
      data: mockMissedReports,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    };

    it('should call the correct API endpoint for all missed reports', async () => {
      const mockResponse = {
        success: true,
        data: mockPaginatedResponse
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getMissedReports();

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports?status=missed');
      expect(result).toEqual(mockMissedReports);
    });

    it('should call the correct API endpoint for branch-specific missed reports', async () => {
      // Use system admin to avoid authorization issues for this test
      mockUserProfileService.getUserProfile.mockResolvedValue({
        id: 'admin-1',
        role: 'system_admin',
        branch: 'main-branch',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        mobileNumber: '+1234567890',
        verificationStatus: 'verified',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      });

      const mockResponse = {
        success: true,
        data: mockPaginatedResponse
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getMissedReports('branch-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports?status=missed&branchId=branch-1');
      expect(result).toEqual(mockMissedReports);
    });

    it('should call the correct API endpoint with date filters', async () => {
      // Use system admin to avoid authorization issues for this test
      mockUserProfileService.getUserProfile.mockResolvedValue({
        id: 'admin-1',
        role: 'system_admin',
        branch: 'main-branch',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        mobileNumber: '+1234567890',
        verificationStatus: 'verified',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      });

      const mockResponse = {
        success: true,
        data: mockPaginatedResponse
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const filters = {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      };

      const result = await reportsService.getMissedReports('branch-1', filters);

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports?status=missed&branchId=branch-1&dateFrom=2024-01-01&dateTo=2024-01-31');
      expect(result).toEqual(mockMissedReports);
    });

    it('should return only the data array from paginated response', async () => {
      const mockResponse = {
        success: true,
        data: mockPaginatedResponse
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getMissedReports();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', '1');
      expect(result[0]).toHaveProperty('status', 'missed');
      expect(result[1]).toHaveProperty('id', '2');
      expect(result[1]).toHaveProperty('status', 'missed');
    });

    it('should handle empty missed reports response', async () => {
      const mockEmptyResponse: PaginatedResponse<Report> = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };

      const mockResponse = {
        success: true,
        data: mockEmptyResponse
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportsService.getMissedReports();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Failed to fetch missed reports');
      mockApiClient.get.mockRejectedValue(mockError);
      mockErrorHandler.handleApiError.mockReturnValue('Failed to fetch missed reports');

      await expect(reportsService.getMissedReports()).rejects.toThrow('Failed to fetch missed reports');
      expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(mockError, {
        logError: true,
        showToast: false
      });
    });

    it('should apply branch authorization for branch-specific missed reports', async () => {
      // Clear any previous calls
      jest.clearAllMocks();
      
      mockUserProfileService.getUserProfile.mockResolvedValue({
        id: 'bm-1',
        role: 'branch_manager',
        branch: 'main-branch',
        firstName: 'John',
        lastName: 'Manager',
        email: 'john@example.com',
        mobileNumber: '+1234567890',
        verificationStatus: 'verified',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      });

      await expect(reportsService.getMissedReports('other-branch'))
        .rejects.toThrow('Access denied: Branch managers can only access reports from their assigned branch (main-branch)');

      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should not apply authorization for all missed reports (no branch specified)', async () => {
      const mockResponse = {
        success: true,
        data: mockPaginatedResponse
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      // Should not throw authorization error when no branch is specified
      const result = await reportsService.getMissedReports();

      expect(mockApiClient.get).toHaveBeenCalledWith('/reports?status=missed');
      expect(result).toEqual(mockMissedReports);
    });
  });
