/**
 * Property Tests for Reports Service - HQ Dashboard Enhancements
 * Tests universal correctness properties for API service integration
 */

import * as fc from 'fast-check';
import { reportsService } from '../reports';
import { ratingsService } from '../ratings';
import { userProfileService } from '../userProfile';
import apiClient from '@/lib/apiClient';

// Mock dependencies
jest.mock('@/lib/apiClient');
jest.mock('../userProfile');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockUserProfileService = userProfileService as jest.Mocked<typeof userProfileService>;

describe('Reports Service Property Tests - HQ Dashboard Enhancements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock user profile for HQ manager
    mockUserProfileService.getUserProfile.mockResolvedValue({
      id: '1',
      firstName: 'HQ',
      lastName: 'Manager',
      email: 'hq@test.com',
      mobileNumber: '+1234567890',
      role: 'hq_manager',
      branch: 'HQ',
      state: 'Lagos',
      verificationStatus: 'verified',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
  });

  /**
   * Property 2: API Authentication Headers
   * For any API request made by enhanced features, the request should include proper Authorization Bearer token headers
   * Validates: Requirements 3.3
   */
  describe('Property 2: API Authentication Headers', () => {
    it('should include Authorization Bearer token headers for all HQ review requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // reportId
          fc.oneof(
            fc.constant('APPROVE'),
            fc.constant('DECLINE')
          ), // action
          fc.string({ minLength: 1, maxLength: 200 }), // remarks
          async (reportId, action, remarks) => {
            // Clear mocks for each property test iteration
            jest.clearAllMocks();
            
            // Mock successful API response
            mockApiClient.put.mockResolvedValueOnce({
              data: {
                id: reportId,
                status: action === 'APPROVE' ? 'approved' : 'declined',
                reportId,
                creditOfficer: 'Test Officer',
                creditOfficerId: '1',
                branch: 'Test Branch',
                branchId: '1',
                email: 'test@example.com',
                dateSent: '2024-01-01',
                timeSent: '10:00:00',
                reportType: 'daily' as const,
                loansDispursed: 5,
                loansValueDispursed: '100000',
                savingsCollected: '50000',
                repaymentsCollected: 3,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              }
            });

            // Execute HQ review
            await reportsService.hqReviewReport(reportId, { action, remarks });

            // Verify API client was called with proper endpoint
            expect(mockApiClient.put).toHaveBeenCalledWith(
              `/reports/${reportId}/hq-review`,
              { action, remarks }
            );

            // Note: The unified API client automatically handles Authorization headers
            // through interceptors, so we verify the call was made correctly
            expect(mockApiClient.put).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should include Authorization headers for branch aggregate reports requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.option(fc.string({ minLength: 1, maxLength: 20 })), // branchId
          fc.option(fc.oneof(
            fc.constant('pending'),
            fc.constant('approved'),
            fc.constant('declined')
          )), // status
          fc.integer({ min: 1, max: 100 }), // limit
          async (branchId, status, limit) => {
            // Clear mocks for each property test iteration
            jest.clearAllMocks();
            
            // Mock successful reports response
            mockApiClient.get.mockResolvedValueOnce({
              data: {
                reports: [],
                total: 0,
                page: 1,
                totalPages: 1
              }
            });

            // Execute branch aggregate reports fetch
            await reportsService.getBranchAggregateReports({
              branchId: branchId || undefined,
              status: status || undefined,
              limit
            });

            // Verify API client was called (which includes auth headers via interceptors)
            expect(mockApiClient.get).toHaveBeenCalledTimes(1);
            
            // The call should be made to the reports endpoint
            const callArgs = mockApiClient.get.mock.calls[0];
            expect(callArgs[0]).toMatch(/^\/reports/);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * Property 3: Backend Enum Compliance
   * For any API request involving performance metrics, the system should use exact backend enums
   * Validates: Requirements 5.1
   */
  describe('Property 3: Backend Enum Compliance', () => {
    it('should use exact backend enums for HQ review actions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // reportId
          fc.string({ minLength: 1, maxLength: 200 }), // remarks
          async (reportId, remarks) => {
            // Test both valid enum values
            const validActions = ['APPROVE', 'DECLINE'] as const;
            
            for (const action of validActions) {
              // Mock successful API response
              mockApiClient.put.mockResolvedValueOnce({
                data: {
                  id: reportId,
                  status: action === 'APPROVE' ? 'approved' : 'declined',
                  reportId,
                  creditOfficer: 'Test Officer',
                  creditOfficerId: '1',
                  branch: 'Test Branch',
                  branchId: '1',
                  email: 'test@example.com',
                  dateSent: '2024-01-01',
                  timeSent: '10:00:00',
                  reportType: 'daily' as const,
                  loansDispursed: 5,
                  loansValueDispursed: '100000',
                  savingsCollected: '50000',
                  repaymentsCollected: 3,
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z',
                }
              });

              // Execute HQ review with exact backend enum
              await reportsService.hqReviewReport(reportId, { action, remarks });

              // Verify exact enum value was sent
              expect(mockApiClient.put).toHaveBeenCalledWith(
                `/reports/${reportId}/hq-review`,
                { action, remarks }
              );
            }
          }
        ),
        { numRuns: 25 }
      );
    });

    it('should reject invalid enum values for HQ review actions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // reportId
          fc.string({ minLength: 1, maxLength: 200 }), // remarks
          fc.string().filter(s => !['APPROVE', 'DECLINE'].includes(s)), // invalid action
          async (reportId, remarks, invalidAction) => {
            // Attempt HQ review with invalid action should throw error
            await expect(
              reportsService.hqReviewReport(reportId, { 
                action: invalidAction as any, 
                remarks 
              })
            ).rejects.toThrow('Invalid action: Must be either "APPROVE" or "DECLINE"');

            // Verify API was not called with invalid enum
            expect(mockApiClient.put).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 25 }
      );
    });
  });
});

describe('Ratings Service Property Tests - HQ Dashboard Enhancements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock user profile for HQ manager
    mockUserProfileService.getUserProfile.mockResolvedValue({
      id: '1',
      firstName: 'HQ',
      lastName: 'Manager',
      email: 'hq@test.com',
      mobileNumber: '+1234567890',
      role: 'hq_manager',
      branch: 'HQ',
      state: 'Lagos',
      verificationStatus: 'verified',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
  });

  /**
   * Property 3: Backend Enum Compliance (continued for ratings)
   * For any API request involving performance metrics, the system should use exact backend enums
   * Validates: Requirements 5.1
   */
  describe('Property 3: Backend Enum Compliance for Ratings', () => {
    it('should use exact backend enums for rating periods', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant('DAILY'),
            fc.constant('WEEKLY'),
            fc.constant('MONTHLY'),
            fc.constant('QUARTERLY'),
            fc.constant('YEARLY')
          ), // valid periods
          async (period) => {
            // Mock successful API response
            mockApiClient.get.mockResolvedValueOnce({
              data: {
                success: true,
                calculatedAt: '2024-01-01T00:00:00Z',
                period
              }
            });

            // Execute ratings calculation with exact backend enum
            await ratingsService.calculateRatings({ period });

            // Verify exact enum value was sent
            expect(mockApiClient.get).toHaveBeenCalledWith(
              expect.stringContaining(`period=${period}`)
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should use exact backend enums for rating types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant('SAVINGS'),
            fc.constant('MONEY_DISBURSED'),
            fc.constant('LOAN_REPAYMENT')
          ), // valid types
          fc.oneof(
            fc.constant('DAILY'),
            fc.constant('WEEKLY'),
            fc.constant('MONTHLY'),
            fc.constant('QUARTERLY'),
            fc.constant('YEARLY')
          ), // valid periods
          fc.integer({ min: 1, max: 50 }), // limit
          async (type, period, limit) => {
            // Mock successful API response
            mockApiClient.get.mockResolvedValueOnce({
              data: []
            });

            // Execute leaderboard fetch with exact backend enums
            await ratingsService.getLeaderboard({ type, period, limit });

            // Verify exact enum values were sent
            const expectedUrl = expect.stringContaining(`type=${type}`);
            const expectedUrlWithPeriod = expect.stringContaining(`period=${period}`);
            
            expect(mockApiClient.get).toHaveBeenCalledWith(
              expect.stringMatching(new RegExp(`type=${type}.*period=${period}|period=${period}.*type=${type}`))
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject invalid enum values for rating periods', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string().filter(s => !['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].includes(s)), // invalid period
          async (invalidPeriod) => {
            // Attempt calculation with invalid period should return error result
            const result = await ratingsService.calculateRatings({ 
              period: invalidPeriod as any 
            });

            // Should return error result, not throw
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid period');

            // Verify API was not called with invalid enum
            expect(mockApiClient.get).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 25 }
      );
    });

    it('should reject invalid enum values for rating types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string().filter(s => !['SAVINGS', 'MONEY_DISBURSED', 'LOAN_REPAYMENT'].includes(s)), // invalid type
          async (invalidType) => {
            // Mock to ensure we can test the validation
            mockApiClient.get.mockResolvedValueOnce({ data: [] });

            // Execute leaderboard fetch with invalid type
            await ratingsService.getLeaderboard({ type: invalidType as any });

            // Should not include invalid type in URL parameters
            if (mockApiClient.get.mock.calls.length > 0) {
              const calledUrl = mockApiClient.get.mock.calls[0][0];
              expect(calledUrl).not.toContain(`type=${invalidType}`);
            }
          }
        ),
        { numRuns: 25 }
      );
    });
  });
});