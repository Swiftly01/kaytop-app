/**
 * Dashboard Tabs Service
 * Handles fetching data for different dashboard tabs (disbursements, re-collections, savings, missed-payments)
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '../api/config';
import { bulkLoansService } from './bulkLoans';
import { userService } from './users';
import type {
  BulkLoansFilters,
  UserFilterParams,
  PaginationParams,
} from '../api/types';

export interface TabDataItem {
  id: string;
  loanId?: string;
  name: string;
  status?: string;
  interest?: string;
  amount: string;
  dateDisbursed: string;
  type?: string;
  customerId?: string;
  customerName?: string;
}

export interface TabDataResponse {
  data: TabDataItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardTabsService {
  getDisbursements(params?: PaginationParams & { search?: string }): Promise<TabDataResponse>;
  getReCollections(params?: PaginationParams & { search?: string }): Promise<TabDataResponse>;
  getSavings(params?: PaginationParams & { search?: string }): Promise<TabDataResponse>;
  getMissedPayments(params?: PaginationParams & { search?: string }): Promise<TabDataResponse>;
}

class DashboardTabsAPIService implements DashboardTabsService {
  
  /**
   * Get customer display name - in a real implementation, this would fetch from customer service
   */
  private getCustomerDisplayName(customerId: string | number): string {
    // For now, return a formatted customer ID
    // In a real implementation, this would fetch customer details from the unified user service
    return `Customer ${customerId}`;
  }

  /**
   * Get savings balance - in a real implementation, this would fetch from savings service
   */
  private getSavingsBalance(): string {
    // For now, return a placeholder
    // In a real implementation, this would fetch actual balance from unified savings service
    return `₦${(Math.random() * 100000).toFixed(0)}`;
  }
  
  /**
   * Get disbursements data (active loans)
   */
  async getDisbursements(params: PaginationParams & { search?: string } = {}): Promise<TabDataResponse> {
    try {
      const filters: BulkLoansFilters = {
        page: params.page || 1,
        limit: params.limit || 10,
        status: ['active', 'disbursed'], // Get active and disbursed loans
      };

      const response = await bulkLoansService.getBulkLoans(filters);
      
      const transformedData: TabDataItem[] = response.loans.map(loan => ({
        id: String(loan.id),
        loanId: String(loan.id),
        name: this.getCustomerDisplayName(loan.customerId),
        status: loan.status,
        interest: `${loan.interestRate?.toFixed(2) || '0.00'}%`,
        amount: `₦${loan.amount?.toLocaleString('en-NG') || '0'}`,
        dateDisbursed: loan.disbursementDate || loan.createdAt || new Date().toISOString().split('T')[0],
        customerId: String(loan.customerId),
        customerName: this.getCustomerDisplayName(loan.customerId),
      }));

      return {
        data: transformedData,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('Error fetching disbursements:', error);
      // Return empty data on error
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    }
  }

  /**
   * Get re-collections data (loans with payments due)
   */
  async getReCollections(params: PaginationParams & { search?: string } = {}): Promise<TabDataResponse> {
    try {
      const filters: BulkLoansFilters = {
        page: params.page || 1,
        limit: params.limit || 10,
        status: ['active'], // Get active loans that need collections
      };

      const response = await bulkLoansService.getBulkLoans(filters);
      
      const transformedData: TabDataItem[] = response.loans.map(loan => ({
        id: String(loan.id),
        loanId: String(loan.id),
        name: this.getCustomerDisplayName(loan.customerId),
        status: loan.status,
        amount: `₦${loan.amount?.toLocaleString('en-NG') || '0'}`,
        dateDisbursed: loan.disbursementDate || loan.createdAt || new Date().toISOString().split('T')[0],
        customerId: String(loan.customerId),
        customerName: this.getCustomerDisplayName(loan.customerId),
      }));

      return {
        data: transformedData,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('Error fetching re-collections:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    }
  }

  /**
   * Get savings data (customers with savings accounts)
   */
  async getSavings(params: PaginationParams & { search?: string } = {}): Promise<TabDataResponse> {
    try {
      const userParams: UserFilterParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        role: 'customer',
      };

      const response = await userService.getAllUsers(userParams);
      
      // Transform user data to savings format
      const transformedData: TabDataItem[] = response.data.map(user => ({
        id: String(user.id),
        loanId: String(user.id), // Use user ID as identifier
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown Customer',
        type: 'Savings',
        amount: this.getSavingsBalance(),
        dateDisbursed: user.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        customerId: String(user.id),
        customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      }));

      return {
        data: transformedData,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('Error fetching savings:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    }
  }

  /**
   * Get missed payments data (overdue loans)
   */
  async getMissedPayments(params: PaginationParams & { search?: string } = {}): Promise<TabDataResponse> {
    try {
      const filters: BulkLoansFilters = {
        page: params.page || 1,
        limit: params.limit || 10,
        status: ['overdue', 'defaulted'], // Get overdue and defaulted loans
      };

      const response = await bulkLoansService.getBulkLoans(filters);
      
      const transformedData: TabDataItem[] = response.loans.map(loan => ({
        id: String(loan.id),
        loanId: String(loan.id),
        name: this.getCustomerDisplayName(loan.customerId),
        status: loan.status,
        interest: `${loan.interestRate?.toFixed(2) || '0.00'}%`,
        amount: `₦${loan.amount?.toLocaleString('en-NG') || '0'}`,
        dateDisbursed: loan.disbursementDate || loan.createdAt || new Date().toISOString().split('T')[0],
        customerId: String(loan.customerId),
        customerName: this.getCustomerDisplayName(loan.customerId),
      }));

      return {
        data: transformedData,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('Error fetching missed payments:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    }
  }
}

// Export singleton instance
export const dashboardTabsService = new DashboardTabsAPIService();
