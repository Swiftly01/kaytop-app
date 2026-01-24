/**
 * Branch Performance Service Tests
 * Tests for branch performance calculation logic
 */

import { branchPerformanceService } from '../branchPerformance';

// Mock the API clients
jest.mock('../../api/client', () => ({
  unifiedApiClient: {
    get: jest.fn(),
  },
}));

describe('BranchPerformanceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculatePerformanceScore', () => {
    it('should calculate performance score correctly', () => {
      const metrics = {
        totalAmountDisbursed: 5000000, // 5M
        activeLoans: 100,
        repaymentRate: 85,
        defaultedLoans: 5,
        totalLoansProcessed: 120,
        creditOfficersCount: 3
      };

      // Access private method for testing
      const score = (branchPerformanceService as any).calculatePerformanceScore(metrics);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(typeof score).toBe('number');
    });

    it('should handle zero values gracefully', () => {
      const metrics = {
        totalAmountDisbursed: 0,
        activeLoans: 0,
        repaymentRate: 0,
        defaultedLoans: 0,
        totalLoansProcessed: 0,
        creditOfficersCount: 0
      };

      const score = (branchPerformanceService as any).calculatePerformanceScore(metrics);

      // When all values are zero, the calculation may result in NaN due to division by zero
      // The service should handle this gracefully
      expect(score).toBeGreaterThanOrEqual(0);
      expect(typeof score).toBe('number');
      expect(isNaN(score)).toBe(false);
    });

    it('should penalize high default rates', () => {
      const goodMetrics = {
        totalAmountDisbursed: 5000000,
        activeLoans: 100,
        repaymentRate: 85,
        defaultedLoans: 2,
        totalLoansProcessed: 120,
        creditOfficersCount: 3
      };

      const badMetrics = {
        ...goodMetrics,
        defaultedLoans: 20 // Much higher default rate
      };

      const goodScore = (branchPerformanceService as any).calculatePerformanceScore(goodMetrics);
      const badScore = (branchPerformanceService as any).calculatePerformanceScore(badMetrics);

      expect(goodScore).toBeGreaterThan(badScore);
    });
  });

  describe('convertToBranchPerformance', () => {
    it('should convert metrics to BranchPerformance format', () => {
      const metrics = {
        branchName: 'Lagos Central',
        totalLoansProcessed: 120,
        totalAmountDisbursed: 5000000,
        activeLoans: 100,
        completedLoans: 15,
        defaultedLoans: 5,
        totalCustomers: 200,
        totalCreditOfficers: 3,
        repaymentRate: 85,
        disbursementVolume: 5000000,
        performanceScore: 75.5
      };

      const result = (branchPerformanceService as any).convertToBranchPerformance(metrics);

      expect(result).toEqual({
        name: 'Lagos Central',
        activeLoans: 100,
        amount: 5000000
      });
    });
  });

  describe('filterLoansByBranch', () => {
    it('should filter loans by branch correctly', () => {
      const loans = [
        { id: '1', customerId: '101', amount: 100000, term: 12, interestRate: 5, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', customerId: '102', amount: 200000, term: 24, interestRate: 6, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '3', customerId: '103', amount: 150000, term: 18, interestRate: 5.5, status: 'completed', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];

      const users = [
        { id: '101', branch: 'Lagos Central', role: 'customer' },
        { id: '102', branch: 'Abuja Main', role: 'customer' },
        { id: '103', branch: 'Lagos Central', role: 'customer' },
      ];

      const result = (branchPerformanceService as any).filterLoansByBranch(loans, 'Lagos Central', users);

      expect(result).toHaveLength(2);
      expect(result[0].customerId).toBe('101');
      expect(result[1].customerId).toBe('103');
    });

    it('should handle empty arrays gracefully', () => {
      const result = (branchPerformanceService as any).filterLoansByBranch([], 'Lagos Central', []);
      expect(result).toEqual([]);
    });
  });
});