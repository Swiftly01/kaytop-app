/**
 * Accurate Dashboard Service
 * Fetches real data from multiple endpoints to provide accurate dashboard KPIs
 * with performance optimizations including caching and request deduplication
 */

import apiClient from '@/lib/apiClient';
import { growthCalculationService } from './growthCalculation';
import { unifiedUserService } from './unifiedUser';
import { performanceMonitor } from '../utils/performanceMonitor';
import type { DashboardKPIs, DashboardParams, StatisticValue } from '../api/types';

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<unknown>>();

export interface AccurateDashboardService {
  getAccurateKPIs(params?: DashboardParams): Promise<DashboardKPIs>;
  clearCache(): void;
}

class AccurateDashboardAPIService implements AccurateDashboardService {
  // In-memory cache with 5-minute TTL
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    pendingRequests.clear();
  }

  /**
   * Get data from cache or fetch if expired
   */
  private async getCachedData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    customTTL?: number
  ): Promise<T> {
    const requestId = `dashboard-${key}-${Date.now()}`;
    performanceMonitor.startRequest(requestId);
    
    const now = Date.now();
    const cached = this.cache.get(key);
    
    // Return cached data if still valid
    if (cached && now < cached.expiresAt) {
      performanceMonitor.endRequest(requestId, true);
      return cached.data;
    }

    // Check if request is already pending to avoid duplicate calls
    if (pendingRequests.has(key)) {
      const result = await pendingRequests.get(key)!;
      performanceMonitor.endRequest(requestId, false);
      return result;
    }

    // Create new request
    const requestPromise = fetchFn();
    pendingRequests.set(key, requestPromise);

    try {
      const data = await requestPromise;
      
      // Cache the result
      const ttl = customTTL || this.CACHE_TTL;
      this.cache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + ttl
      });
      
      performanceMonitor.endRequest(requestId, false);
      return data;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(key);
    }
  }

  /**
   * Generate cache key from parameters
   */
  private getCacheKey(prefix: string, params?: DashboardParams): string {
    if (!params) return prefix;
    
    const paramStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `${prefix}:${paramStr}`;
  }
  
  /**
   * Get accurate KPIs by fetching from multiple endpoints with caching
   */
  async getAccurateKPIs(params?: DashboardParams): Promise<DashboardKPIs> {
    try {
      
      // Use cached data with request deduplication
      const cacheKey = this.getCacheKey('accurate-kpis', params);
      
      return await this.getCachedData(cacheKey, async () => {
        
        // Fetch data from multiple endpoints in parallel with individual caching
        const [
          kpiResponse,
          usersResponse,
          branchesResponse,
          loansResponse
        ] = await Promise.all([
          this.getCachedData('kpi-data', () => this.fetchKPIData(params)),
          this.getCachedData('users-data', () => this.fetchUsersData()),
          this.getCachedData('branches-data', () => this.fetchBranchesData()),
          this.getCachedData('loans-data', () => this.fetchLoansData(params))
        ]);

        // Calculate accurate statistics
        const accurateStats = await this.calculateAccurateStatistics(
          kpiResponse,
          usersResponse,
          branchesResponse,
          loansResponse,
          params
        );

        return accurateStats;
      });

    } catch (error) {
      console.error('❌ Accurate dashboard fetch error:', error);
      throw error;
    }
  }

  /**
   * Fetch KPI data from backend
   */
  private async fetchKPIData(params?: DashboardParams): Promise<Record<string, unknown>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.timeFilter) queryParams.append('timeFilter', params.timeFilter);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.branch) queryParams.append('branch', params.branch);

      const endpoint = `/dashboard/kpi${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<unknown>(endpoint);
      
      return (response.data as Record<string, unknown>) || {};
    } catch (error) {
      console.error('KPI data fetch error:', error);
      return {};
    }
  }

  /**
   * Fetch users data with role-based filtering to reduce payload
   */
  private async fetchUsersData(): Promise<Record<string, unknown>[]> {
    try {
      
      // Use the unified user service to get all users (it already uses /admin/staff/my-staff)
      // This ensures consistency between dashboard stats and credit officers page
      console.log('🔄 Fetching all users from unified service for dashboard stats...');
      const allUsersResponse = await unifiedUserService.getUsers({ limit: 1000 });
      const allUsers = allUsersResponse.data || [];
      
      console.log(`📊 Total users fetched for dashboard: ${allUsers.length}`);
      
      // Log role distribution for debugging
      const roleDistribution: Record<string, number> = {};
      allUsers.forEach(user => {
        const role = (user.role as string) || 'undefined';
        roleDistribution[role] = (roleDistribution[role] || 0) + 1;
      });
      console.log('🎭 Dashboard users role distribution:', roleDistribution);
      
      return allUsers;
    } catch (error) {
      console.error('❌ Users data fetch error:', error);
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
   * Fetch loans data with pagination for better performance
   */
  private async fetchLoansData(params?: DashboardParams): Promise<Record<string, unknown>[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.timeFilter) queryParams.append('timeFilter', params.timeFilter);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.branch) queryParams.append('branch', params.branch);
      
      // Use reasonable limit instead of 1000 for better performance
      queryParams.append('limit', '500');
      
      const endpoint = `/loans/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<unknown>(endpoint);
      
      let loansArray: Record<string, unknown>[] = [];
      
      if (response.data && Array.isArray((response.data as any).data)) {
        loansArray = (response.data as any).data as Record<string, unknown>[];
        console.log(`✅ Extracted ${loansArray.length} loans from response.data.data`);
      } else if (Array.isArray(response.data)) {
        loansArray = response.data as Record<string, unknown>[];
        console.log(`✅ Extracted ${loansArray.length} loans from response.data`);
      } else if (Array.isArray(response)) {
        loansArray = response as Record<string, unknown>[];
        console.log(`✅ Extracted ${loansArray.length} loans from response`);
      } else {
        console.warn('⚠️ Unexpected loans response structure:', response);
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
    kpiData: Record<string, unknown>,
    usersData: Record<string, unknown>[],
    branchesData: string[],
    loansData: Record<string, unknown>[],
    params?: DashboardParams
  ): Promise<DashboardKPIs> {
    
    // Calculate accurate counts from real data
    const creditOfficers = usersData.filter(user => {
      const userRole = (user.role as string)?.toLowerCase() || '';
      return userRole === 'credit_officer' || 
             userRole === 'creditofficer' || 
             userRole === 'credit officer' ||
             userRole === 'co' ||
             userRole.includes('credit');
    });
    
    console.log('🔍 Filtering customers from users data...');
    console.log(`📊 Total users to filter: ${usersData.length}`);
    
    // Debug: Show all unique roles in the dataset
    const uniqueRoles = [...new Set(usersData.map(user => user.role as string))];
    console.log('🎭 Available roles in dataset:', uniqueRoles);
    
    // Debug: Show sample users for each role
    uniqueRoles.forEach(role => {
      const sampleUser = usersData.find(user => user.role === role);
      console.log(`👤 Sample ${role}:`, { 
        id: sampleUser?.id, 
        name: `${sampleUser?.firstName} ${sampleUser?.lastName}`,
        email: sampleUser?.email,
        branch: sampleUser?.branch 
      });
    });
    
    const customers = usersData.filter(user => {
      const isCustomer = (user.role as string) === 'customer';
      if (isCustomer) {
        console.log('✅ Found customer:', user);
      }
      return isCustomer;
    });
    
    console.log(`👥 Customers found: ${customers.length}`);
    console.log(`👔 Credit officers found: ${creditOfficers.length}`);
    
    // If no credit officers found, log helpful information
    if (creditOfficers.length === 0) {
      console.warn('⚠️ No credit officers found in dataset. Available roles:', uniqueRoles);
      console.warn('💡 Consider checking if credit officers exist in the system or if they use a different role name.');
    }
    
    const activeLoans = loansData.filter(loan => 
      (loan.status as string) === 'active' || (loan.status as string) === 'disbursed'
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
        ? parseFloat((loan.amount as string).replace(/[^0-9.-]/g, '')) 
        : ((loan.amount as number) || 0);
      
      if (isNaN(amount)) {
        console.warn('⚠️ Invalid loan amount:', loan.amount, 'for loan:', loan.id);
        return sum;
      }
      
      return sum + amount;
    }, 0);
    
    console.log(`💰 Total loan amount calculated: ${totalLoanAmount}`);
    
    const missedPayments = loansData.filter(loan => 
      (loan.status as string) === 'defaulted' || (loan.status as string) === 'overdue'
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
        return kpiData[`${field}Growth`] as number;
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
        (kpiData.topPerformers as unknown[]) || (kpiData.officerPerformance as unknown[]) || []
      ),
      
      worstPerformingBranches: this.transformBranchPerformance(
        ((kpiData.topPerformers as unknown[]) || (kpiData.officerPerformance as unknown[]) || []).slice().reverse().slice(0, 3)
      ),
      
      // Report statistics KPIs (using mock data since backend doesn't provide these yet)
      totalReports: this.createStatisticValue(
        (kpiData.totalReports as number) || 0,
        getGrowthRate('totalReports', (growthData.totalReportsGrowth as number) || 0),
        false
      ),
      pendingReports: this.createStatisticValue(
        (kpiData.pendingReports as number) || 0,
        getGrowthRate('pendingReports', (growthData.pendingReportsGrowth as number) || 0),
        false
      ),
      approvedReports: this.createStatisticValue(
        (kpiData.approvedReports as number) || 0,
        getGrowthRate('approvedReports', (growthData.approvedReportsGrowth as number) || 0),
        false
      ),
      missedReports: this.createStatisticValue(
        (kpiData.missedReports as number) || 0,
        getGrowthRate('missedReports', (growthData.missedReportsGrowth as number) || 0),
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
  private transformBranchPerformance(branches: unknown[]): unknown[] {
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

export const accurateDashboardService = new AccurateDashboardAPIService();
