/**
 * Unified Dashboard Service
 * Single service that works for all user roles using direct backend endpoints
 */

import apiClient from '@/lib/apiClient';
import { branchPerformanceService } from './branchPerformance';
import { accurateDashboardService } from './accurateDashboard';
import type {
  DashboardParams,
  DashboardKPIs,
  BranchPerformance,
} from '../api/types';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface UnifiedDashboardService {
  getKPIs(params?: DashboardParams): Promise<DashboardKPIs>;
  getDisbursementChart(params?: DashboardParams): Promise<ChartData>;
  getBranchPerformance(params?: DashboardParams): Promise<BranchPerformance[]>;
}

class UnifiedDashboardAPIService implements UnifiedDashboardService {
  /**
   * Get dashboard KPIs directly from backend
   * Works for all user roles - backend handles role-based filtering
   */
  async getKPIs(params?: DashboardParams): Promise<DashboardKPIs> {
    try {
      // Use accurate dashboard service to get real data instead of mock calculations
      const accurateData = await accurateDashboardService.getAccurateKPIs(params);
      
      // Get calculated branch performance
      const branchPerformance = await branchPerformanceService.calculateBranchPerformance(params);
      
      // Merge accurate data with calculated branch performance
      return {
        ...accurateData,
        bestPerformingBranches: branchPerformance.bestPerformingBranches,
        worstPerformingBranches: branchPerformance.worstPerformingBranches,
      };
      
    } catch (error) {
      console.error('Dashboard KPI fetch error:', error);
      
      // Fallback: try to get branch performance even if accurate data fails
      try {
        const branchPerformance = await branchPerformanceService.calculateBranchPerformance(params);
        
        // Return minimal dashboard data with calculated branch performance
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
          // Report statistics KPIs (default values when no data available)
          totalReports: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          pendingReports: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          approvedReports: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
          missedReports: { value: 0, change: 0, changeLabel: 'No data available', isCurrency: false },
        };
      } catch (branchError) {
        console.error('Branch performance calculation also failed:', branchError);
        throw error;
      }
    }
  }

  /**
   * Get disbursement chart data directly from backend
   * Uses the loans disbursement volume endpoint
   */
  async getDisbursementChart(params?: DashboardParams): Promise<ChartData> {
    const queryParams = new URLSearchParams();
    
    if (params?.timeFilter) queryParams.append('timeFilter', params.timeFilter);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.branch) queryParams.append('branch', params.branch);

    const endpoint = `/loans/disbursed/volume${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    try {
      const response = await apiClient.get(endpoint);
      return this.transformChartData(response.data);
    } catch (error) {
      console.error('Disbursement chart fetch error:', error);
      // Return default chart data on error
      return this.getDefaultChartData();
    }
  }

  /**
   * Get branch performance data from calculated metrics
   */
  async getBranchPerformance(params?: DashboardParams): Promise<BranchPerformance[]> {
    try {
      const branchPerformance = await branchPerformanceService.calculateBranchPerformance(params);
      
      // Combine best and worst performing branches
      return [
        ...branchPerformance.bestPerformingBranches,
        ...branchPerformance.worstPerformingBranches
      ];
    } catch (error) {
      console.error('Branch performance fetch error:', error);
      return [];
    }
  }

  /**
   * Transform backend chart data to frontend format
   */
  private transformChartData(backendData: unknown): ChartData {
    // Handle different backend response formats
    if (Array.isArray(backendData)) {
      // Format: [{ month: 'Jan', amount: 1000000 }, ...]
      const labels = backendData.map(item => {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          return (obj.month || obj.label || obj.name || '') as string;
        }
        return '';
      });
      const data = backendData.map(item => {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          return Number(obj.amount || obj.value || obj.total || 0);
        }
        return 0;
      });
      
      return {
        labels,
        datasets: [{
          label: 'Disbursements',
          data,
          backgroundColor: '#7F56D9',
          borderColor: '#7F56D9'
        }]
      };
    } else if (backendData && typeof backendData === 'object') {
      // Format: { labels: [], data: [] } or { months: [], amounts: [] }
      const obj = backendData as Record<string, unknown>;
      const labels = (obj.labels || obj.months || []) as string[];
      const data = (obj.data || obj.amounts || obj.values || []) as number[];
      
      return {
        labels,
        datasets: [{
          label: 'Disbursements',
          data,
          backgroundColor: '#7F56D9',
          borderColor: '#7F56D9'
        }]
      };
    }

    // Fallback to default data
    return this.getDefaultChartData();
  }

  /**
   * Get default chart data for fallback scenarios
   */
  private getDefaultChartData(): ChartData {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Disbursements',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: '#7F56D9',
        borderColor: '#7F56D9'
      }]
    };
  }
}

// Export singleton instance
export const unifiedDashboardService = new UnifiedDashboardAPIService();
