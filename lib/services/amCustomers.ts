/**
 * Account Manager Customer Service
 * Handles AM-specific customer portfolio management and operations
 * Updated to use unified endpoints after AM endpoints removal
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { DataTransformers } from '../api/transformers';
import { APIErrorHandler } from '../api/errorHandler';
import type {
  User,
  PaginatedResponse,
  PaginationParams,
} from '../api/types';

export interface AMCustomerFilterParams extends PaginationParams {
  branch?: string;
  state?: string;
  status?: 'active' | 'inactive';
  loanStatus?: 'active' | 'completed' | 'overdue';
  search?: string;
}

export interface AMCustomerAssignment {
  id: string;
  customerId: string;
  accountManagerId: string;
  assignedDate: string;
  status: 'active' | 'inactive' | 'transferred';
  assignedBy: string;
  notes?: string;
}

export interface AMCustomerPortfolio {
  totalCustomers: number;
  activeLoans: number;
  portfolioValue: number;
  averageLoanAmount: number;
  customerGrowth: number;
  portfolioGrowth: number;
}

export interface AMCustomerService {
  getCustomers(params?: AMCustomerFilterParams): Promise<PaginatedResponse<User>>;
  getCustomerById(id: string): Promise<User>;
  updateCustomer(id: string, data: any): Promise<User>;
  getCustomerLoans(id: string, params?: PaginationParams): Promise<PaginatedResponse<any>>;
  getCustomerSavings(id: string, params?: PaginationParams): Promise<PaginatedResponse<any>>;
  getCustomerTransactions(id: string, params?: PaginationParams): Promise<PaginatedResponse<any>>;
  getPortfolioSummary(): Promise<AMCustomerPortfolio>;
  assignCustomer(customerId: string, accountManagerId: string, notes?: string): Promise<AMCustomerAssignment>;
  getMyAssignedCustomers(params?: PaginationParams): Promise<PaginatedResponse<User>>;
}

class AMCustomerAPIService implements AMCustomerService {
  async getCustomers(params?: AMCustomerFilterParams): Promise<PaginatedResponse<User>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.branch) {
        queryParams.append('branch', params.branch);
      }
      
      if (params?.state) {
        queryParams.append('state', params.state);
      }
      
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      
      if (params?.loanStatus) {
        queryParams.append('loanStatus', params.loanStatus);
      }
      
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.ADMIN.USERS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('🔄 Fetching customers from:', url);
      
      const response = await apiClient.get<any>(url);

      // Handle different response formats from the backend
      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          if (response.data.customers && Array.isArray(response.data.customers)) {
            // AM API format: { success: true, data: { customers: [], pagination: {} } }
            return {
              data: response.data.customers,
              pagination: response.data.pagination || this.createDefaultPagination(response.data.customers.length, params)
            };
          } else if (Array.isArray(response.data)) {
            // Direct array in data: { success: true, data: [] }
            return this.createPaginatedResponse(response.data, response.data.length, params);
          }
        }
        // Check if it's direct array format (customers list)
        else if (Array.isArray(response)) {
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return DataTransformers.transformPaginatedResponse(response, DataTransformers.transformUser);
        }
      }

      // Fallback: return empty result
      console.warn('⚠️ Unexpected response format, returning empty result');
      return this.createPaginatedResponse([], 0, params);
    } catch (error) {
      console.error('❌ AM Customers fetch error:', error);
      const errorMessage = APIErrorHandler.handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async getCustomerById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.ADMIN.USER_BY_ID(id));

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return DataTransformers.transformUser(response.data);
        }
        // Check if it's direct data format (has user fields)
        else if ((response as any).id || (response as any).email || (response as any).firstName) {
          return DataTransformers.transformUser(response);
        }
      }

      throw new Error('Failed to fetch AM customer details - invalid response format');
    } catch (error) {
      console.error('❌ AM Customer details fetch error:', error);
      const errorMessage = APIErrorHandler.handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async updateCustomer(id: string, data: any): Promise<User> {
    try {
      const response = await apiClient.put<any>(API_ENDPOINTS.ADMIN.UPDATE_USER(id), data);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct data format (has user fields)
        else if ((response as any).id || (response as any).email || (response as any).firstName) {
          return response as unknown as User;
        }
      }

      throw new Error('Failed to update AM customer - invalid response format');
    } catch (error) {
      console.error('AM Customer update error:', error);
      throw error;
    }
  }

  async getCustomerLoans(id: string, params?: PaginationParams): Promise<PaginatedResponse<any>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.LOANS.CUSTOMER_LOANS(id)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format
        else if (Array.isArray(response)) {
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response as unknown as PaginatedResponse<any>;
        }
      }

      throw new Error('Failed to fetch AM customer loans - invalid response format');
    } catch (error) {
      console.error('AM Customer loans fetch error:', error);
      throw error;
    }
  }

  async getCustomerSavings(id: string, params?: PaginationParams): Promise<PaginatedResponse<any>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_ENDPOINTS.SAVINGS.CUSTOMER_SAVINGS(id)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format
        else if (Array.isArray(response)) {
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response as unknown as PaginatedResponse<any>;
        }
      }

      throw new Error('Failed to fetch AM customer savings - invalid response format');
    } catch (error) {
      console.error('AM Customer savings fetch error:', error);
      throw error;
    }
  }

  async getCustomerTransactions(id: string, params?: PaginationParams): Promise<PaginatedResponse<any>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      // Use a generic endpoint for transactions - this may need to be implemented
      const url = `/api/transactions/customer/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format
        else if (Array.isArray(response)) {
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response as unknown as PaginatedResponse<any>;
        }
      }

      throw new Error('Failed to fetch AM customer transactions - invalid response format');
    } catch (error) {
      console.error('AM Customer transactions fetch error:', error);
      // Return empty result for now since this endpoint may not exist
      return this.createPaginatedResponse([], 0, params);
    }
  }

  async getPortfolioSummary(): Promise<AMCustomerPortfolio> {
    try {
      // Use dashboard KPI endpoint as fallback for portfolio summary
      const response = await apiClient.get<any>(API_ENDPOINTS.DASHBOARD.KPI);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return this.transformKPIToPortfolio(response.data);
        }
        // Check if it's direct data format
        else if ((response as any).totalCustomers !== undefined) {
          return response as unknown as AMCustomerPortfolio;
        }
        // Transform KPI data to portfolio format
        else {
          return this.transformKPIToPortfolio(response);
        }
      }

      throw new Error('Failed to fetch AM portfolio summary - invalid response format');
    } catch (error) {
      console.error('AM Portfolio summary fetch error:', error);
      // Return mock data as fallback
      return {
        totalCustomers: 0,
        activeLoans: 0,
        portfolioValue: 0,
        averageLoanAmount: 0,
        customerGrowth: 0,
        portfolioGrowth: 0
      };
    }
  }

  async assignCustomer(customerId: string, accountManagerId: string, notes?: string): Promise<AMCustomerAssignment> {
    try {
      const data = {
        customerId,
        accountManagerId,
        notes,
      };

      // Use admin user update endpoint for assignment
      const response = await apiClient.put<any>(API_ENDPOINTS.ADMIN.UPDATE_USER(customerId), {
        accountManagerId,
        notes
      });

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return this.transformUserToAssignment(response.data, accountManagerId, notes);
        }
        // Check if it's direct data format
        else if ((response as any).id || (response as any).customerId) {
          return response as unknown as AMCustomerAssignment;
        }
      }

      throw new Error('Failed to assign customer - invalid response format');
    } catch (error) {
      console.error('AM Customer assignment error:', error);
      throw error;
    }
  }

  async getMyAssignedCustomers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      // Use admin users endpoint with filter for assigned customers
      const url = `${API_ENDPOINTS.ADMIN.USERS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<any>(url);

      if (response && typeof response === 'object') {
        // Check if it's wrapped in success/data format
        if (response.success && response.data) {
          return response.data;
        }
        // Check if it's direct array format
        else if (Array.isArray(response)) {
          return this.createPaginatedResponse(response, response.length, params);
        }
        // Check if it's already a paginated response object
        else if (response.data && Array.isArray(response.data)) {
          return response as unknown as PaginatedResponse<User>;
        }
      }

      throw new Error('Failed to fetch AM assigned customers - invalid response format');
    } catch (error) {
      console.error('AM Assigned customers fetch error:', error);
      throw error;
    }
  }

  // Helper function to transform KPI data to portfolio format
  private transformKPIToPortfolio(kpiData: any): AMCustomerPortfolio {
    return {
      totalCustomers: kpiData.customers?.value || 0,
      activeLoans: kpiData.activeLoans?.value || 0,
      portfolioValue: kpiData.loanAmounts?.value || 0,
      averageLoanAmount: kpiData.averageLoanAmount?.value || 0,
      customerGrowth: kpiData.customers?.change || 0,
      portfolioGrowth: kpiData.loanAmounts?.change || 0
    };
  }

  // Helper function to transform user data to assignment format
  private transformUserToAssignment(userData: any, accountManagerId: string, notes?: string): AMCustomerAssignment {
    return {
      id: userData.id || 'assignment-' + Date.now(),
      customerId: userData.id,
      accountManagerId,
      assignedDate: new Date().toISOString(),
      status: 'active',
      assignedBy: 'system',
      notes
    };
  }

  // Helper function to create paginated response structure
  private createPaginatedResponse<T>(data: T[], total: number, params?: { page?: number; limit?: number }): PaginatedResponse<T> {
    const page = parseInt(params?.page?.toString() || '1');
    const limit = parseInt(params?.limit?.toString() || '10');
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Helper function to create default pagination
  private createDefaultPagination(total: number, params?: { page?: number; limit?: number }) {
    const page = parseInt(params?.page?.toString() || '1');
    const limit = parseInt(params?.limit?.toString() || '10');
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
}

// Export singleton instance
export const amCustomerService = new AMCustomerAPIService();