/**
 * Dashboard Service
 * Handles dashboard KPI data fetching and transformation
 * Updated to include report statistics integration
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '../api/config';
import { branchPerformanceService } from './branchPerformance';
import { accurateDashboardService } from './accurateDashboard';
import type {
  DashboardParams,
  DashboardKPIs,
  LoanStatistics,
  StatisticValue,
  BranchPerformance,
  ReportStatistics,
} from '../api/types';
import { isSuccessResponse } from '../utils/responseHelpers';

export interface DashboardService {
  getKPIs(params?: DashboardParams): Promise<DashboardKPIs>;
  getLoanStatistics(params?: DashboardParams): Promise<LoanStatistics>;
  getReportStatistics(params?: DashboardParams): Promise<ReportStatistics>;
}

class DashboardAPIService implements DashboardService {
  async getKPIs(params?: DashboardParams): Promise<DashboardKPIs> {
    try {
      // Use accurate dashboard service to get real data instead of mock calculations
      const accurateData = await accurateDashboardService.getAccurateKPIs(params);
      
      // Get calculated branch performance
      const branchPerformance = await branchPerformanceService.calculateBranchPerformance(params);
      
      // Get report statistics to include in KPIs
      const reportStats = await this.getReportStatistics(params);
      
      // Merge accurate data with calculated branch performance and report statistics
      return {
        ...accurateData,
        bestPerformingBranches: branchPerformance.bestPerformingBranches,
        worstPerformingBranches: branchPerformance.worstPerformingBranches,
        // Add report statistics to KPIs
        totalReports: this.transformStatisticValue(
          reportStats.totalReports.count,
          reportStats.totalReports.growth,
          'total reports'
        ),
        pendingReports: this.transformStatisticValue(
          reportStats.pendingReports.count,
          reportStats.pendingReports.growth,
          'pending reports'
        ),
        approvedReports: this.transformStatisticValue(
          reportStats.approvedReports.count,
          reportStats.approvedReports.growth,
          'approved reports'
        ),
        missedReports: this.transformStatisticValue(
          reportStats.missedReports.count,
          reportStats.missedReports.growth,
          'missed reports'
        ),
      };
      
    } catch (error) {
      console.error('Dashboard KPI fetch error:', error);
      
      // Fallback: try to get branch performance even if accurate data fails
      try {
        const branchPerformance = await branchPerformanceService.calculateBranchPerformance(params);
        
        // Try to get report statistics even if main KPIs fail
        let reportStats: ReportStatistics | null = null;
        try {
          reportStats = await this.getReportStatistics(params);
        } catch (reportError) {
          console.error('Report statistics fetch failed:', reportError);
        }
        
        // Return minimal dashboard data with calculated branch performance and report stats if available
        return {
          branches: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          creditOfficers: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          customers: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          loansProcessed: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          loanAmounts: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: true },
          activeLoans: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          missedPayments: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          bestPerformingBranches: branchPerformance.bestPerformingBranches,
          worstPerformingBranches: branchPerformance.worstPerformingBranches,
          // Include report statistics if available, otherwise use defaults
          totalReports: reportStats ? this.transformStatisticValue(
            reportStats.totalReports.count,
            reportStats.totalReports.growth,
            'total reports'
          ) : { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          pendingReports: reportStats ? this.transformStatisticValue(
            reportStats.pendingReports.count,
            reportStats.pendingReports.growth,
            'pending reports'
          ) : { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          approvedReports: reportStats ? this.transformStatisticValue(
            reportStats.approvedReports.count,
            reportStats.approvedReports.growth,
            'approved reports'
          ) : { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          missedReports: reportStats ? this.transformStatisticValue(
            reportStats.missedReports.count,
            reportStats.missedReports.growth,
            'missed reports'
          ) : { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
        };
      } catch (branchError) {
        console.error('Branch performance calculation also failed:', branchError);
        throw error;
      }
    }
  }

  async getLoanStatistics(params: DashboardParams = {}): Promise<LoanStatistics> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.timeFilter) {
        queryParams.append('timeFilter', params.timeFilter);
      }
      
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      if (params.branch) {
        queryParams.append('branch', params.branch);
      }

      const url = `${API_ENDPOINTS.DASHBOARD.KPI}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<LoanStatistics>(url);

      if (isSuccessResponse(response)) {
        return response.data;
      }

      throw new Error((response.data as { message?: string }).message || 'Failed to fetch loan statistics');
    } catch (error) {
      console.error('Loan statistics fetch error:', error);
      throw error;
    }
  }

  /**
   * Get report statistics for dashboard KPIs
   * Uses dashboard KPI endpoint instead of reports statistics endpoint to avoid validation errors
   */
  async getReportStatistics(params: DashboardParams = {}): Promise<ReportStatistics> {
    try {
      console.log('🔍 Dashboard getReportStatistics called with params:', params);
      
      // Use the dedicated reports dashboard stats endpoint
      const queryParams = new URLSearchParams();
      
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      if (params.branch) {
        queryParams.append('branch', params.branch);
      }

      const url = `${API_ENDPOINTS.REPORTS.DASHBOARD_STATS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🌐 Fetching report statistics from dedicated endpoint:', url);
      
      const response = await apiClient.get<Record<string, unknown>>(url);
      
      console.log('🔍 Raw reports dashboard stats response:', JSON.stringify(response, null, 2));
      
      // Extract report statistics from the response
      let reportStats: ReportStatistics;
      
      if (response && response.data) {
        const data = response.data;
        
        console.log('🔍 Extracted data object:', JSON.stringify(data, null, 2));
        
        // Backend returns: totalPending, totalApproved, totalDeclined
        // Calculate total reports from the sum of all statuses
        const totalCount = (data.totalPending || 0) + (data.totalApproved || 0) + (data.totalDeclined || 0);
        
        // The endpoint returns report statistics in a different format
        // Backend returns: { totalPending: number, totalApproved: number, totalDeclined: number }
        // Frontend expects: ReportStatistics format
        reportStats = {
          totalReports: {
            count: totalCount,
            growth: 0 // Backend doesn't provide growth data
          },
          submittedReports: {
            count: totalCount, // All reports are submitted
            growth: 0
          },
          pendingReports: {
            count: data.totalPending || 0,
            growth: 0
          },
          approvedReports: {
            count: data.totalApproved || 0,
            growth: 0
          },
          missedReports: {
            count: data.totalDeclined || 0, // Using declined as missed for now
            growth: 0
          }
        };
        
        console.log('✅ Transformed report statistics:', reportStats);
        // Transform to match the expected ReportStatistics interface
        reportStats = {
          totalReports: {
            count: data.totalReports?.count || data.total || totalCount,
            growth: data.totalReports?.growth || data.totalGrowth || 0
          },
          submittedReports: {
            // Backend doesn't distinguish between submitted and pending
            count: data.submittedReports?.count || data.submitted || 0,
            growth: data.submittedReports?.growth || data.submittedGrowth || 0
          },
          pendingReports: {
            count: data.pendingReports?.count || data.pending || data.totalPending || 0,
            growth: data.pendingReports?.growth || data.pendingGrowth || 0
          },
          approvedReports: {
            count: data.approvedReports?.count || data.approved || data.totalApproved || 0,
            growth: data.approvedReports?.growth || data.approvedGrowth || 0
          },
          missedReports: {
            // Backend doesn't have missed reports, use declined as a proxy or 0
            count: data.missedReports?.count || data.missed || data.totalDeclined || 0,
            growth: data.missedReports?.growth || data.missedGrowth || 0
          }
        };
        
        console.log('🔍 Constructed reportStats:', JSON.stringify(reportStats, null, 2));
      } else {
        // Fallback to default values if no data is available
        reportStats = {
          totalReports: { count: 0, growth: 0 },
          submittedReports: { count: 0, growth: 0 },
          pendingReports: { count: 0, growth: 0 },
          approvedReports: { count: 0, growth: 0 },
          missedReports: { count: 0, growth: 0 },
        };
      }
      
      console.log('✅ Successfully fetched report statistics:', reportStats);
      return reportStats;
      
    } catch (error) {
      console.error('❌ Dashboard report statistics fetch error:', {
        error,
        params,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return default values as fallback to prevent dashboard from breaking
      console.warn('⚠️ Returning default report statistics due to error');
      return {
        totalReports: { count: 0, growth: 0 },
        submittedReports: { count: 0, growth: 0 },
        pendingReports: { count: 0, growth: 0 },
        approvedReports: { count: 0, growth: 0 },
        missedReports: { count: 0, growth: 0 },
      };
    }
  }

  /**
   * Transform backend dashboard data to frontend format
   */
  private transformDashboardData(backendData: Record<string, unknown>): DashboardKPIs {
    return {
      branches: this.transformStatisticValue(
        (backendData.totalBranches as number) || (backendData.branches as number),
        (backendData.branchesGrowth as number) || 0,
        'branches'
      ),
      creditOfficers: this.transformStatisticValue(
        (backendData.totalCreditOfficers as number) || (backendData.creditOfficers as number),
        (backendData.creditOfficersGrowth as number) || 0,
        'credit officers'
      ),
      customers: this.transformStatisticValue(
        (backendData.totalCustomers as number) || (backendData.customers as number),
        (backendData.customersGrowth as number) || 0,
        'customers'
      ),
      loansProcessed: this.transformStatisticValue(
        (backendData.loansProcessed as number) || (backendData.totalLoans as number),
        (backendData.loansProcessedGrowth as number) || (backendData.loansGrowth as number) || 0,
        'loans processed'
      ),
      loanAmounts: this.transformStatisticValue(
        (backendData.totalLoanAmount as number) || (backendData.loanAmounts as number),
        (backendData.loanAmountGrowth as number) || (backendData.loanAmountsGrowth as number) || 0,
        'loan amount',
        true // isCurrency
      ),
      activeLoans: this.transformStatisticValue(
        backendData.activeLoans as number,
        (backendData.activeLoansGrowth as number) || 0,
        'active loans'
      ),
      missedPayments: this.transformStatisticValue(
        backendData.missedPayments as number,
        (backendData.missedPaymentsGrowth as number) || 0,
        'missed payments'
      ),
      bestPerformingBranches: this.transformBranchPerformance(
        (backendData.bestPerformingBranches as unknown[]) || (backendData.topBranches as unknown[]) || []
      ),
      worstPerformingBranches: this.transformBranchPerformance(
        (backendData.worstPerformingBranches as unknown[]) || (backendData.bottomBranches as unknown[]) || []
      ),
      
      // Report statistics KPIs (using mock data since backend doesn't provide these yet)
      totalReports: this.transformStatisticValue(
        (backendData.totalReports as number) || 0,
        (backendData.totalReportsGrowth as number) || 0,
        'total reports'
      ),
      pendingReports: this.transformStatisticValue(
        (backendData.pendingReports as number) || 0,
        (backendData.pendingReportsGrowth as number) || 0,
        'pending reports'
      ),
      approvedReports: this.transformStatisticValue(
        (backendData.approvedReports as number) || 0,
        (backendData.approvedReportsGrowth as number) || 0,
        'approved reports'
      ),
      missedReports: this.transformStatisticValue(
        (backendData.missedReports as number) || 0,
        (backendData.missedReportsGrowth as number) || 0,
        'missed reports'
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
  private transformBranchPerformance(branches: unknown[]): BranchPerformance[] {
    if (!Array.isArray(branches)) {
      return [];
    }

    return branches.map(branch => {
      const branchObj = branch as Record<string, unknown>;
      return {
        name: (branchObj.name as string) || (branchObj.branchName as string) || 'Unknown Branch',
        activeLoans: (branchObj.activeLoans as number) || (branchObj.loans as number) || 0,
        amount: (branchObj.amount as number) || (branchObj.totalAmount as number) || (branchObj.loanAmount as number) || 0,
      };
    });
  }
}

// Export singleton instance
export const dashboardService = new DashboardAPIService();
