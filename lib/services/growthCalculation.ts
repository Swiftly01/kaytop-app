/**
 * Growth Calculation Service
 * Calculates real growth percentages by comparing current period with previous period data
 */

import apiClient from '@/lib/apiClient';
import { unifiedUserService } from './unifiedUser';
import type { DashboardParams } from '../api/types';

export interface GrowthCalculationService {
  calculateRealGrowth(currentValue: number, field: string, params?: DashboardParams): Promise<number>;
  calculateGrowthForAllMetrics(currentMetrics: any, params?: DashboardParams): Promise<any>;
}

class GrowthCalculationAPIService implements GrowthCalculationService {
  
  /**
   * Calculate real growth by comparing current period with previous period
   */
  async calculateRealGrowth(currentValue: number, field: string, params?: DashboardParams): Promise<number> {
    try {
      // Get previous period data for comparison
      const previousPeriodData = await this.getPreviousPeriodData(field, params);
      
      if (previousPeriodData === null || previousPeriodData === 0) {
        return 0; // No previous data to compare
      }
      
      // Calculate percentage change: ((current - previous) / previous) * 100
      const growthPercentage = ((currentValue - previousPeriodData) / previousPeriodData) * 100;
      
      return Math.round(growthPercentage * 100) / 100; // Round to 2 decimal places
      
    } catch (error) {
      console.error(`Growth calculation error for ${field}:`, error);
      return 0; // Return 0 if calculation fails
    }
  }

  /**
   * Calculate growth for all metrics at once
   */
  async calculateGrowthForAllMetrics(currentMetrics: Record<string, number>, params?: DashboardParams): Promise<Record<string, number>> {
    try {
      // Calculate growth for each metric in parallel
      const [
        branchesGrowth,
        creditOfficersGrowth,
        customersGrowth,
        loansProcessedGrowth,
        loanAmountsGrowth,
        activeLoansGrowth,
        missedPaymentsGrowth
      ] = await Promise.all([
        this.calculateRealGrowth(currentMetrics.branches, 'branches', params),
        this.calculateRealGrowth(currentMetrics.creditOfficers, 'creditOfficers', params),
        this.calculateRealGrowth(currentMetrics.customers, 'customers', params),
        this.calculateRealGrowth(currentMetrics.loansProcessed, 'loansProcessed', params),
        this.calculateRealGrowth(currentMetrics.loanAmounts, 'loanAmounts', params),
        this.calculateRealGrowth(currentMetrics.activeLoans, 'activeLoans', params),
        this.calculateRealGrowth(currentMetrics.missedPayments, 'missedPayments', params)
      ]);

      return {
        branchesGrowth,
        creditOfficersGrowth,
        customersGrowth,
        loansProcessedGrowth,
        loanAmountsGrowth,
        activeLoansGrowth,
        missedPaymentsGrowth
      };
      
    } catch (error) {
      console.error('Bulk growth calculation error:', error);
      return {
        branchesGrowth: 0,
        creditOfficersGrowth: 0,
        customersGrowth: 0,
        loansProcessedGrowth: 0,
        loanAmountsGrowth: 0,
        activeLoansGrowth: 0,
        missedPaymentsGrowth: 0
      };
    }
  }

  /**
   * Get previous period data for comparison
   */
  private async getPreviousPeriodData(field: string, params?: DashboardParams): Promise<number | null> {
    try {
      const previousParams = this.calculatePreviousPeriod(params);
      
      switch (field) {
        case 'branches':
          return await this.getPreviousBranchCount(previousParams);
        case 'creditOfficers':
          return await this.getPreviousCreditOfficerCount(previousParams);
        case 'customers':
          return await this.getPreviousCustomerCount(previousParams);
        case 'loansProcessed':
          return await this.getPreviousLoanCount(previousParams);
        case 'loanAmounts':
          return await this.getPreviousLoanAmount(previousParams);
        case 'activeLoans':
          return await this.getPreviousActiveLoansCount(previousParams);
        case 'missedPayments':
          return await this.getPreviousMissedPaymentsCount(previousParams);
        default:
          return null;
      }
      
    } catch (error) {
      console.error(`Previous period data fetch error for ${field}:`, error);
      return null;
    }
  }

  /**
   * Calculate previous period parameters based on current period
   */
  private calculatePreviousPeriod(params?: DashboardParams): DashboardParams {
    if (!params) {
      // Default to previous month if no params
      const now = new Date();
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      return {
        timeFilter: 'custom',
        startDate: previousMonth.toISOString().split('T')[0],
        endDate: endOfPreviousMonth.toISOString().split('T')[0]
      };
    }

    // Calculate previous period based on current timeFilter
    switch (params.timeFilter) {
      case 'last_24_hours':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 2);
        const dayBeforeYesterday = new Date();
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 3);
        
        return {
          timeFilter: 'custom',
          startDate: dayBeforeYesterday.toISOString().split('T')[0],
          endDate: yesterday.toISOString().split('T')[0]
        };

      case 'last_7_days':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 14);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 21);
        
        return {
          timeFilter: 'custom',
          startDate: twoWeeksAgo.toISOString().split('T')[0],
          endDate: weekAgo.toISOString().split('T')[0]
        };

      case 'last_30_days':
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 60);
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 90);
        
        return {
          timeFilter: 'custom',
          startDate: twoMonthsAgo.toISOString().split('T')[0],
          endDate: monthAgo.toISOString().split('T')[0]
        };

      case 'custom':
        if (params.startDate && params.endDate) {
          const startDate = new Date(params.startDate);
          const endDate = new Date(params.endDate);
          const periodLength = endDate.getTime() - startDate.getTime();
          
          const previousEndDate = new Date(startDate.getTime() - 1);
          const previousStartDate = new Date(previousEndDate.getTime() - periodLength);
          
          return {
            timeFilter: 'custom',
            startDate: previousStartDate.toISOString().split('T')[0],
            endDate: previousEndDate.toISOString().split('T')[0]
          };
        }
        break;
    }

    // Default fallback
    return {
      timeFilter: 'custom',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days ago
      endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]  // 30 days ago
    };
  }

  /**
   * Get previous period branch count
   */
  private async getPreviousBranchCount(): Promise<number> {
    try {
      const response = await apiClient.get<string[]>('/users/branches');
      const branches = Array.isArray(response.data) ? response.data : [];
      return branches.length;
    } catch {
      return 0;
    }
  }

  /**
   * Get previous period credit officer count
   */
  private async getPreviousCreditOfficerCount(): Promise<number> {
    try {
      // Use unifiedUserService which applies DataTransformers
      const response = await unifiedUserService.getUsers({ limit: 1000 });
      const users = response.data || [];
      
      const creditOfficers = users.filter(user => 
        user.role === 'credit_officer'
      );
      
      return creditOfficers.length;
    } catch {
      return 0;
    }
  }

  /**
   * Get previous period customer count
   */
  private async getPreviousCustomerCount(): Promise<number> {
    try {
      // Use unifiedUserService which applies DataTransformers
      const response = await unifiedUserService.getUsers({ limit: 1000 });
      const users = response.data || [];
      
      const customers = users.filter(user => user.role === 'customer');
      
      return customers.length;
    } catch {
      return 0;
    }
  }

  /**
   * Get previous period loan count
   */
  private async getPreviousLoanCount(params: DashboardParams): Promise<number> {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      queryParams.append('limit', '1000');
      
      const response = await apiClient.get<{ data?: Record<string, unknown>[] } | Record<string, unknown>[]>(`/loans/all?${queryParams.toString()}`);
      const responseData = response.data;
      let loans: Record<string, unknown>[] = [];
      
      if (Array.isArray(responseData)) {
        loans = responseData;
      } else if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        loans = (responseData.data as Record<string, unknown>[]) || [];
      }
      
      return loans.length;
    } catch {
      return 0;
    }
  }

  /**
   * Get previous period loan amount
   */
  private async getPreviousLoanAmount(params: DashboardParams): Promise<number> {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      queryParams.append('limit', '1000');
      
      const response = await apiClient.get<{ data?: Record<string, unknown>[] } | Record<string, unknown>[]>(`/loans/all?${queryParams.toString()}`);
      const responseData = response.data;
      let loans: Record<string, unknown>[] = [];
      
      if (Array.isArray(responseData)) {
        loans = responseData;
      } else if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        loans = (responseData.data as Record<string, unknown>[]) || [];
      }
      
      const totalAmount = loans.reduce((sum: number, loan: Record<string, unknown>) => 
        sum + (parseFloat((loan.amount as string) || '0') || 0), 0
      );
      
      return totalAmount;
    } catch {
      return 0;
    }
  }

  /**
   * Get previous period active loans count
   */
  private async getPreviousActiveLoansCount(params: DashboardParams): Promise<number> {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      queryParams.append('limit', '1000');
      
      const response = await apiClient.get<{ data?: Record<string, unknown>[] } | Record<string, unknown>[]>(`/loans/all?${queryParams.toString()}`);
      const responseData = response.data;
      let loans: Record<string, unknown>[] = [];
      
      if (Array.isArray(responseData)) {
        loans = responseData;
      } else if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        loans = (responseData.data as Record<string, unknown>[]) || [];
      }
      
      const activeLoans = loans.filter((loan: Record<string, unknown>) => 
        (loan.status as string) === 'active' || (loan.status as string) === 'disbursed'
      );
      
      return activeLoans.length;
    } catch {
      return 0;
    }
  }

  /**
   * Get previous period missed payments count
   */
  private async getPreviousMissedPaymentsCount(params: DashboardParams): Promise<number> {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      queryParams.append('limit', '1000');
      
      const response = await apiClient.get<{ data?: Record<string, unknown>[] } | Record<string, unknown>[]>(`/loans/missed?${queryParams.toString()}`);
      const responseData = response.data;
      let missedLoans: Record<string, unknown>[] = [];
      
      if (Array.isArray(responseData)) {
        missedLoans = responseData;
      } else if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        missedLoans = (responseData.data as Record<string, unknown>[]) || [];
      }
      
      return missedLoans.length;
    } catch {
      return 0;
    }
  }
}

export const growthCalculationService = new GrowthCalculationAPIService();
