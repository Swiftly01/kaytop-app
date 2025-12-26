/**
 * Unified Dashboard Service
 * Single service that works for all user roles using direct backend endpoints
 */

import { unifiedApiClient } from '../api/client';
import type {
  DashboardParams,
  DashboardKPIs,
  BranchPerformance,
  ApiResponse,
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
    const queryParams = new URLSearchParams();
    
    if (params?.timeFilter) queryParams.append('timeFilter', params.timeFilter);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.branch) queryParams.append('branch', params.branch);

    const endpoint = `/dashboard/kpi${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response: ApiResponse<DashboardKPIs> = await unifiedApiClient.get(endpoint);
    return response.data;
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
      const response = await unifiedApiClient.get(endpoint);
      return this.transformChartData(response.data);
    } catch (error) {
      console.error('Disbursement chart fetch error:', error);
      // Return default chart data on error
      return this.getDefaultChartData();
    }
  }

  /**
   * Get branch performance data from KPIs
   */
  async getBranchPerformance(params?: DashboardParams): Promise<BranchPerformance[]> {
    try {
      const kpis = await this.getKPIs(params);
      
      // Combine best and worst performing branches
      return [
        ...kpis.bestPerformingBranches,
        ...kpis.worstPerformingBranches
      ];
    } catch (error) {
      console.error('Branch performance fetch error:', error);
      return [];
    }
  }

  /**
   * Transform backend chart data to frontend format
   */
  private transformChartData(backendData: any): ChartData {
    // Handle different backend response formats
    if (Array.isArray(backendData)) {
      // Format: [{ month: 'Jan', amount: 1000000 }, ...]
      const labels = backendData.map(item => item.month || item.label || item.name || '');
      const data = backendData.map(item => item.amount || item.value || item.total || 0);
      
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
      const labels = backendData.labels || backendData.months || [];
      const data = backendData.data || backendData.amounts || backendData.values || [];
      
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