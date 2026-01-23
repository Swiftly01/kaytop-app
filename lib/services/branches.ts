/**
 * Branch Management Service
 * Handles branch CRUD operations, statistics, and branch-specific data
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '../api/config';
import { isSuccessResponse, isFailureResponse } from '../utils/responseHelpers';
import type {
  PaginatedResponse,
  PaginationParams,
} from '../api/types';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  state: string;
  region: string;
  manager?: string;
  managerId?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  dateCreated: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchStatistics {
  totalCreditOfficers: number;
  totalCustomers: number;
  activeLoans: number;
  totalDisbursed: number;
  creditOfficersGrowth: number;
  customersGrowth: number;
  activeLoansGrowth: number;
  totalDisbursedGrowth: number;
}

export interface BranchDetails extends Branch {
  statistics: BranchStatistics;
}

export interface CreateBranchData {
  name: string;
  code: string;
  address: string;
  state: string;
  region: string;
  managerId?: string;
  phone?: string;
  email?: string;
}

export interface UpdateBranchData {
  name?: string;
  code?: string;
  address?: string;
  state?: string;
  region?: string;
  managerId?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

export interface BranchService {
  getAllBranches(params?: PaginationParams): Promise<PaginatedResponse<Branch>>;
  getBranchById(id: string): Promise<BranchDetails>;
  createBranch(data: CreateBranchData): Promise<Branch>;
  updateBranch(id: string, data: UpdateBranchData): Promise<Branch>;
  deleteBranch(id: string): Promise<void>;
  getBranchStatistics(id: string): Promise<BranchStatistics>;
  getBranchesByState(state: string, params?: PaginationParams): Promise<PaginatedResponse<Branch>>;
  getBranchesByRegion(region: string, params?: PaginationParams): Promise<PaginatedResponse<Branch>>;
}

class BranchAPIService implements BranchService {
  async getAllBranches(params?: PaginationParams): Promise<PaginatedResponse<Branch>> {
    try {
      // Use the working /users/branches endpoint to get branch names
      const branchesResponse = await apiClient.get<any>(API_ENDPOINTS.USERS.BRANCHES);
      
      console.log('🔍 Branches API Response:', branchesResponse);
      console.log('🔍 Response data type:', typeof branchesResponse.data);
      console.log('🔍 Is array?:', Array.isArray(branchesResponse.data));
      
      // Handle different response formats
      let branchNames: string[] = [];
      
      if (isSuccessResponse(branchesResponse)) {
        // Wrapped response: { success: true, data: [...] }
        branchNames = branchesResponse.data.data || branchesResponse.data;
      } else if (Array.isArray(branchesResponse.data)) {
        // Direct array response
        branchNames = branchesResponse.data;
      } else if (Array.isArray(branchesResponse)) {
        // Response is the array itself
        branchNames = branchesResponse as unknown as string[];
      } else {
        console.error('❌ Unexpected response format:', branchesResponse);
        throw new Error('Unexpected response format from branches endpoint');
      }
      
      console.log('✅ Branch names extracted:', branchNames);
      
      if (branchNames.length > 0) {
        // Get users for each branch to build complete branch data
        const branchPromises = branchNames.map(async (branchName, index) => {
          try {
            // Get users for this branch to calculate statistics
            const { userService } = await import('./users');
            const branchUsers = await userService.getUsersByBranch(branchName, { page: 1, limit: 1000 });
            
            const usersData = branchUsers?.data || [];
            
            // Create branch ID from name (consistent with frontend routing)
            const branchId = branchName.toLowerCase().replace(/\s+/g, '-');
            
            // Get the first user's creation date as branch creation date, or use current date
            const firstUser = usersData[0];
            const dateCreated = firstUser?.createdAt || new Date().toISOString();
            
            return {
              id: branchId,
              name: branchName,
              code: `BR${(index + 1).toString().padStart(3, '0')}`,
              address: 'Address not available', // Backend doesn't provide address data
              state: firstUser?.state || 'Lagos', // Use first user's state or default
              region: firstUser?.state || 'Lagos State',
              status: 'active' as const,
              dateCreated,
              createdAt: dateCreated,
              updatedAt: new Date().toISOString(),
            } as Branch;
          } catch (error) {
            console.warn(`Failed to get users for branch ${branchName}:`, error);
            // Return basic branch info even if user fetch fails
            const branchId = branchName.toLowerCase().replace(/\s+/g, '-');
            return {
              id: branchId,
              name: branchName,
              code: `BR${(index + 1).toString().padStart(3, '0')}`,
              address: 'Address not available',
              state: 'Lagos',
              region: 'Lagos State',
              status: 'active' as const,
              dateCreated: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as Branch;
          }
        });

        const branches = await Promise.all(branchPromises);

        return {
          data: branches,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: branches.length,
            totalPages: Math.ceil(branches.length / (params?.limit || 10))
          }
        };
      }

      // If no branches found, return empty result
      console.warn('⚠️ No branches found in response');
      return {
        data: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Branches fetch error:', error);
      throw error;
    }
  }

  async getBranchById(id: string): Promise<BranchDetails> {
    try {
      // Convert branch ID back to branch name for user lookup
      let branchName = id;
      
      if (id.includes('-')) {
        // Convert kebab-case back to proper name
        branchName = id.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      
      // Get users by branch to calculate real statistics
      const { userService } = await import('./users');
      const branchUsers = await userService.getUsersByBranch(branchName, { page: 1, limit: 1000 });
      
      // Ensure branchUsers.data exists and is an array before filtering
      const usersData = branchUsers?.data || [];
      const creditOfficers = usersData.filter(user => user.role === 'credit_officer');
      const customers = usersData.filter(user => user.role === 'customer');
      
      // Get first user for branch metadata
      const firstUser = usersData[0];
      const dateCreated = firstUser?.createdAt || new Date().toISOString();
      
      // Calculate real statistics from actual user data
      const totalCreditOfficers = creditOfficers.length;
      const totalCustomers = customers.length;
      
      // Get dashboard KPIs for growth calculations
      const growthMetrics = {
        creditOfficersGrowth: 0,
        customersGrowth: 0,
        activeLoansGrowth: 0,
        totalDisbursedGrowth: 0,
      };
      
      try {
        const { dashboardService } = await import('./dashboard');
        const dashboardData = await dashboardService.getKPIs();
        
        // Extract growth percentages from dashboard data
        if (dashboardData.creditOfficers?.change) {
          growthMetrics.creditOfficersGrowth = dashboardData.creditOfficers.change;
        }
        if (dashboardData.customers?.change) {
          growthMetrics.customersGrowth = dashboardData.customers.change;
        }
        if (dashboardData.activeLoans?.change) {
          growthMetrics.activeLoansGrowth = dashboardData.activeLoans.change;
        }
        if (dashboardData.loanAmounts?.change) {
          growthMetrics.totalDisbursedGrowth = dashboardData.loanAmounts.change;
        }
      } catch (error) {
        console.warn('Could not fetch dashboard KPIs for growth metrics:', error);
      }
      
      // Calculate active loans and disbursed amounts from actual loan data
      let activeLoans = 0;
      let totalDisbursed = 0;
      
      try {
        // Get all loans from the backend
        const loansResponse = await apiClient.get<any>(API_ENDPOINTS.LOANS.ALL);
        
        let allLoans = [];
        if (isSuccessResponse(loansResponse)) {
          allLoans = Array.isArray(loansResponse.data) ? loansResponse.data : [];
        } else if (Array.isArray(loansResponse)) {
          allLoans = loansResponse;
        }
        
        // Get customer IDs from this branch
        const branchCustomerIds = customers.map(customer => customer.id?.toString());
        
        // Filter loans for customers in this branch
        const branchLoans = allLoans.filter(loan => 
          branchCustomerIds.includes(loan.customerId?.toString()) ||
          branchCustomerIds.includes(loan.userId?.toString())
        );
        
        // Count active loans (approved, disbursed, or active status)
        activeLoans = branchLoans.filter(loan => 
          loan.status === 'approved' || 
          loan.status === 'disbursed' || 
          loan.status === 'active'
        ).length;
        
        // Calculate total disbursed amount
        totalDisbursed = branchLoans
          .filter(loan => loan.status === 'disbursed' || loan.status === 'active')
          .reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0);
          
      } catch (loanError) {
        console.warn('Could not fetch loan data for branch statistics:', loanError);
        // If loan service fails, leave as 0 instead of estimating
        activeLoans = 0;
        totalDisbursed = 0;
      }
      
      const branchDetails: BranchDetails = {
        id,
        name: branchName,
        code: `BR${id.toString().padStart(3, '0')}`,
        address: 'Address not available', // User interface doesn't have address property
        state: firstUser?.state || 'Lagos',
        region: firstUser?.state || 'Lagos State',
        status: 'active',
        dateCreated,
        createdAt: dateCreated,
        updatedAt: new Date().toISOString(),
        statistics: {
          totalCreditOfficers,
          totalCustomers,
          activeLoans,
          totalDisbursed,
          ...growthMetrics,
        }
      };

      return branchDetails;
    } catch (error) {
      console.error('Branch details fetch error:', error);
      throw error;
    }
  }

  async createBranch(data: CreateBranchData): Promise<Branch> {
    try {
      const response = await apiClient.post<Branch>('/admin/branches', data);

      if (isSuccessResponse(response)) {
        return response.data;
      }

      throw new Error((response.data as { message?: string }).message || 'Failed to create branch');
    } catch (error) {
      console.error('Branch creation error:', error);
      throw error;
    }
  }

  async updateBranch(id: string, data: UpdateBranchData): Promise<Branch> {
    try {
      const response = await apiClient.patch<Branch>(`/admin/branches/${id}`, data);

      if (isSuccessResponse(response)) {
        return response.data;
      }

      throw new Error((response.data as { message?: string }).message || 'Failed to update branch');
    } catch (error) {
      console.error('Branch update error:', error);
      throw error;
    }
  }

  async deleteBranch(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/admin/branches/${id}`);

      if (isFailureResponse(response)) {
        throw new Error((response.data as { message?: string }).message || 'Failed to delete branch');
      }
    } catch (error) {
      console.error('Branch deletion error:', error);
      throw error;
    }
  }

  async getBranchStatistics(id: string): Promise<BranchStatistics> {
    try {
      const response = await apiClient.get<BranchStatistics>(`/admin/branches/${id}/statistics`);

      if (isSuccessResponse(response)) {
        return response.data;
      }

      throw new Error((response.data as { message?: string }).message || 'Failed to fetch branch statistics');
    } catch (error) {
      console.error('Branch statistics fetch error:', error);
      throw error;
    }
  }

  async getBranchesByState(state: string, params?: PaginationParams): Promise<PaginatedResponse<Branch>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `/admin/branches/state/${state}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<PaginatedResponse<Branch>>(url);

      if (isSuccessResponse(response)) {
        return response.data;
      }

      throw new Error((response.data as { message?: string }).message || 'Failed to fetch branches by state');
    } catch (error) {
      console.error('Branches by state fetch error:', error);
      throw error;
    }
  }

  async getBranchesByRegion(region: string, params?: PaginationParams): Promise<PaginatedResponse<Branch>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `/admin/branches/region/${region}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<PaginatedResponse<Branch>>(url);

      if (isSuccessResponse(response)) {
        return response.data;
      }

      throw new Error((response.data as { message?: string }).message || 'Failed to fetch branches by region');
    } catch (error) {
      console.error('Branches by region fetch error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const branchService = new BranchAPIService();
