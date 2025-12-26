/**
 * Account Manager Dashboard Service
 * Handles AM-specific dashboard KPI data fetching and transformation
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { transformDashboardKPIData } from '../api/transformers';
import type {
  DashboardParams,
  DashboardKPIs,
  StatisticValue,
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

export interface AMDashboardService {
  getKPIs(params?: DashboardParams): Promise<DashboardKPIs>;
  getDisbursementChart(params?: DashboardParams): Promise<ChartData>;
  getBranchPerformance(params?: DashboardParams): Promise<BranchPerformance[]>;
}

class AMDashboardAPIService implements AMDashboardService {
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

      const url = `${API_ENDPOINTS.AM.DASHBOARD}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get(url);

      // Transform the response using the centralized transformer
      return transformDashboardKPIData(response.data || response);
    } catch (error) {
      console.error('AM Dashboard KPI fetch error:', error);
      throw error;
    }
  }

  async getDisbursementChart(params?: DashboardParams): Promise<ChartData> {
    try {
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

      const url = `${API_ENDPOINTS.LOANS.DISBURSEMENT_VOLUME}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get(url);
      
      // Transform backend chart data to frontend format
      return this.transformChartData(response.data || response);
    } catch (error) {
      console.error('AM Disbursement Chart fetch error:', error);
      // Return default chart data on error
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

  async getBranchPerformance(params?: DashboardParams): Promise<BranchPerformance[]> {
    try {
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

      // Get KPIs which include branch performance data
      const kpis = await this.getKPIs(params);
      
      // Combine best and worst performing branches
      return [
        ...kpis.bestPerformingBranches,
        ...kpis.worstPerformingBranches
      ];
    } catch (error) {
      console.error('AM Branch Performance fetch error:', error);
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
export const amDashboardService = new AMDashboardAPIService();