/**
 * Branch Performance Service
 * Calculates best and worst performing branches based on multiple metrics
 */

import apiClient from '@/lib/apiClient';
import { unifiedUserService } from './unifiedUser';
import type { BranchPerformance, DashboardParams, Loan } from '../api/types';
import { isSuccessResponse } from '../utils/responseHelpers';

export interface BranchPerformanceMetrics {
  branchName: string;
  totalLoansProcessed: number;
  totalAmountDisbursed: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalCustomers: number;
  totalCreditOfficers: number;
  repaymentRate: number; // Percentage of loans with good repayment
  disbursementVolume: number; // Total amount disbursed
  performanceScore: number; // Calculated performance score
}

export interface BranchPerformanceCalculation {
  bestPerformingBranches: BranchPerformance[];
  worstPerformingBranches: BranchPerformance[];
  allBranchMetrics: BranchPerformanceMetrics[];
}

export interface BranchPerformanceService {
  calculateBranchPerformance(params?: DashboardParams): Promise<BranchPerformanceCalculation>;
  getBranchMetrics(branchName: string, params?: DashboardParams): Promise<BranchPerformanceMetrics>;
}

class BranchPerformanceAPIService implements BranchPerformanceService {
  
  /**
   * Calculate branch performance based on multiple metrics
   */
  async calculateBranchPerformance(params?: DashboardParams): Promise<BranchPerformanceCalculation> {
    try {
      // Fetch all necessary data in parallel
      const [
        allLoans,
        disbursedLoans,
        recollections,
        missedPayments,
        branches,
        users
      ] = await Promise.all([
        this.fetchLoansData('/loans/all', params),
        this.fetchLoansData('/loans/disbursed', params),
        this.fetchLoansData('/loans/recollections', params),
        this.fetchLoansData('/loans/missed', params),
        this.fetchBranches(),
        this.fetchUsers()
      ]);

      // Group data by branch
      const branchMetrics = this.calculateMetricsByBranch(
        allLoans,
        disbursedLoans,
        recollections,
        missedPayments,
        branches,
        users
      );

      // Sort branches by performance score
      const sortedBranches = branchMetrics.sort((a, b) => b.performanceScore - a.performanceScore);

      // Convert to BranchPerformance format
      const bestPerforming = sortedBranches
        .slice(0, 3)
        .map(branch => this.convertToBranchPerformance(branch));

      const worstPerforming = sortedBranches
        .slice(-3)
        .reverse()
        .map(branch => this.convertToBranchPerformance(branch));

      return {
        bestPerformingBranches: bestPerforming,
        worstPerformingBranches: worstPerforming,
        allBranchMetrics: branchMetrics
      };

    } catch (error) {
      console.error('Branch performance calculation error:', error);
      
      // Return fallback data
      return {
        bestPerformingBranches: [],
        worstPerformingBranches: [],
        allBranchMetrics: []
      };
    }
  }

  /**
   * Get detailed metrics for a specific branch
   */
  async getBranchMetrics(branchName: string, params?: DashboardParams): Promise<BranchPerformanceMetrics> {
    const allMetrics = await this.calculateBranchPerformance(params);
    const branchMetrics = allMetrics.allBranchMetrics.find(
      branch => branch.branchName.toLowerCase() === branchName.toLowerCase()
    );

    if (!branchMetrics) {
      throw new Error(`Branch metrics not found for: ${branchName}`);
    }

    return branchMetrics;
  }

  /**
   * Fetch loans data from specified endpoint
   */
  private async fetchLoansData(endpoint: string, params?: DashboardParams): Promise<Loan[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.timeFilter) queryParams.append('timeFilter', params.timeFilter);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.branch) queryParams.append('branch', params.branch);
      
      // Fetch all pages to get complete data
      queryParams.append('limit', '1000'); // Large limit to get most data
      
      const url = `${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<unknown>(url);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        return response.data as Loan[];
      } else if (isSuccessResponse(response) && Array.isArray((response.data as any).data)) {
        return (response.data as any).data as Loan[];
      } else if (Array.isArray(response)) {
        return response as Loan[];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching loans data from ${endpoint}:`, error);
      return [];
    }
  }

  /**
   * Fetch branches data
   */
  private async fetchBranches(): Promise<string[]> {
    try {
      const response = await apiClient.get<unknown>('/users/branches');
      
      // Check if response is wrapped with success field
      if (isSuccessResponse(response) && Array.isArray((response.data as any).data)) {
        return (response.data as any).data as string[];
      }
      
      // Check if response.data is directly an array
      if (Array.isArray(response.data)) {
        return response.data as string[];
      }
      
      // Fallback to known branches from the image
      return [
        'Lagos Island',
        'Ibadan Branch', 
        'Lagos Central',
        'Head Office',
        'kwara',
        'lagos',
        'Lagos Main Branch'
      ];
    } catch (error) {
      console.error('Error fetching branches:', error);
      return [
        'Lagos Island',
        'Ibadan Branch', 
        'Lagos Central',
        'Head Office',
        'kwara',
        'lagos',
        'Lagos Main Branch'
      ];
    }
  }

  /**
   * Fetch users data to get branch assignments
   */
  private async fetchUsers(): Promise<Record<string, unknown>[]> {
    try {
      // Use unifiedUserService which now transforms data with role detection
      const response = await unifiedUserService.getUsers({ limit: 1000 });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Calculate metrics for each branch
   */
  private calculateMetricsByBranch(
    allLoans: Loan[],
    disbursedLoans: Loan[],
    recollections: Loan[],
    missedPayments: Loan[],
    branches: string[],
    users: Record<string, unknown>[]
  ): BranchPerformanceMetrics[] {
    
    return branches.map(branchName => {
      // Filter loans by branch (assuming loans have branch info or we can derive it from user data)
      const branchLoans = this.filterLoansByBranch(allLoans, branchName, users);
      const branchDisbursed = this.filterLoansByBranch(disbursedLoans, branchName, users);
      const branchRecollections = this.filterLoansByBranch(recollections, branchName, users);
      const branchMissed = this.filterLoansByBranch(missedPayments, branchName, users);
      
      // Get branch users
      const branchUsers = users.filter(user => 
        user.branch && (user.branch as string).toLowerCase() === branchName.toLowerCase()
      );
      
      const creditOfficers = branchUsers.filter(user => 
        (user.role as string) === 'credit_officer' || (user.role as string) === 'creditofficer'
      );
      
      const customers = branchUsers.filter(user => 
        (user.role as string) === 'customer'
      );

      // Calculate metrics
      const totalLoansProcessed = branchLoans.length;
      const totalAmountDisbursed = branchDisbursed.reduce((sum, loan) => sum + (loan.amount || 0), 0);
      const activeLoans = branchLoans.filter(loan => 
        loan.status === 'active' || loan.status === 'disbursed'
      ).length;
      const completedLoans = branchLoans.filter(loan => 
        loan.status === 'completed'
      ).length;
      const defaultedLoans = branchMissed.length;
      
      // Calculate repayment rate
      const totalRepayableLoans = activeLoans + completedLoans + defaultedLoans;
      const repaymentRate = totalRepayableLoans > 0 
        ? ((completedLoans + branchRecollections.length) / totalRepayableLoans) * 100 
        : 0;

      // Calculate performance score (weighted average of key metrics)
      const performanceScore = this.calculatePerformanceScore({
        totalAmountDisbursed,
        activeLoans,
        repaymentRate,
        defaultedLoans,
        totalLoansProcessed,
        creditOfficersCount: creditOfficers.length
      });

      return {
        branchName,
        totalLoansProcessed,
        totalAmountDisbursed,
        activeLoans,
        completedLoans,
        defaultedLoans,
        totalCustomers: customers.length,
        totalCreditOfficers: creditOfficers.length,
        repaymentRate,
        disbursementVolume: totalAmountDisbursed,
        performanceScore
      };
    });
  }

  /**
   * Filter loans by branch using user data to map customers to branches
   */
  private filterLoansByBranch(loans: Loan[], branchName: string, users: Record<string, unknown>[]): Loan[] {
    // Create a map of customer ID to branch
    const customerBranchMap = new Map<string, string>();
    users.forEach(user => {
      if (user.branch && (user.id || user.userId)) {
        customerBranchMap.set((user.id as string)?.toString() || (user.userId as string)?.toString(), user.branch as string);
      }
    });

    return loans.filter(loan => {
      const customerBranch = customerBranchMap.get(loan.customerId?.toString());
      return customerBranch && customerBranch.toLowerCase() === branchName.toLowerCase();
    });
  }

  /**
   * Calculate performance score based on multiple weighted factors
   */
  private calculatePerformanceScore(metrics: {
    totalAmountDisbursed: number;
    activeLoans: number;
    repaymentRate: number;
    defaultedLoans: number;
    totalLoansProcessed: number;
    creditOfficersCount: number;
  }): number {
    const {
      totalAmountDisbursed,
      activeLoans,
      repaymentRate,
      defaultedLoans,
      totalLoansProcessed,
      creditOfficersCount
    } = metrics;

    // Handle edge case where all values are zero
    if (totalAmountDisbursed === 0 && activeLoans === 0 && totalLoansProcessed === 0) {
      return 0;
    }

    // Normalize values to 0-100 scale for scoring
    const disbursementScore = Math.min((totalAmountDisbursed / 10000000) * 100, 100); // Max 10M
    const activeLoanScore = Math.min((activeLoans / 200) * 100, 100); // Max 200 loans
    const repaymentScore = repaymentRate; // Already 0-100
    const defaultPenalty = totalLoansProcessed > 0 
      ? Math.min((defaultedLoans / totalLoansProcessed) * 100, 100) // Penalty for defaults
      : 0;
    const productivityScore = creditOfficersCount > 0 
      ? Math.min((totalLoansProcessed / creditOfficersCount / 50) * 100, 100) // Max 50 loans per officer
      : 0;

    // Weighted performance score
    const score = (
      disbursementScore * 0.3 +      // 30% weight on disbursement volume
      activeLoanScore * 0.2 +        // 20% weight on active loans
      repaymentScore * 0.25 +        // 25% weight on repayment rate
      productivityScore * 0.15 +     // 15% weight on officer productivity
      (100 - defaultPenalty) * 0.1   // 10% penalty reduction for defaults
    );

    // Ensure we don't return NaN
    const finalScore = isNaN(score) ? 0 : score;
    return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert BranchPerformanceMetrics to BranchPerformance format
   */
  private convertToBranchPerformance(metrics: BranchPerformanceMetrics): BranchPerformance {
    return {
      name: metrics.branchName,
      activeLoans: metrics.activeLoans,
      amount: metrics.totalAmountDisbursed
    };
  }
}

export const branchPerformanceService = new BranchPerformanceAPIService();
