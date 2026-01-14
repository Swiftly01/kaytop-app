/**
 * Accurate Dashboard Service
 * Fetches real data from multiple endpoints to provide accurate dashboard KPIs
 * instead of using mock/calculated values
 */

import apiClient from '@/lib/apiClient';
import { growthCalculationService } from './growthCalculation';
import { unifiedUserService } from './unifiedUser';
import type { DashboardKPIs, DashboardParams, StatisticValue } from '../api/types';

export interface AccurateDashboardService {
  getAccurateKPIs(params?: DashboardParams): Promise<DashboardKPIs>;
}

class AccurateDashboardAPIService implements AccurateDashboardService {
  
  /**
   * Get accurate KPIs by fetching from multiple endpoints
   */
  async getAccurateKPIs(params?: DashboardParams): Promise<DashboardKPIs> {
    try {
      // Fetch data from multiple endpoints in parallel
      const [
        kpiResponse,
        usersResponse,
        branchesResponse,
        loansResponse
      ] = await Promise.all([
        this.fetchKPIData(params),
        this.fetchUsersData(),
        this.fetchBranchesData(),
        this.fetchLoansData(params)
      ]);

      // Calculate accurate statistics
      const accurateStats = this.calculateAccurateStatistics(
        kpiResponse,
        usersResponse,
        branchesResponse,
        loansResponse,
        params
      );

      return accurateStats;

    } catch (error) {
      console.error('Accurate dashboard fetch error:', error);
      throw error;
    }
  }

  /**
   * Fetch KPI data from backend
   */
  private async fetchKPIData(params?: DashboardParams): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.timeFilter) queryParams.append('timeFilter', params.timeFilter);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.branch) queryParams.append('branch', params.branch);

      const endpoint = `/dashboard/kpi${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<any>(endpoint);
      
      return response.data || response;
    } catch (error) {
      console.error('KPI data fetch error:', error);
      return {};
    }
  }

  /**
   * Fetch users data to get accurate customer and credit officer counts
   */
  private async fetchUsersData(): Promise<any[]> {
    try {
      // Use unifiedUserService which now transforms data with role detection
      const response = await unifiedUserService.getUsers({ limit: 1000 });
      
      console.log('🔍 Raw users API response:', response);
      
      const users = response.data || [];
      
      // Debug: Log role distribution
      const roleDistribution: Record<string, number> = {};
      users.forEach(user => {
        const role = user.role || 'undefined';
        roleDistribution[role] = (roleDistribution[role] || 0) + 1;
      });
      
      console.log('👥 Users role distribution:', roleDistribution);
      console.log(`📊 Total users fetched: ${users.length}`);
      
      // Debug: Show sample users
      if (users.length > 0) {
        console.log('📝 Sample user:', users[0]);
      }
      
      return users;
    } catch (error) {
      console.error('Users data fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch branches data to get accurate branch count
   */
  private async fetchBranchesData(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/users/branches');
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Branches data fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch loans data for accurate loan statistics
   */
  private async fetchLoansData(params?: DashboardParams): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.timeFilter) queryParams.append('timeFilter', params.timeFilter);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.branch) queryParams.append('branch', params.branch);
      
      queryParams.append('limit', '1000'); // Get more data for accurate calculations
      
      const endpoint = `/loans/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔍 Fetching loans from endpoint:', endpoint);
      
      const response = await apiClient.get<any>(endpoint);
      
      console.log('📦 Raw loans API response:', response);
      
      let loansArray: any[] = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        loansArray = response.data.data;
        console.log(`✅ Extracted ${loansArray.length} loans from response.data.data`);
      } else if (Array.isArray(response.data)) {
        loansArray = response.data;
        console.log(`✅ Extracted ${loansArray.length} loans from response.data`);
      } else if (Array.isArray(response)) {
        loansArray = response;
        console.log(`✅ Extracted ${loansArray.length} loans from response`);
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
      }
      
      return loansArray;
    } catch (error) {
      console.error('❌ Loans data fetch error:', error);
      return [];
    }
  }

  /**
   * Calculate accurate statistics from fetched data
   */
  private async calculateAccurateStatistics(
    kpiData: any,
    usersData: any[],
    branchesData: string[],
    loansData: any[],
    params?: DashboardParams
  ): Promise<DashboardKPIs> {
    
    // Calculate accurate counts from real data
    const creditOfficers = usersData.filter(user => 
      user.role === 'credit_officer' || user.role === 'creditofficer'
    );
    
    console.log('🔍 Filtering customers from users data...');
    console.log(`📊 Total users to filter: ${usersData.length}`);
    
    const customers = usersData.filter(user => {
      const isCustomer = user.role === 'customer';
      if (isCustomer) {
        console.log('✅ Found customer:', user);
      }
      return isCustomer;
    });
    
    console.log(`👥 Customers found: ${customers.length}`);
    console.log(`👔 Credit officers found: ${creditOfficers.length}`);
    
    const activeLoans = loansData.filter(loan => 
      loan.status === 'active' || loan.status === 'disbursed'
    );
    
    console.log('💰 Calculating total loan amount from loans data...');
    console.log(`📊 Total loans to process: ${loansData.length}`);
    
    // Debug: Show sample loan data
    if (loansData.length > 0) {
      console.log('📝 Sample loan:', loansData[0]);
      console.log('💵 Sample loan amount:', loansData[0].amount);
      console.log('💵 Sample loan amount type:', typeof loansData[0].amount);
    }
    
    const totalLoanAmount = loansData.reduce((sum, loan) => {
      // Handle both number and string amounts
      const amount = typeof loan.amount === 'string' 
        ? parseFloat(loan.amount.replace(/[^0-9.-]/g, '')) 
        : (loan.amount || 0);
      
      if (isNaN(amount)) {
        console.warn('⚠️ Invalid loan amount:', loan.amount, 'for loan:', loan.id);
        return sum;
      }
      
      return sum + amount;
    }, 0);
    
    console.log(`💰 Total loan amount calculated: ${totalLoanAmount}`);
    
    const missedPayments = loansData.filter(loan => 
      loan.status === 'defaulted' || loan.status === 'overdue'
    );

    // Calculate real growth rates by comparing with previous period
    const currentMetrics = {
      branches: branchesData.length,
      creditOfficers: creditOfficers.length,
      customers: customers.length,
      loansProcessed: loansData.length,
      loanAmounts: totalLoanAmount,
      activeLoans: activeLoans.length,
      missedPayments: missedPayments.length
    };

    // Get real growth calculations
    const growthData = await growthCalculationService.calculateGrowthForAllMetrics(currentMetrics, params);

    // Helper function to get growth rate with backend fallback
    const getGrowthRate = (field: string, calculatedGrowth: number): number => {
      // Try to get growth from backend first
      if (kpiData[`${field}Growth`] !== undefined && kpiData[`${field}Growth`] !== null) {
        return kpiData[`${field}Growth`];
      }
      
      // Use calculated growth if backend doesn't provide it
      return calculatedGrowth;
    };

    return {
      branches: this.createStatisticValue(
        branchesData.length,
        getGrowthRate('branches', growthData.branchesGrowth),
        false
      ),
      
      creditOfficers: this.createStatisticValue(
        creditOfficers.length,
        getGrowthRate('creditOfficers', growthData.creditOfficersGrowth),
        false
      ),
      
      customers: this.createStatisticValue(
        customers.length,
        getGrowthRate('customers', growthData.customersGrowth),
        false
      ),
      
      loansProcessed: this.createStatisticValue(
        loansData.length,
        getGrowthRate('loansProcessed', growthData.loansProcessedGrowth),
        false
      ),
      
      loanAmounts: this.createStatisticValue(
        totalLoanAmount,
        getGrowthRate('loanAmounts', growthData.loanAmountsGrowth),
        true // isCurrency
      ),
      
      activeLoans: this.createStatisticValue(
        activeLoans.length,
        getGrowthRate('activeLoans', growthData.activeLoansGrowth),
        false
      ),
      
      missedPayments: this.createStatisticValue(
        missedPayments.length,
        getGrowthRate('missedPayments', growthData.missedPaymentsGrowth),
        false
      ),
      
      // Keep the calculated branch performance from the existing service
      bestPerformingBranches: this.transformBranchPerformance(
        kpiData.topPerformers || kpiData.officerPerformance || []
      ),
      
      worstPerformingBranches: this.transformBranchPerformance(
        (kpiData.topPerformers || kpiData.officerPerformance || []).slice().reverse().slice(0, 3)
      ),
      
      // Report statistics KPIs (using mock data since backend doesn't provide these yet)
      totalReports: this.createStatisticValue(
        kpiData.totalReports || 0,
        getGrowthRate('totalReports', growthData.totalReportsGrowth || 0),
        false
      ),
      pendingReports: this.createStatisticValue(
        kpiData.pendingReports || 0,
        getGrowthRate('pendingReports', growthData.pendingReportsGrowth || 0),
        false
      ),
      approvedReports: this.createStatisticValue(
        kpiData.approvedReports || 0,
        getGrowthRate('approvedReports', growthData.approvedReportsGrowth || 0),
        false
      ),
      missedReports: this.createStatisticValue(
        kpiData.missedReports || 0,
        getGrowthRate('missedReports', growthData.missedReportsGrowth || 0),
        false
      ),
    };
  }

  /**
   * Create a StatisticValue object
   */
  private createStatisticValue(
    value: number,
    change: number,
    isCurrency: boolean = false
  ): StatisticValue {
    // Generate change label
    let changeLabel = '';
    if (change > 0) {
      changeLabel = `+${change.toFixed(2)}% this month`;
    } else if (change < 0) {
      changeLabel = `${change.toFixed(2)}% this month`;
    } else {
      changeLabel = '+0% this month';
    }

    return {
      value,
      change,
      changeLabel,
      isCurrency,
    };
  }

  /**
   * Transform branch performance data
   */
  private transformBranchPerformance(branches: any[]): any[] {
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

export const accurateDashboardService = new AccurateDashboardAPIService();
