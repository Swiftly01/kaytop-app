/**
 * Reports Workflow Integration Tests
 * End-to-end workflow integration tests for reports system
 * Tests complete business workflows and cross-system integration
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

// Mock dependencies
jest.mock('../../api/client');
jest.mock('../../api/errorHandler');
jest.mock('../userProfile');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockErrorHandler = UnifiedAPIErrorHandler as jest.Mocked<typeof UnifiedAPIErrorHandler>;
const mockUserProfileService = userProfileService as jest.Mocked<typeof userProfileService>;

describe('Reports Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Default user profile
    mockUserProfileService.getUserProfile.mockResolvedValue({
      id: 'workflow-user',
      role: 'system_admin',
      branch: 'main-branch',
      firstName: 'Workflow',
      lastName: 'User',
      email: 'workflow@example.com',
      mobileNumber: '+1234567890',
      verificationStatus: 'verified',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete Business Workflows', () => {
    describe('Credit Officer Report Submission Workflow', () => {
      it('should handle complete credit officer workflow from creation to approval', async () => {
        // Step 1: Credit officer creates a report
        const reportData = {
          creditOfficerId: 'co-workflow',
          branchId: 'branch-workflow',
          reportType: 'daily',
          loansDispursed: 3,
          loansValueDispursed: '75000',
          savingsCollected: '35000',
          repaymentsCollected: 2
        };

        const createdReport: Report = {
          id: 'workflow-report-1',
          reportId: 'RPT-WF-001',
          creditOfficer: 'Workflow Officer',
          creditOfficerId: 'co-workflow',
          branch: 'Workflow Branch',
          branchId: 'branch-workflow',
          email: 'workflow@example.com',
          dateSent: '2024-01-21',
          timeSent: '09:00:00',
          reportType: 'daily',
          status: 'submitted',
          loansDispursed: 3,
          loansValueDispursed: '75000',
          savingsCollected: '35000',
          repaymentsCollected: 2,
          createdAt: '2024-01-21T09:00:00Z',
          updatedAt: '2024-01-21T09:00:00Z'
        };

        mockApiClient.post.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        const createResult = await reportsService.createReport(reportData);
        expect(createResult.status).toBe('submitted');
        expect(createResult.creditOfficerId).toBe('co-workflow');

        // Step 2: Credit officer realizes they need to update the report
        const updateData = {
          loansDispursed: 4,
          loansValueDispursed: '85000',
          repaymentsCollected: 3
        };

        const updatedReport: Report = {
          ...createdReport,
          loansDispursed: 4,
          loansValueDispursed: '85000',
          repaymentsCollected: 3,
          updatedAt: '2024-01-21T10:00:00Z'
        };

        // Mock status check for update
        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        mockApiClient.put.mockResolvedValueOnce({
          success: true,
          data: updatedReport
        });

        const updateResult = await reportsService.updateReport('workflow-report-1', updateData);
        expect(updateResult.loansDispursed).toBe(4);
        expect(updateResult.loansValueDispursed).toBe('85000');

        // Step 3: Branch manager reviews and approves the report
        const approvalData: ReportApprovalData = {
          status: 'approved',
          comments: 'Report reviewed and approved. Good work!',
          approvedBy: 'bm-workflow',
          approvedAt: '2024-01-21T15:00:00Z'
        };

        const approvedReport: Report = {
          ...updatedReport,
          status: 'approved',
          isApproved: true,
          approvedBy: 'bm-workflow',
          approvedAt: '2024-01-21T15:00:00Z',
          updatedAt: '2024-01-21T15:00:00Z'
        };

        mockApiClient.put.mockResolvedValueOnce({
          success: true,
          data: approvedReport
        });

        const approvalResult = await reportsService.approveReport('workflow-report-1', approvalData);
        expect(approvalResult.status).toBe('approved');
        expect(approvalResult.isApproved).toBe(true);
        expect(approvalResult.approvedBy).toBe('bm-workflow');

        // Step 4: Verify statistics are updated
        const updatedStats: ReportStatistics = {
          totalReports: { count: 1, growth: 100 },
          submittedReports: { count: 1, growth: 100 },
          pendingReports: { count: 0, growth: 0 },
          approvedReports: { count: 1, growth: 100 },
          missedReports: { count: 0, growth: 0 }
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: updatedStats
        });

        const statsResult = await reportsService.getReportStatistics();
        expect(statsResult.approvedReports.count).toBe(1);
        expect(statsResult.totalReports.count).toBe(1);

        // Verify all API calls were made correctly
        expect(mockApiClient.post).toHaveBeenCalledWith('/reports', reportData);
        expect(mockApiClient.put).toHaveBeenCalledWith('/reports/workflow-report-1', updateData);
        expect(mockApiClient.put).toHaveBeenCalledWith('/reports/workflow-report-1/approve', approvalData);
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/statistics');
      });

      it('should handle report decline workflow with feedback loop', async () => {
        // Step 1: Create initial report
        const reportData = {
          creditOfficerId: 'co-decline',
          branchId: 'branch-decline',
          reportType: 'weekly',
          loansDispursed: 1,
          loansValueDispursed: '25000',
          savingsCollected: '10000',
          repaymentsCollected: 0
        };

        const createdReport: Report = {
          id: 'decline-report-1',
          reportId: 'RPT-DECLINE-001',
          creditOfficer: 'Decline Officer',
          creditOfficerId: 'co-decline',
          branch: 'Decline Branch',
          branchId: 'branch-decline',
          email: 'decline@example.com',
          dateSent: '2024-01-22',
          timeSent: '10:00:00',
          reportType: 'weekly',
          status: 'submitted',
          loansDispursed: 1,
          loansValueDispursed: '25000',
          savingsCollected: '10000',
          repaymentsCollected: 0,
          createdAt: '2024-01-22T10:00:00Z',
          updatedAt: '2024-01-22T10:00:00Z'
        };

        mockApiClient.post.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        const createResult = await reportsService.createReport(reportData);
        expect(createResult.status).toBe('submitted');

        // Step 2: Branch manager declines the report
        const declineData: ReportApprovalData = {
          status: 'declined',
          comments: 'Missing loan documentation. Please provide supporting documents for the disbursed loan.',
          approvedBy: 'bm-decline',
          approvedAt: '2024-01-22T14:00:00Z'
        };

        const declinedReport: Report = {
          ...createdReport,
          status: 'declined',
          isApproved: false,
          approvedBy: 'bm-decline',
          approvedAt: '2024-01-22T14:00:00Z',
          declineReason: 'Missing loan documentation. Please provide supporting documents for the disbursed loan.',
          updatedAt: '2024-01-22T14:00:00Z'
        };

        mockApiClient.put.mockResolvedValueOnce({
          success: true,
          data: declinedReport
        });

        const declineResult = await reportsService.declineReport('decline-report-1', declineData);
        expect(declineResult.status).toBe('declined');
        expect(declineResult.isApproved).toBe(false);
        expect(declineResult.declineReason).toContain('Missing loan documentation');

        // Step 3: Credit officer creates a new corrected report
        const correctedReportData = {
          creditOfficerId: 'co-decline',
          branchId: 'branch-decline',
          reportType: 'weekly',
          loansDispursed: 1,
          loansValueDispursed: '25000',
          savingsCollected: '10000',
          repaymentsCollected: 0,
          additionalNotes: 'Loan documentation attached as requested'
        };

        const correctedReport: Report = {
          id: 'decline-report-2',
          reportId: 'RPT-DECLINE-002',
          creditOfficer: 'Decline Officer',
          creditOfficerId: 'co-decline',
          branch: 'Decline Branch',
          branchId: 'branch-decline',
          email: 'decline@example.com',
          dateSent: '2024-01-22',
          timeSent: '16:00:00',
          reportType: 'weekly',
          status: 'submitted',
          loansDispursed: 1,
          loansValueDispursed: '25000',
          savingsCollected: '10000',
          repaymentsCollected: 0,
          createdAt: '2024-01-22T16:00:00Z',
          updatedAt: '2024-01-22T16:00:00Z'
        };

        mockApiClient.post.mockResolvedValueOnce({
          success: true,
          data: correctedReport
        });

        const correctedResult = await reportsService.createReport(correctedReportData);
        expect(correctedResult.status).toBe('submitted');
        expect(correctedResult.id).toBe('decline-report-2');

        // Verify workflow API calls
        expect(mockApiClient.post).toHaveBeenCalledTimes(2);
        expect(mockApiClient.put).toHaveBeenCalledWith('/reports/decline-report-1/decline', declineData);
      });
    });

    describe('Branch Manager Dashboard Workflow', () => {
      it('should handle branch manager dashboard data aggregation workflow', async () => {
        const branchId = 'branch-dashboard';

        // Step 1: Fetch branch-specific reports
        const branchReports: Report[] = [
          {
            id: 'dash-1',
            reportId: 'RPT-DASH-001',
            creditOfficer: 'Officer One',
            creditOfficerId: 'co-1',
            branch: 'Dashboard Branch',
            branchId: branchId,
            email: 'officer1@example.com',
            dateSent: '2024-01-23',
            timeSent: '09:00:00',
            reportType: 'daily',
            status: 'approved',
            isApproved: true,
            loansDispursed: 2,
            loansValueDispursed: '40000',
            savingsCollected: '20000',
            repaymentsCollected: 1,
            createdAt: '2024-01-23T09:00:00Z',
            updatedAt: '2024-01-23T14:00:00Z',
            approvedBy: 'bm-dashboard',
            approvedAt: '2024-01-23T14:00:00Z'
          },
          {
            id: 'dash-2',
            reportId: 'RPT-DASH-002',
            creditOfficer: 'Officer Two',
            creditOfficerId: 'co-2',
            branch: 'Dashboard Branch',
            branchId: branchId,
            email: 'officer2@example.com',
            dateSent: '2024-01-23',
            timeSent: '10:00:00',
            reportType: 'daily',
            status: 'pending',
            loansDispursed: 1,
            loansValueDispursed: '15000',
            savingsCollected: '8000',
            repaymentsCollected: 0,
            createdAt: '2024-01-23T10:00:00Z',
            updatedAt: '2024-01-23T10:00:00Z'
          }
        ];

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: {
            data: branchReports,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
          }
        });

        const reportsResult = await reportsService.getAllReports({ branchId });
        expect(reportsResult.data).toHaveLength(2);
        expect(reportsResult.data.every(r => r.branchId === branchId)).toBe(true);

        // Step 2: Fetch branch statistics
        const branchStats: ReportStatistics = {
          totalReports: { count: 2, growth: 15.0 },
          submittedReports: { count: 2, growth: 15.0 },
          pendingReports: { count: 1, growth: 25.0 },
          approvedReports: { count: 1, growth: 10.0 },
          missedReports: { count: 0, growth: 0.0 }
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: branchStats
        });

        const statsResult = await reportsService.getBranchReportStatistics(branchId);
        expect(statsResult.totalReports.count).toBe(2);
        expect(statsResult.pendingReports.count).toBe(1);
        expect(statsResult.approvedReports.count).toBe(1);

        // Step 3: Fetch missed reports for the branch
        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: {
            data: [], // No missed reports
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        });

        const missedReports = await reportsService.getMissedReports(branchId);
        expect(missedReports).toHaveLength(0);

        // Verify dashboard workflow API calls
        expect(mockApiClient.get).toHaveBeenCalledWith(`/reports?branchId=${branchId}`);
        expect(mockApiClient.get).toHaveBeenCalledWith(`/reports/branch/${branchId}/statistics`);
        expect(mockApiClient.get).toHaveBeenCalledWith(`/reports?status=missed&branchId=${branchId}`);
      });
    });

    describe('System Admin Oversight Workflow', () => {
      it('should handle system admin comprehensive oversight workflow', async () => {
        // Step 1: Get global statistics
        const globalStats: ReportStatistics = {
          totalReports: { count: 150, growth: 12.5 },
          submittedReports: { count: 120, growth: 10.0 },
          pendingReports: { count: 25, growth: 20.0 },
          approvedReports: { count: 90, growth: 8.0 },
          missedReports: { count: 5, growth: -10.0 }
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: globalStats
        });

        const globalStatsResult = await reportsService.getReportStatistics();
        expect(globalStatsResult.totalReports.count).toBe(150);
        expect(globalStatsResult.pendingReports.count).toBe(25);

        // Step 2: Get reports across all branches with filtering
        const allReports: Report[] = Array.from({ length: 10 }, (_, index) => ({
          id: `admin-${index + 1}`,
          reportId: `RPT-ADMIN-${String(index + 1).padStart(3, '0')}`,
          creditOfficer: `Officer ${index + 1}`,
          creditOfficerId: `co-${index + 1}`,
          branch: `Branch ${Math.floor(index / 3) + 1}`,
          branchId: `branch-${Math.floor(index / 3) + 1}`,
          email: `officer${index + 1}@example.com`,
          dateSent: '2024-01-24',
          timeSent: '09:00:00',
          reportType: 'daily',
          status: index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'submitted',
          loansDispursed: Math.floor(Math.random() * 5) + 1,
          loansValueDispursed: String((Math.floor(Math.random() * 50000) + 10000)),
          savingsCollected: String((Math.floor(Math.random() * 25000) + 5000)),
          repaymentsCollected: Math.floor(Math.random() * 3),
          createdAt: '2024-01-24T09:00:00Z',
          updatedAt: '2024-01-24T09:00:00Z'
        }));

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: {
            data: allReports,
            pagination: { page: 1, limit: 10, total: 150, totalPages: 15 }
          }
        });

        const allReportsResult = await reportsService.getAllReports({ limit: 10 });
        expect(allReportsResult.data).toHaveLength(10);
        expect(allReportsResult.pagination.total).toBe(150);

        // Step 3: Get statistics for specific time period
        const timeFilteredStats: ReportStatistics = {
          totalReports: { count: 45, growth: 18.0 },
          submittedReports: { count: 35, growth: 15.0 },
          pendingReports: { count: 8, growth: 30.0 },
          approvedReports: { count: 25, growth: 12.0 },
          missedReports: { count: 2, growth: -5.0 }
        };

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: timeFilteredStats
        });

        const timeStatsResult = await reportsService.getReportStatistics({
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31'
        });
        expect(timeStatsResult.totalReports.count).toBe(45);

        // Step 4: Get missed reports across all branches
        const missedReports: Report[] = [
          {
            id: 'missed-admin-1',
            reportId: 'RPT-MISSED-ADMIN-001',
            creditOfficer: 'Late Officer',
            creditOfficerId: 'co-late',
            branch: 'Late Branch',
            branchId: 'branch-late',
            email: 'late@example.com',
            dateSent: '2024-01-20',
            timeSent: '10:00:00',
            reportType: 'daily',
            status: 'missed',
            loansDispursed: 0,
            loansValueDispursed: '0',
            savingsCollected: '0',
            repaymentsCollected: 0,
            createdAt: '2024-01-20T10:00:00Z',
            updatedAt: '2024-01-20T10:00:00Z'
          }
        ];

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: {
            data: missedReports,
            pagination: { page: 1, limit: 10, total: 5, totalPages: 1 }
          }
        });

        const missedReportsResult = await reportsService.getMissedReports();
        expect(missedReportsResult).toHaveLength(1);
        expect(missedReportsResult[0].status).toBe('missed');

        // Verify admin oversight workflow API calls
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/statistics');
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?limit=10');
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports/statistics?dateFrom=2024-01-01&dateTo=2024-01-31');
        expect(mockApiClient.get).toHaveBeenCalledWith('/reports?status=missed');
      });
    });
  });

  describe('Error Recovery Workflows', () => {
    describe('Network Failure Recovery', () => {
      it('should handle network failures during critical workflow steps', async () => {
        const reportData = {
          creditOfficerId: 'co-network',
          branchId: 'branch-network',
          reportType: 'daily',
          loansDispursed: 2,
          loansValueDispursed: '30000',
          savingsCollected: '15000',
          repaymentsCollected: 1
        };

        // Step 1: Successful report creation
        const createdReport: Report = {
          id: 'network-report-1',
          reportId: 'RPT-NETWORK-001',
          creditOfficer: 'Network Officer',
          creditOfficerId: 'co-network',
          branch: 'Network Branch',
          branchId: 'branch-network',
          email: 'network@example.com',
          dateSent: '2024-01-25',
          timeSent: '09:00:00',
          reportType: 'daily',
          status: 'submitted',
          loansDispursed: 2,
          loansValueDispursed: '30000',
          savingsCollected: '15000',
          repaymentsCollected: 1,
          createdAt: '2024-01-25T09:00:00Z',
          updatedAt: '2024-01-25T09:00:00Z'
        };

        mockApiClient.post.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        const createResult = await reportsService.createReport(reportData);
        expect(createResult.status).toBe('submitted');

        // Step 2: Network failure during approval attempt
        const networkError = new Error('Network timeout');
        networkError.name = 'NetworkError';
        
        mockErrorHandler.handleApiError.mockReturnValue('Network connection failed. Please try again.');

        mockApiClient.put.mockRejectedValueOnce(networkError);

        const approvalData: ReportApprovalData = {
          status: 'approved',
          approvedBy: 'bm-network',
          approvedAt: '2024-01-25T14:00:00Z'
        };

        await expect(reportsService.approveReport('network-report-1', approvalData))
          .rejects.toThrow('Network timeout');

        expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(networkError, {
          logError: true,
          showToast: false
        });

        // Step 3: Successful retry after network recovery
        const approvedReport: Report = {
          ...createdReport,
          status: 'approved',
          isApproved: true,
          approvedBy: 'bm-network',
          approvedAt: '2024-01-25T14:00:00Z',
          updatedAt: '2024-01-25T14:00:00Z'
        };

        mockApiClient.put.mockResolvedValueOnce({
          success: true,
          data: approvedReport
        });

        const retryResult = await reportsService.approveReport('network-report-1', approvalData);
        expect(retryResult.status).toBe('approved');
        expect(retryResult.isApproved).toBe(true);

        // Verify error handling and recovery
        expect(mockApiClient.put).toHaveBeenCalledTimes(2);
        expect(mockErrorHandler.handleApiError).toHaveBeenCalledTimes(1);
      });
    });

    describe('Authorization Error Recovery', () => {
      it('should handle authorization errors in multi-step workflows', async () => {
        // Step 1: Successful report creation
        const reportData = {
          creditOfficerId: 'co-auth',
          branchId: 'branch-auth',
          reportType: 'weekly',
          loansDispursed: 1,
          loansValueDispursed: '20000',
          savingsCollected: '10000',
          repaymentsCollected: 0
        };

        const createdReport: Report = {
          id: 'auth-report-1',
          reportId: 'RPT-AUTH-001',
          creditOfficer: 'Auth Officer',
          creditOfficerId: 'co-auth',
          branch: 'Auth Branch',
          branchId: 'branch-auth',
          email: 'auth@example.com',
          dateSent: '2024-01-26',
          timeSent: '10:00:00',
          reportType: 'weekly',
          status: 'submitted',
          loansDispursed: 1,
          loansValueDispursed: '20000',
          savingsCollected: '10000',
          repaymentsCollected: 0,
          createdAt: '2024-01-26T10:00:00Z',
          updatedAt: '2024-01-26T10:00:00Z'
        };

        mockApiClient.post.mockResolvedValueOnce({
          success: true,
          data: createdReport
        });

        const createResult = await reportsService.createReport(reportData);
        expect(createResult.status).toBe('submitted');

        // Step 2: Authorization error during approval (e.g., session expired)
        const authError = new Error('Unauthorized: Session expired');
        authError.name = 'AuthorizationError';
        
        mockErrorHandler.handleApiError.mockReturnValue('Session expired. Please log in again.');

        mockApiClient.put.mockRejectedValueOnce(authError);

        const approvalData: ReportApprovalData = {
          status: 'approved',
          approvedBy: 'bm-auth',
          approvedAt: '2024-01-26T15:00:00Z'
        };

        await expect(reportsService.approveReport('auth-report-1', approvalData))
          .rejects.toThrow('Unauthorized: Session expired');

        expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(authError, {
          logError: true,
          showToast: false
        });

        // Step 3: Successful operation after re-authentication
        const approvedReport: Report = {
          ...createdReport,
          status: 'approved',
          isApproved: true,
          approvedBy: 'bm-auth',
          approvedAt: '2024-01-26T15:00:00Z',
          updatedAt: '2024-01-26T15:00:00Z'
        };

        mockApiClient.put.mockResolvedValueOnce({
          success: true,
          data: approvedReport
        });

        const retryResult = await reportsService.approveReport('auth-report-1', approvalData);
        expect(retryResult.status).toBe('approved');

        // Verify error handling workflow
        expect(mockApiClient.put).toHaveBeenCalledTimes(2);
        expect(mockErrorHandler.handleApiError).toHaveBeenCalledTimes(1);
      });
    });

    describe('Data Consistency Recovery', () => {
      it('should handle data consistency issues during concurrent operations', async () => {
        const reportId = 'consistency-report-1';

        // Step 1: Two users try to update the same report simultaneously
        const user1UpdateData = { loansDispursed: 3 };
        const user2UpdateData = { savingsCollected: '25000' };

        const originalReport: Report = {
          id: reportId,
          reportId: 'RPT-CONSISTENCY-001',
          creditOfficer: 'Consistency Officer',
          creditOfficerId: 'co-consistency',
          branch: 'Consistency Branch',
          branchId: 'branch-consistency',
          email: 'consistency@example.com',
          dateSent: '2024-01-27',
          timeSent: '11:00:00',
          reportType: 'daily',
          status: 'pending',
          loansDispursed: 2,
          loansValueDispursed: '40000',
          savingsCollected: '20000',
          repaymentsCollected: 1,
          createdAt: '2024-01-27T11:00:00Z',
          updatedAt: '2024-01-27T11:00:00Z'
        };

        // Mock successful first update
        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: originalReport
        });

        const user1UpdatedReport: Report = {
          ...originalReport,
          loansDispursed: 3,
          updatedAt: '2024-01-27T12:00:00Z'
        };

        mockApiClient.put.mockResolvedValueOnce({
          success: true,
          data: user1UpdatedReport
        });

        const user1Result = await reportsService.updateReport(reportId, user1UpdateData);
        expect(user1Result.loansDispursed).toBe(3);

        // Mock conflict error for second update (report was modified)
        const conflictError = new Error('Conflict: Report was modified by another user');
        conflictError.name = 'ConflictError';
        
        mockErrorHandler.handleApiError.mockReturnValue('Report was modified by another user. Please refresh and try again.');

        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: originalReport // Still returns old version for status check
        });

        mockApiClient.put.mockRejectedValueOnce(conflictError);

        await expect(reportsService.updateReport(reportId, user2UpdateData))
          .rejects.toThrow('Conflict: Report was modified by another user');

        // Step 2: Successful retry with fresh data
        mockApiClient.get.mockResolvedValueOnce({
          success: true,
          data: user1UpdatedReport // Now returns updated version
        });

        const finalUpdatedReport: Report = {
          ...user1UpdatedReport,
          savingsCollected: '25000',
          updatedAt: '2024-01-27T12:30:00Z'
        };

        mockApiClient.put.mockResolvedValueOnce({
          success: true,
          data: finalUpdatedReport
        });

        const user2RetryResult = await reportsService.updateReport(reportId, user2UpdateData);
        expect(user2RetryResult.savingsCollected).toBe('25000');
        expect(user2RetryResult.loansDispursed).toBe(3); // Preserves user1's changes

        // Verify conflict resolution workflow
        expect(mockApiClient.get).toHaveBeenCalledTimes(3);
        expect(mockApiClient.put).toHaveBeenCalledTimes(3);
        expect(mockErrorHandler.handleApiError).toHaveBeenCalledWith(conflictError, {
          logError: true,
          showToast: false
        });
      });
    });
  });

  describe('Performance Integration Workflows', () => {
    describe('High-Volume Operations', () => {
      it('should handle high-volume report processing efficiently', async () => {
        const batchSize = 50;
        const totalReports = 500;

        // Simulate processing multiple pages of reports
        for (let page = 1; page <= 10; page++) {
          const pageReports: Report[] = Array.from({ length: batchSize }, (_, index) => {
            const globalIndex = (page - 1) * batchSize + index;
            return {
              id: `batch-${globalIndex + 1}`,
              reportId: `RPT-BATCH-${String(globalIndex + 1).padStart(4, '0')}`,
              creditOfficer: `Officer ${globalIndex + 1}`,
              creditOfficerId: `co-${globalIndex + 1}`,
              branch: `Branch ${Math.floor(globalIndex / 50) + 1}`,
              branchId: `branch-${Math.floor(globalIndex / 50) + 1}`,
              email: `officer${globalIndex + 1}@example.com`,
              dateSent: '2024-01-28',
              timeSent: '09:00:00',
              reportType: 'daily',
              status: 'submitted',
              loansDispursed: Math.floor(Math.random() * 5) + 1,
              loansValueDispursed: String((Math.floor(Math.random() * 50000) + 10000)),
              savingsCollected: String((Math.floor(Math.random() * 25000) + 5000)),
              repaymentsCollected: Math.floor(Math.random() * 3),
              createdAt: '2024-01-28T09:00:00Z',
              updatedAt: '2024-01-28T09:00:00Z'
            };
          });

          mockApiClient.get.mockResolvedValueOnce({
            success: true,
            data: {
              data: pageReports,
              pagination: {
                page,
                limit: batchSize,
                total: totalReports,
                totalPages: 10
              }
            }
          });

          const startTime = Date.now();
          const result = await reportsService.getAllReports({ page, limit: batchSize });
          const endTime = Date.now();

          // Performance assertions
          expect(result.data).toHaveLength(batchSize);
          expect(result.pagination.page).toBe(page);
          expect(endTime - startTime).toBeLessThan(100); // Should complete quickly

          // Verify data integrity
          result.data.forEach((report, index) => {
            const expectedId = `batch-${(page - 1) * batchSize + index + 1}`;
            expect(report.id).toBe(expectedId);
          });
        }

        // Verify all pages were processed
        expect(mockApiClient.get).toHaveBeenCalledTimes(10);
      });

      it('should handle concurrent statistics requests efficiently', async () => {
        const branches = ['branch-1', 'branch-2', 'branch-3', 'branch-4', 'branch-5'];
        
        // Mock statistics for each branch
        branches.forEach((branchId, index) => {
          const branchStats: ReportStatistics = {
            totalReports: { count: (index + 1) * 20, growth: (index + 1) * 5.0 },
            submittedReports: { count: (index + 1) * 16, growth: (index + 1) * 4.0 },
            pendingReports: { count: (index + 1) * 3, growth: (index + 1) * 8.0 },
            approvedReports: { count: (index + 1) * 12, growth: (index + 1) * 3.0 },
            missedReports: { count: index, growth: index * 2.0 }
          };

          mockApiClient.get.mockResolvedValueOnce({
            success: true,
            data: branchStats
          });
        });

        const startTime = Date.now();

        // Execute concurrent statistics requests
        const statisticsPromises = branches.map(branchId =>
          reportsService.getBranchReportStatistics(branchId)
        );

        const results = await Promise.all(statisticsPromises);
        const endTime = Date.now();

        // Verify results
        expect(results).toHaveLength(5);
        results.forEach((stats, index) => {
          expect(stats.totalReports.count).toBe((index + 1) * 20);
          expect(stats.pendingReports.count).toBe((index + 1) * 3);
        });

        // Performance assertion - concurrent requests should be efficient
        const executionTime = endTime - startTime;
        expect(executionTime).toBeLessThan(500); // Should complete within 500ms

        expect(mockApiClient.get).toHaveBeenCalledTimes(5);
      });
    });
  });
});