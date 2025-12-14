/**
 * Dashboard Service
 * Handles dashboard KPI data fetching and transformation
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import type {
  DashboardParams,
  DashboardKPIs,
  StatisticValue,
  BranchPerformance,
} from '../api/types';

export interface DashboardService {
  getKPIs(params?: DashboardParams): Promise<DashboardKPIs>;
}

class DashboardAPIService implements DashboardService {
  async getKPIs(params?: DashboardParams): Promise<DashboardKPIs> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.timeFilter) {
        queryParams.append('timeFilter', params.timeFilter);
      }
      
      if (params?.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      if (params?.branch) {
        queryParams.append('branch', params.branch);
      }

      const url = `${API_ENDPOINTS.DASHBOARD.KPI}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      if (response.success && response.data) {
        return this.transformDashboardData(response.data);
      }

      throw new Error(response.message || 'Failed to fetch dashboard KPIs');
    } catch (error) {
      console.error('Dashboard KPI fetch error:', error);
      throw error;
    }
  }

  /**
   * Transform backend dashboard data to frontend format
   */
  private transformDashboardData(backendData: any): DashboardKPIs {
    return {
      branches: this.transformStatisticValue(
        backendData.totalBranches || backendData.branches,
        backendData.branchesGrowth || 0,
        'branches'
      ),
      creditOfficers: this.transformStatisticValue(
        backendData.totalCreditOfficers || backendData.creditOfficers,
        backendData.creditOfficersGrowth || 0,
        'credit officers'
      ),
      customers: this.transformStatisticValue(
        backendData.totalCustomers || backendData.customers,
        backendData.customersGrowth || 0,
        'customers'
      ),
      loansProcessed: this.transformStatisticValue(
        backendData.loansProcessed || backendData.totalLoans,
        backendData.loansProcessedGrowth || backendData.loansGrowth || 0,
        'loans processed'
      ),
      loanAmounts: this.transformStatisticValue(
        backendData.totalLoanAmount || backendData.loanAmounts,
        backendData.loanAmountGrowth || backendData.loanAmountsGrowth || 0,
        'loan amount',
        true // isCurrency
      ),
      activeLoans: this.transformStatisticValue(
        backendData.activeLoans,
        backendData.activeLoansGrowth || 0,
        'active loans'
      ),
      missedPayments: this.transformStatisticValue(
        backendData.missedPayments,
        backendData.missedPaymentsGrowth || 0,
        'missed payments'
      ),
      bestPerformingBranches: this.transformBranchPerformance(
        backendData.bestPerformingBranches || backendData.topBranches || []
      ),
      worstPerformingBranches: this.transformBranchPerformance(
        backendData.worstPerformingBranches || backendData.bottomBranches || []
      ),
    };
  }

  /**
   * Transform individual statistic values
   */
  private transformStatisticValue(
    value: number | string,
    change: number,
    label: string,
    isCurrency: boolean = false
  ): StatisticValue {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
    const numericChange = typeof change === 'string' ? parseFloat(change) || 0 : change || 0;
    
    // Generate change label
    let changeLabel = '';
    if (numericChange > 0) {
      changeLabel = `+${numericChange}% this month`;
    } else if (numericChange < 0) {
      changeLabel = `${numericChange}% this month`;
    } else {
      changeLabel = 'No change this month';
    }

    return {
      value: numericValue,
      change: numericChange,
      changeLabel,
      isCurrency,
    };
  }

  /**
   * Transform branch performance data
   */
  private transformBranchPerformance(branches: any[]): BranchPerformance[] {
    if (!Array.isArray(branches)) {
      return [];
    }

    return branches.map(branch => ({
      name: branch.name || branch.branchName || 'Unknown Branch',
      activeLoans: branch.activeLoans || branch.loans || 0,
      amount: branch.amount || branch.totalAmount || branch.loanAmount || 0,
    }));
  }
}

// Export singleton instance
export const dashboardService = new DashboardAPIService();