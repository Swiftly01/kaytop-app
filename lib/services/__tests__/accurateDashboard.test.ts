/**
 * Accurate Dashboard Service Tests
 * Tests for accurate dashboard data calculation
 */

import { accurateDashboardService } from '../accurateDashboard';

// Mock the API client
jest.mock('../../api/client', () => ({
  unifiedApiClient: {
    get: jest.fn(),
  },
}));

describe('AccurateDashboardService', () => {
  const mockUnifiedApiClient = require('../../api/client').unifiedApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccurateKPIs', () => {
    it('should calculate accurate statistics from real data', async () => {
      // Mock API responses
      mockUnifiedApiClient.get
        .mockResolvedValueOnce({ data: {} }) // KPI data
        .mockResolvedValueOnce({ // Users data
          data: {
            data: [
              { id: 1, role: 'credit_officer', branch: 'Lagos Central' },
              { id: 2, role: 'customer', branch: 'Lagos Central' },
              { id: 3, role: 'customer', branch: 'Abuja Main' },
              { id: 4, role: 'credit_officer', branch: 'Abuja Main' },
            ]
          }
        })
        .mockResolvedValueOnce({ data: ['Lagos Central', 'Abuja Main', 'Port Harcourt'] }) // Branches
        .mockResolvedValueOnce({ // Loans data
          data: {
            data: [
              { id: 1, amount: '100000', status: 'active' },
              { id: 2, amount: '200000', status: 'completed' },
              { id: 3, amount: '150000', status: 'defaulted' },
            ]
          }
        });

      const result = await accurateDashboardService.getAccurateKPIs();

      expect(result.branches.value).toBe(3); // 3 branches
      expect(result.creditOfficers.value).toBe(2); // 2 credit officers
      expect(result.customers.value).toBe(2); // 2 customers
      expect(result.loansProcessed.value).toBe(3); // 3 total loans
      expect(result.activeLoans.value).toBe(1); // 1 active loan
      expect(result.missedPayments.value).toBe(1); // 1 defaulted loan
      expect(result.loanAmounts.value).toBe(450000); // Total loan amount
      expect(result.loanAmounts.isCurrency).toBe(true);
    });

    it('should handle empty data gracefully', async () => {
      // Mock empty responses
      mockUnifiedApiClient.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: { data: [] } });

      const result = await accurateDashboardService.getAccurateKPIs();

      expect(result.branches.value).toBe(0);
      expect(result.creditOfficers.value).toBe(0);
      expect(result.customers.value).toBe(0);
      expect(result.loansProcessed.value).toBe(0);
      expect(result.activeLoans.value).toBe(0);
      expect(result.missedPayments.value).toBe(0);
      expect(result.loanAmounts.value).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      // Mock API errors
      mockUnifiedApiClient.get.mockRejectedValue(new Error('API Error'));

      // The service handles errors gracefully and returns default values instead of throwing
      const result = await accurateDashboardService.getAccurateKPIs();
      
      expect(result.branches.value).toBe(0);
      expect(result.creditOfficers.value).toBe(0);
      expect(result.customers.value).toBe(0);
      expect(result.loansProcessed.value).toBe(0);
      expect(result.activeLoans.value).toBe(0);
      expect(result.missedPayments.value).toBe(0);
      expect(result.loanAmounts.value).toBe(0);
    });
  });

  describe('createStatisticValue', () => {
    it('should create correct statistic value with positive change', () => {
      const result = (accurateDashboardService as any).createStatisticValue(100, 5.5, false);

      expect(result).toEqual({
        value: 100,
        change: 5.5,
        changeLabel: '+5.50% this month',
        isCurrency: false,
      });
    });

    it('should create correct statistic value with negative change', () => {
      const result = (accurateDashboardService as any).createStatisticValue(50, -2.3, true);

      expect(result).toEqual({
        value: 50,
        change: -2.3,
        changeLabel: '-2.30% this month',
        isCurrency: true,
      });
    });

    it('should create correct statistic value with zero change', () => {
      const result = (accurateDashboardService as any).createStatisticValue(75, 0, false);

      expect(result).toEqual({
        value: 75,
        change: 0,
        changeLabel: '+0% this month',
        isCurrency: false,
      });
    });
  });
});