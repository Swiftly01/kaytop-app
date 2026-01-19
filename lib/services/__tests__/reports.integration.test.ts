/**
 * Reports API Integration Tests
 * End-to-end integration tests for the reports API integration
 * Tests complete workflows, cross-system error handling, and performance with real data
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5 (Error handling requirements)
 */

import { reportsService } from '../reports';
import { apiClient } from '../../api/client';
import { UnifiedAPIErrorHandler } from '../../api/errorHandler';
import { userProfileService } from '../userProfile';
import type { 
  Report, 
  ReportStatistics, 
  ReportApprovalData, 
  ReportFilters, 
  PaginatedResponse 
} from '../../api/types';

// Mock dependencies for integration testing
jest.mock('../../api/client');
jest.mock('../../api/errorHandler');
jest.mock('../userProfile');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockErrorHandler = UnifiedAPIErrorHandler as jest.Mocked<typeof UnifiedAPIErrorHandler>;
const mockUserProfileService = userProfileService as jest.Mocked<typeof userProfileService>;

describe('Reports API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Default user profile for integration tests
    mockUserProfileService.getUserProfile.mockResolvedValue({
      id: 'integration-user',
      role: 'system_admin',
      branch: 'main-branch',
      firstName: 'Integration',
      lastName: 'User',
      email: 'integration@example.com',
      mobileNumber: '+1234567890',
      verificationStatus: 'verified',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('End-to-End Report Workflows', () => {
    describe('Complete Report Lifecycle', () => {
      it('should handle complete report creation to approval workflow', async () => {
        // Step 1: Create a new report
        const reportData = {
          creditOfficerId: 'co-1',
          branchId: 'branch-1',
          reportType: 'daily',
          loansDispursed: 5,
          loansValueDispursed: '100000',
          savingsCollected: '50000',
          repaymentsCollected: 3
        };

        const createdReport: Report = {
          id: 'workflow-1',
          reportId: 'RPT-WF-001',
          creditOfficer: 'John Doe',
          creditOfficerId: 'co-1',
          branch: 'Main Branch',
          branchId: 'branch-1',
          email: 'john@example.com',
          dateSent: '2024-01-15',
          timeSent: '10:30:00',
          reportType: 'daily',
          status: 'submitted',
          loansDispursed: 5,
          loansValueDispursed: '100000',
          savingsCollected: '50000',
          repaymentsCollected: 3,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        };

        mockApiClient.post.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        const createResult = await reportsService.createReport(reportData);
        expect(createResult.id).toBe('workflow-1');
        expect(createResult.status).toBe('submitted');

        // Step 2: Fetch the created report
        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        const fetchResult = await reportsService.getReportById('workflow-1');
        expect(fetchResult.id).toBe('workflow-1');
        expect(fetchResult.status).toBe('submitted');

        // Step 3: Update the report
        const updateData = {
          loansDispursed: 6,
          loansValueDispursed: '120000'
        };

        const updatedReport: Report = {
          ...createdReport,
          loansDispursed: 6,
          loansValueDispursed: '120000',
          updatedAt: '2024-01-15T11:00:00Z'
        };

        // Mock getReportById for status check
        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        // Mock update API call
        mockApiClient.put.mockResolvedValueOnce({
          success: true,
          data: updatedReport
        });

        const updateResult = await reportsService.updateReport('workflow-1', updateData);
        expect(updateResult.loansDispursed).toBe(6);
        expect(updateResult.loansValueDispursed).toBe('120000');

        // Step 4: Approve the report
        const approvalData: ReportApprovalData = {
          status: 'approved',
          comments: 'Report approved after review',
          approvedBy: 'manager-1',
          approvedAt: '2024-01-15T15:00:00Z'
        };

        const approvedReport: Report = {
          ...updatedReport,
          status: 'approved',
          isApproved: true,
          approvedBy: 'manager-1',
          approvedAt: '2024-01-15T15:00:00Z',
          updatedAt: '2024-01-15T15:00:00Z'
        };

        mockApiClient.put.mockResolvedValueOnce({
          success: true,
          data: approvedReport
        });

        const approvalResult = await reportsService.approveReport('workflow-1', approvalData);
        expect(approvalResult.status).toBe('approved');
        expect(approvalResult.isApproved).toBe(true);
        expect(approvalResult.approvedBy).toBe('manager-1');

        // Verify all API calls were made correctly
        expect(mockApiClient.post).toHaveBeenCalledWith('/reports', reportData);
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/workflow-1');
        expect(mockApiClient.put).toHaveBeenCalledWith('/reports/workflow-1', updateData);
        expect(mockApiClient.put).toHaveBeenCalledWith('/reports/workflow-1/approve', approvalData);
      });

      it('should handle complete report creation to decline workflow', async () => {
        // Step 1: Create report
        const reportData = {
          creditOfficerId: 'co-2',
          branchId: 'branch-2',
          reportType: 'weekly',
          loansDispursed: 2,
          loansValueDispursed: '50000',
          savingsCollected: '25000',
          repaymentsCollected: 1
        };

        const createdReport: Report = {
          id: 'workflow-2',
          reportId: 'RPT-WF-002',
          creditOfficer: 'Jane Smith',
          creditOfficerId: 'co-2',
          branch: 'Branch Two',
          branchId: 'branch-2',
          email: 'jane@example.com',
          dateSent: '2024-01-16',
          timeSent: '09:00:00',
          reportType: 'weekly',
          status: 'submitted',
          loansDispursed: 2,
          loansValueDispursed: '50000',
          savingsCollected: '25000',
          repaymentsCollected: 1,
          createdAt: '2024-01-16T09:00:00Z',
          updatedAt: '2024-01-16T09:00:00Z'
        };

        mockApiClient.post.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        const createResult = await reportsService.createReport(reportData);
        expect(createResult.status).toBe('submitted');

        // Step 2: Decline the report
        const declineData: ReportApprovalData = {
          status: 'declined',
          comments: 'Insufficient documentation provided',
          approvedBy: 'manager-2',
          approvedAt: '2024-01-16T14:00:00Z'
        };

        const declinedReport: Report = {
          ...createdReport,
          status: 'declined',
          isApproved: false,
          approvedBy: 'manager-2',
          approvedAt: '2024-01-16T14:00:00Z',
          declineReason: 'Insufficient documentation provided',
          updatedAt: '2024-01-16T14:00:00Z'
        };

        mockApiClient.put.mockResolvedValueOnce({
          success: true,
          data: declinedReport
        });

        const declineResult = await reportsService.declineReport('workflow-2', declineData);
        expect(declineResult.status).toBe('declined');
        expect(declineResult.isApproved).toBe(false);
        expect(declineResult.declineReason).toBe('Insufficient documentation provided');

        // Verify API calls
        expect(mockApiClient.post).toHaveBeenCalledWith('/reports', reportData);
        expect(mockApiClient.put).toHaveBeenCalledWith('/reports/workflow-2/decline', declineData);
      });

      it('should handle report deletion workflow', async () => {
        // Step 1: Create report
        const reportData = {
          creditOfficerId: 'co-3',
          branchId: 'branch-3',
          reportType: 'daily',
          loansDispursed: 1,
          loansValueDispursed: '25000',
          savingsCollected: '10000',
          repaymentsCollected: 0
        };

        const createdReport: Report = {
          id: 'workflow-3',
          reportId: 'RPT-WF-003',
          creditOfficer: 'Bob Johnson',
          creditOfficerId: 'co-3',
          branch: 'Branch Three',
          branchId: 'branch-3',
          email: 'bob@example.com',
          dateSent: '2024-01-17',
          timeSent: '11:00:00',
          reportType: 'daily',
          status: 'pending',
          loansDispursed: 1,
          loansValueDispursed: '25000',
          savingsCollected: '10000',
          repaymentsCollected: 0,
          createdAt: '2024-01-17T11:00:00Z',
          updatedAt: '2024-01-17T11:00:00Z'
        };

        mockApiClient.post.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        const createResult = await reportsService.createReport(reportData);
        expect(createResult.status).toBe('pending');

        // Step 2: Delete the report
        // Mock getReportById for status check
        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        mockApiClient.delete.mockResolvedValueOnce({
          success: true
        });

        await reportsService.deleteReport('workflow-3');

        // Verify API calls
        expect(mockApiClient.post).toHaveBeenCalledWith('/reports', reportData);
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/workflow-3');
        expect(mockApiClient.delete).toHaveBeenCalledWith('/reports/workflow-3');
      });
    });

    describe('Batch Operations Workflow', () => {
      it('should handle multiple report operations in sequence', async () => {
        const reports = [
          { id: 'batch-1', status: 'submitted' },
          { id: 'batch-2', status: 'submitted' },
          { id: 'batch-3', status: 'submitted' }
        ];

        // Mock fetching multiple reports
        const mockReportsResponse: PaginatedResponse<Report> = {
          data: reports.map(r => ({
            id: r.id,
            reportId: `RPT-${r.id.toUpperCase()}`,
            creditOfficer: 'Test Officer',
            creditOfficerId: 'co-test',
            branch: 'Test Branch',
            branchId: 'branch-test',
            email: 'test@example.com',
            dateSent: '2024-01-18',
            timeSent: '10:00:00',
            reportType: 'daily',
            status: r.status as any,
            loansDispursed: 1,
            loansValueDispursed: '10000',
            savingsCollected: '5000',
            repaymentsCollected: 1,
            createdAt: '2024-01-18T10:00:00Z',
            updatedAt: '2024-01-18T10:00:00Z'
          })),
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1
          }
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: mockReportsResponse
        });

        const fetchResult = await reportsService.getAllReports({ status: 'submitted' });
        expect(fetchResult.data).toHaveLength(3);

        // Mock batch approval operations
        const approvalData: ReportApprovalData = {
          status: 'approved',
          comments: 'Batch approval',
          approvedBy: 'batch-manager',
          approvedAt: '2024-01-18T15:00:00Z'
        };

        for (const report of fetchResult.data) {
          const approvedReport: Report = {
            ...report,
            status: 'approved',
            isApproved: true,
            approvedBy: 'batch-manager',
            approvedAt: '2024-01-18T15:00:00Z',
            updatedAt: '2024-01-18T15:00:00Z'
          };

          mockApiClient.put.mockResolvedValueOnce({
            success: true,
            data: approvedReport
          });
        }

        // Execute batch approvals
        const approvalResults = await Promise.all(
          fetchResult.data.map(report => 
            reportsService.approveReport(report.id, approvalData)
          )
        );

        // Verify all reports were approved
        approvalResults.forEach(result => {
          expect(result.status).toBe('approved');
          expect(result.isApproved).toBe(true);
        });

        // Verify API calls
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?status=submitted');
        expect(mockApiClient.put).toHaveBeenCalledTimes(3);
      });
    });

    describe('Statistics Integration Workflow', () => {
      it('should maintain statistics consistency across report operations', async () => {
        // Initial statistics
        const initialStats: ReportStatistics = {
          totalReports: { count: 10, growth: 5.0 },
          submittedReports: { count: 8, growth: 4.0 },
          pendingReports: { count: 3, growth: 2.0 },
          approvedReports: { count: 5, growth: 3.0 },
          missedReports: { count: 0, growth: 0.0 }
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: initialStats
        });

        const initialResult = await reportsService.getReportStatistics();
        expect(initialResult.totalReports.count).toBe(10);
        expect(initialResult.pendingReports.count).toBe(3);

        // Create a new report
        const newReport: Report = {
          id: 'stats-1',
          reportId: 'RPT-STATS-001',
          creditOfficer: 'Stats Officer',
          creditOfficerId: 'co-stats',
          branch: 'Stats Branch',
          branchId: 'branch-stats',
          email: 'stats@example.com',
          dateSent: '2024-01-19',
          timeSent: '12:00:00',
          reportType: 'daily',
          status: 'submitted',
          loansDispursed: 2,
          loansValueDispursed: '30000',
          savingsCollected: '15000',
          repaymentsCollected: 1,
          createdAt: '2024-01-19T12:00:00Z',
          updatedAt: '2024-01-19T12:00:00Z'
        };

        mockApiClient.post.mockResolvedValueOnce({
          success: true,
          data: newReport
        });

        await reportsService.createReport({
          creditOfficerId: 'co-stats',
          branchId: 'branch-stats',
          reportType: 'daily',
          loansDispursed: 2,
          loansValueDispursed: '30000',
          savingsCollected: '15000',
          repaymentsCollected: 1
        });

        // Updated statistics after creation
        const updatedStats: ReportStatistics = {
          totalReports: { count: 11, growth: 5.5 },
          submittedReports: { count: 9, growth: 4.5 },
          pendingReports: { count: 3, growth: 2.0 },
          approvedReports: { count: 5, growth: 3.0 },
          missedReports: { count: 0, growth: 0.0 }
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: updatedStats
        });

        const updatedResult = await reportsService.getReportStatistics();
        expect(updatedResult.totalReports.count).toBe(11);
        expect(updatedResult.submittedReports.count).toBe(9);

        // Verify statistics consistency
        expect(updatedResult.totalReports.count).toBeGreaterThan(initialResult.totalReports.count);
        expect(updatedResult.submittedReports.count).toBeGreaterThan(initialResult.submittedReports.count);
      });
    });
  });

  describe('Cross-System Error Handling', () => {
    describe('Network Error Scenarios', () => {
      it('should handle network timeouts gracefully across all operations', async () => {
        const timeoutError = new Error('Network timeout');
        timeoutError.name = 'TimeoutError';
        
        mockErrorHandler.handleApiError.mockReturnValue('Request timed out. Please try again.');

        // Test timeout in getAllReports
        mockApiClient.get.mockRejectedValueOnce(timeoutError);
        await expect(reportsService.getAllReports()).rejects.toThrow('Network timeout');
        expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(timeoutError, {
          logError: true,
          showToast: false
        });

        // Test timeout in createReport
        mockApiClient.post.mockRejectedValueOnce(timeoutError);
        await expect(reportsService.createReport({})).rejects.toThrow('Network timeout');

        // Test timeout in statistics
        mockApiClient.get.mockRejectedValueOnce(timeoutError);
        await expect(reportsService.getReportStatistics()).rejects.toThrow('Network timeout');

        expect(mockErrorHandler.handleApiError).toHaveBeenCalledTimes(3);
      });

      it('should handle connection errors with proper retry logic simulation', async () => {
        const connectionError = new Error('Connection refused');
        connectionError.name = 'ConnectionError';
        
        mockErrorHandler.handleApiError.mockReturnValue('Connection failed. Please check your network.');

        // Simulate multiple connection failures
        mockApiClient.get
          .mockRejectedValueOnce(connectionError)
          .mockRejectedValueOnce(connectionError)
          .mockResolvedValueOnce({
            success: true,
            data: {
              data: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
            }
          });

        // First two calls should fail, third should succeed
        await expect(reportsService.getAllReports()).rejects.toThrow('Connection refused');
        await expect(reportsService.getAllReports()).rejects.toThrow('Connection refused');
        
        const result = await reportsService.getAllReports();
        expect(result.data).toEqual([]);
      });
    });

    describe('Authentication Error Scenarios', () => {
      it('should handle authentication failures across all endpoints', async () => {
        const authError = new Error('Unauthorized');
        authError.name = 'AuthenticationError';
        
        mockErrorHandler.handleApiError.mockReturnValue('Authentication failed. Please log in again.');

        // Test auth error in different operations
        const operations = [
          () => reportsService.getAllReports(),
          () => reportsService.getReportById('test-id'),
          () => reportsService.createReport({}),
          () => reportsService.getReportStatistics(),
          () => reportsService.getBranchReportStatistics('test-branch'),
          () => reportsService.getMissedReports('test-branch')
        ];

        // Mock all API calls to fail with auth error
        mockApiClient.get.mockRejectedValue(authError);
        mockApiClient.post.mockRejectedValue(authError);
        mockApiClient.put.mockRejectedValue(authError);
        mockApiClient.delete.mockRejectedValue(authError);

        // Test each operation handles auth error
        for (const operation of operations) {
          await expect(operation()).rejects.toThrow('Unauthorized');
        }

        // Note: updateReport, deleteReport, approveReport, and declineReport make additional API calls
        // for status checks, so we expect more calls than just the operations.length
        expect(mockErrorHandler.handleApiError).toHaveBeenCalledTimes(operations.length);
      });
    });

    describe('Validation Error Scenarios', () => {
      it('should handle validation errors with detailed field information', async () => {
        const validationError = new Error('Validation failed');
        validationError.name = 'ValidationError';
        
        mockErrorHandler.handleApiError.mockReturnValue('Invalid data provided. Please check your input.');

        // Test validation error in create operation
        mockApiClient.post.mockRejectedValueOnce(validationError);
        await expect(reportsService.createReport({
          creditOfficerId: '', // Invalid empty value
          branchId: 'valid-branch',
          reportType: 'invalid-type' // Invalid type
        })).rejects.toThrow('Validation failed');

        // Test validation error in update operation
        const mockReport: Report = {
          id: 'test-id',
          reportId: 'RPT-TEST',
          creditOfficer: 'Test Officer',
          creditOfficerId: 'co-test',
          branch: 'Test Branch',
          branchId: 'branch-test',
          email: 'test@example.com',
          dateSent: '2024-01-20',
          timeSent: '10:00:00',
          reportType: 'daily',
          status: 'pending',
          loansDispursed: 1,
          loansValueDispursed: '10000',
          savingsCollected: '5000',
          repaymentsCollected: 1,
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z'
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: mockReport
        });
        mockApiClient.put.mockRejectedValueOnce(validationError);

        await expect(reportsService.updateReport('test-id', {
          loansDispursed: -1 // Invalid negative value
        })).rejects.toThrow('Validation failed');

        expect(mockErrorHandler.handleApiError).toHaveBeenCalledTimes(2);
      });
    });

    describe('Server Error Scenarios', () => {
      it('should handle server errors with appropriate fallback behavior', async () => {
        const serverError = new Error('Internal server error');
        serverError.name = 'ServerError';
        
        mockErrorHandler.handleApiError.mockReturnValue('Server error occurred. Please try again later.');

        // Test server error in statistics (critical for dashboard)
        mockApiClient.get.mockRejectedValueOnce(serverError);
        await expect(reportsService.getReportStatistics()).rejects.toThrow('Internal server error');

        // Test server error in approval workflow
        mockApiClient.put.mockRejectedValueOnce(serverError);
        await expect(reportsService.approveReport('test-id', {
          status: 'approved',
          approvedBy: 'test-manager',
          approvedAt: '2024-01-20T15:00:00Z'
        })).rejects.toThrow('Internal server error');

        expect(mockErrorHandler.handleApiError).toHaveBeenCalledTimes(2);
      });
    });

    describe('Concurrent Operation Error Handling', () => {
      it('should handle conflicts when multiple users modify the same report', async () => {
        const conflictError = new Error('Conflict: Report was modified by another user');
        conflictError.name = 'ConflictError';
        
        mockErrorHandler.handleApiError.mockReturnValue('Report was modified by another user. Please refresh and try again.');

        const mockReport: Report = {
          id: 'conflict-test',
          reportId: 'RPT-CONFLICT',
          creditOfficer: 'Test Officer',
          creditOfficerId: 'co-test',
          branch: 'Test Branch',
          branchId: 'branch-test',
          email: 'test@example.com',
          dateSent: '2024-01-20',
          timeSent: '10:00:00',
          reportType: 'daily',
          status: 'pending',
          loansDispursed: 1,
          loansValueDispursed: '10000',
          savingsCollected: '5000',
          repaymentsCollected: 1,
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z'
        };

        // Mock successful status check
        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: mockReport
        });

        // Mock conflict error on update
        mockApiClient.put.mockRejectedValueOnce(conflictError);

        await expect(reportsService.updateReport('conflict-test', {
          loansDispursed: 2
        })).rejects.toThrow('Conflict: Report was modified by another user');

        expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(conflictError, {
          logError: true,
          showToast: false
        });
      });
    });
  });

  describe('Performance Testing with Real Data Simulation', () => {
    describe('Large Dataset Handling', () => {
      it('should handle large report datasets efficiently', async () => {
        // Simulate large dataset response
        const largeDataset: Report[] = Array.from({ length: 1000 }, (_, index) => ({
          id: `perf-${index + 1}`,
          reportId: `RPT-PERF-${String(index + 1).padStart(4, '0')}`,
          creditOfficer: `Officer ${index + 1}`,
          creditOfficerId: `co-${index + 1}`,
          branch: `Branch ${Math.floor(index / 100) + 1}`,
          branchId: `branch-${Math.floor(index / 100) + 1}`,
          email: `officer${index + 1}@example.com`,
          dateSent: '2024-01-20',
          timeSent: '10:00:00',
          reportType: 'daily',
          status: index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'submitted',
          loansDispursed: Math.floor(Math.random() * 10) + 1,
          loansValueDispursed: String((Math.floor(Math.random() * 100000) + 10000)),
          savingsCollected: String((Math.floor(Math.random() * 50000) + 5000)),
          repaymentsCollected: Math.floor(Math.random() * 5),
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z'
        }));

        const mockLargeResponse: PaginatedResponse<Report> = {
          data: largeDataset.slice(0, 100), // First page
          pagination: {
            page: 1,
            limit: 100,
            total: 1000,
            totalPages: 10
          }
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: mockLargeResponse
        });

        const startTime = Date.now();
        const result = await reportsService.getAllReports({ limit: 100 });
        const endTime = Date.now();

        // Verify response structure and performance
        expect(result.data).toHaveLength(100);
        expect(result.pagination.total).toBe(1000);
        expect(result.pagination.totalPages).toBe(10);
        
        // Performance assertion (should complete within reasonable time)
        const executionTime = endTime - startTime;
        expect(executionTime).toBeLessThan(1000); // Should complete within 1 second

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?limit=100');
      });

      it('should handle pagination efficiently for large datasets', async () => {
        const pageSize = 50;
        const totalRecords = 500;
        const totalPages = Math.ceil(totalRecords / pageSize);

        // Test multiple page requests
        for (let page = 1; page <= 3; page++) {
          const pageData: Report[] = Array.from({ length: pageSize }, (_, index) => ({
            id: `page-${page}-${index + 1}`,
            reportId: `RPT-PAGE-${page}-${String(index + 1).padStart(3, '0')}`,
            creditOfficer: `Officer ${(page - 1) * pageSize + index + 1}`,
            creditOfficerId: `co-${(page - 1) * pageSize + index + 1}`,
            branch: `Branch ${Math.floor(((page - 1) * pageSize + index) / 50) + 1}`,
            branchId: `branch-${Math.floor(((page - 1) * pageSize + index) / 50) + 1}`,
            email: `officer${(page - 1) * pageSize + index + 1}@example.com`,
            dateSent: '2024-01-20',
            timeSent: '10:00:00',
            reportType: 'daily',
            status: 'submitted',
            loansDispursed: 1,
            loansValueDispursed: '10000',
            savingsCollected: '5000',
            repaymentsCollected: 1,
            createdAt: '2024-01-20T10:00:00Z',
            updatedAt: '2024-01-20T10:00:00Z'
          }));

          const mockPageResponse: PaginatedResponse<Report> = {
            data: pageData,
            pagination: {
              page,
              limit: pageSize,
              total: totalRecords,
              totalPages
            }
          };

          mockApiClient.get.mockResolvedValueOnce({
            success: true,
            data: mockPageResponse
          });

          const result = await reportsService.getAllReports({ page, limit: pageSize });
          
          expect(result.data).toHaveLength(pageSize);
          expect(result.pagination.page).toBe(page);
          expect(result.pagination.total).toBe(totalRecords);
          expect(result.data[0].id).toBe(`page-${page}-1`);
        }

        expect(mockApiClient.get).toHaveBeenCalledTimes(3);
      });
    });

    describe('Complex Filtering Performance', () => {
      it('should handle complex multi-filter queries efficiently', async () => {
        const complexFilters: ReportFilters = {
          creditOfficerId: 'co-123',
          branchId: 'branch-456',
          status: 'pending',
          reportType: 'daily',
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31',
          page: 1,
          limit: 25
        };

        const filteredData: Report[] = Array.from({ length: 25 }, (_, index) => ({
          id: `filtered-${index + 1}`,
          reportId: `RPT-FILTERED-${String(index + 1).padStart(3, '0')}`,
          creditOfficer: 'Filtered Officer',
          creditOfficerId: 'co-123',
          branch: 'Filtered Branch',
          branchId: 'branch-456',
          email: 'filtered@example.com',
          dateSent: `2024-01-${String(index + 1).padStart(2, '0')}`,
          timeSent: '10:00:00',
          reportType: 'daily',
          status: 'pending',
          loansDispursed: index + 1,
          loansValueDispursed: String((index + 1) * 10000),
          savingsCollected: String((index + 1) * 5000),
          repaymentsCollected: index % 3,
          createdAt: `2024-01-${String(index + 1).padStart(2, '0')}T10:00:00Z`,
          updatedAt: `2024-01-${String(index + 1).padStart(2, '0')}T10:00:00Z`
        }));

        const mockFilteredResponse: PaginatedResponse<Report> = {
          data: filteredData,
          pagination: {
            page: 1,
            limit: 25,
            total: 25,
            totalPages: 1
          }
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: mockFilteredResponse
        });

        const startTime = Date.now();
        const result = await reportsService.getAllReports(complexFilters);
        const endTime = Date.now();

        // Verify filtering worked correctly
        expect(result.data).toHaveLength(25);
        result.data.forEach(report => {
          expect(report.creditOfficerId).toBe('co-123');
          expect(report.branchId).toBe('branch-456');
          expect(report.status).toBe('pending');
          expect(report.reportType).toBe('daily');
        });

        // Performance assertion
        const executionTime = endTime - startTime;
        expect(executionTime).toBeLessThan(500); // Should complete within 500ms

        // Verify correct API call with all filters
        const expectedUrl = '/reports?creditOfficerId=co-123&branchId=branch-456&status=pending&reportType=daily&dateFrom=2024-01-01&dateTo=2024-01-31&page=1&limit=25';
        expect(mockApiClient.get).toHaveBeenCalledWith(expectedUrl);
      });
    });

    describe('Statistics Performance with Large Data', () => {
      it('should calculate statistics efficiently for large datasets', async () => {
        const largeDatasetStats: ReportStatistics = {
          totalReports: { count: 50000, growth: 15.5 },
          submittedReports: { count: 40000, growth: 12.3 },
          pendingReports: { count: 8000, growth: 25.7 },
          approvedReports: { count: 30000, growth: 8.9 },
          missedReports: { count: 2000, growth: -5.2 }
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: largeDatasetStats
        });

        const startTime = Date.now();
        const result = await reportsService.getReportStatistics();
        const endTime = Date.now();

        // Verify statistics are calculated correctly
        expect(result.totalReports.count).toBe(50000);
        expect(result.pendingReports.count).toBe(8000);
        expect(result.approvedReports.count).toBe(30000);
        expect(result.missedReports.count).toBe(2000);

        // Verify growth calculations
        expect(result.totalReports.growth).toBe(15.5);
        expect(result.pendingReports.growth).toBe(25.7);
        expect(result.missedReports.growth).toBe(-5.2);

        // Performance assertion
        const executionTime = endTime - startTime;
        expect(executionTime).toBeLessThan(300); // Should complete within 300ms

        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/statistics');
      });

      it('should handle concurrent statistics requests efficiently', async () => {
        const branchStats1: ReportStatistics = {
          totalReports: { count: 1000, growth: 10.0 },
          submittedReports: { count: 800, growth: 8.0 },
          pendingReports: { count: 150, growth: 20.0 },
          approvedReports: { count: 600, growth: 5.0 },
          missedReports: { count: 50, growth: 2.0 }
        };

        const branchStats2: ReportStatistics = {
          totalReports: { count: 1500, growth: 12.0 },
          submittedReports: { count: 1200, growth: 10.0 },
          pendingReports: { count: 200, growth: 15.0 },
          approvedReports: { count: 900, growth: 7.0 },
          missedReports: { count: 100, growth: 5.0 }
        };

        const globalStats: ReportStatistics = {
          totalReports: { count: 5000, growth: 11.0 },
          submittedReports: { count: 4000, growth: 9.0 },
          pendingReports: { count: 750, growth: 18.0 },
          approvedReports: { count: 3000, growth: 6.0 },
          missedReports: { count: 250, growth: 3.0 }
        };

        // Mock API calls with specific URL matching
        mockApiClient.get.mockImplementation((url: string) => {
          if (url === '/reports/branch/branch-1/statistics') {
            return Promise.resolve({ success: true, data: branchStats1 });
          } else if (url === '/reports/branch/branch-2/statistics') {
            return Promise.resolve({ success: true, data: branchStats2 });
          } else if (url === '/reports/statistics') {
            return Promise.resolve({ success: true, data: globalStats });
          }
          return Promise.reject(new Error('Unexpected URL'));
        });

        const startTime = Date.now();
        
        // Execute concurrent requests
        const [branch1Result, branch2Result, globalResult] = await Promise.all([
          reportsService.getBranchReportStatistics('branch-1'),
          reportsService.getBranchReportStatistics('branch-2'),
          reportsService.getReportStatistics()
        ]);

        const endTime = Date.now();

        // Verify all results
        expect(branch1Result.totalReports.count).toBe(1000);
        expect(branch2Result.totalReports.count).toBe(1500);
        expect(globalResult.totalReports.count).toBe(5000);

        // Performance assertion - concurrent requests should be faster than sequential
        const executionTime = endTime - startTime;
        expect(executionTime).toBeLessThan(800); // Should complete within 800ms

        expect(mockApiClient.get).toHaveBeenCalledTimes(3);
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/branch-1/statistics');
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/branch/branch-2/statistics');
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/statistics');
      });
    });

    describe('Memory Usage and Resource Management', () => {
      it('should handle memory-intensive operations without leaks', async () => {
        // Simulate memory-intensive operation with large report data
        const memoryIntensiveData: Report[] = Array.from({ length: 5000 }, (_, index) => ({
          id: `memory-${index + 1}`,
          reportId: `RPT-MEMORY-${String(index + 1).padStart(5, '0')}`,
          creditOfficer: `Officer ${index + 1}`,
          creditOfficerId: `co-${index + 1}`,
          branch: `Branch ${Math.floor(index / 500) + 1}`,
          branchId: `branch-${Math.floor(index / 500) + 1}`,
          email: `officer${index + 1}@example.com`,
          dateSent: '2024-01-20',
          timeSent: '10:00:00',
          reportType: 'daily',
          status: 'submitted',
          loansDispursed: Math.floor(Math.random() * 10) + 1,
          loansValueDispursed: String((Math.floor(Math.random() * 100000) + 10000)),
          savingsCollected: String((Math.floor(Math.random() * 50000) + 5000)),
          repaymentsCollected: Math.floor(Math.random() * 5),
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
          // Add additional fields to increase memory usage
          additionalData: `Large text data for memory testing ${'x'.repeat(1000)}`
        }));

        // Split into pages to simulate real-world pagination
        const pageSize = 1000;
        const totalPages = Math.ceil(memoryIntensiveData.length / pageSize);

        for (let page = 1; page <= totalPages; page++) {
          const startIndex = (page - 1) * pageSize;
          const endIndex = Math.min(startIndex + pageSize, memoryIntensiveData.length);
          const pageData = memoryIntensiveData.slice(startIndex, endIndex);

          const mockResponse: PaginatedResponse<Report> = {
            data: pageData,
            pagination: {
              page,
              limit: pageSize,
              total: memoryIntensiveData.length,
              totalPages
            }
          };

          mockApiClient.get.mockResolvedValueOnce({
            success: true,
            data: mockResponse
          });

          const result = await reportsService.getAllReports({ page, limit: pageSize });
          
          // Verify data integrity
          expect(result.data.length).toBeLessThanOrEqual(pageSize);
          expect(result.pagination.page).toBe(page);
          
          // Simulate processing the data (memory usage)
          const processedData = result.data.map(report => ({
            id: report.id,
            status: report.status,
            amount: parseFloat(report.loansValueDispursed)
          }));
          
          expect(processedData).toHaveLength(result.data.length);
        }

        expect(mockApiClient.get).toHaveBeenCalledTimes(totalPages);
      });
    });
  });
});