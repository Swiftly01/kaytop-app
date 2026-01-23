/**
 * Bulk Loans Service
 * Handles bulk loan operations and statistics to optimize performance
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '../api/config';
import { userService } from './users';
import type {
  BulkLoansResponse,
  BulkLoansFilters,
  LoanStatistics,
} from '../api/types';
import { isSuccessResponse } from '../utils/responseHelpers';

export interface BulkLoansService {
  getBulkLoans(filters?: BulkLoansFilters): Promise<BulkLoansResponse>;
  getLoanStatistics(filters?: Pick<BulkLoansFilters, 'branchId' | 'creditOfficerId' | 'dateFrom' | 'dateTo'>): Promise<LoanStatistics>;
}

class BulkLoansAPIService implements BulkLoansService {
  async getBulkLoans(filters: BulkLoansFilters = {}): Promise<BulkLoansResponse> {
    try {
      console.warn('Bulk loans endpoint not available, aggregating from customer loan endpoints');
      
      // Step 1: Get all customers (users with customer role)
      const usersResponse = await userService.getAllUsers({ 
        role: 'customer',
        page: 1,
        limit: 100 // Get first 100 customers for now
      });
      
      const customers = usersResponse.data || [];
      console.log(`Found ${customers.length} customers to fetch loans for`);
      
      // Step 2: Fetch loans for each customer
      const allLoans: Record<string, unknown>[] = [];
      
      for (const customer of customers) {
        try {
          // Use the customer loans endpoint
          const customerLoansResponse = await apiClient.get<unknown>(
            API_ENDPOINTS.LOANS.CUSTOMER_LOANS(String(customer.id))
          ) as unknown; // Cast to unknown since backend returns direct data, not wrapped ApiResponse
          
          // Handle direct response format (backend returns direct data, not wrapped)
          let customerLoans: Record<string, unknown>[] = [];
          if (Array.isArray(customerLoansResponse)) {
            customerLoans = customerLoansResponse;
          } else if (customerLoansResponse && typeof customerLoansResponse === 'object') {
            const responseObj = customerLoansResponse as Record<string, unknown>;
            // Check for various possible response structures
            if (responseObj.loans && Array.isArray(responseObj.loans)) {
              customerLoans = responseObj.loans as Record<string, unknown>[];
            } else if (responseObj.data && Array.isArray(responseObj.data)) {
              customerLoans = responseObj.data as Record<string, unknown>[];
            } else if (isSuccessResponse(customerLoansResponse) && 
                      (customerLoansResponse as any).data.data && 
                      Array.isArray((customerLoansResponse as any).data.data)) {
              customerLoans = (customerLoansResponse as any).data.data as Record<string, unknown>[];
            }
          }
          
          // Transform and add customer info to loans
          for (const loan of customerLoans) {
            const transformedLoan = {
              id: String((loan.id as string) || (loan.loanId as string) || Math.random().toString(36).substr(2, 9)),
              loanId: String((loan.id as string) || (loan.loanId as string) || '').slice(-5).toUpperCase() || 'L' + Math.random().toString(36).substr(2, 4).toUpperCase(),
              customerId: String(customer.id),
              customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || 'Unknown Customer',
              amount: parseFloat((loan.amount as string) || (loan.loanAmount as string) || '0'),
              interestRate: parseFloat((loan.interestRate as string) || (loan.rate as string) || '0'),
              status: (loan.status as string) || 'active',
              disbursementDate: (loan.disbursementDate as string) || (loan.createdAt as string) || new Date().toISOString(),
              nextRepaymentDate: (loan.nextRepaymentDate as string) || (loan.dueDate as string) || new Date().toISOString(),
              repaymentPeriod: (loan.repaymentPeriod as number) || (loan.duration as number) || 30,
              totalRepaid: parseFloat((loan.totalRepaid as string) || (loan.amountPaid as string) || '0'),
              remainingBalance: parseFloat((loan.remainingBalance as string) || (loan.outstandingAmount as string) || (loan.amount as string) || '0'),
              createdAt: (loan.createdAt as string) || new Date().toISOString(),
              updatedAt: (loan.updatedAt as string) || new Date().toISOString(),
            };
            
            allLoans.push(transformedLoan);
            
            if (transformedLoan.status === 'active' || transformedLoan.status === 'disbursed') {
              // Active loan count tracking
            } else if (transformedLoan.status === 'completed' || transformedLoan.status === 'paid') {
              // Completed loan count tracking
            }
          }
        } catch (customerError) {
          // Skip customers with no loans or API errors
          console.warn(`Failed to fetch loans for customer ${customer.id}:`, customerError);
          continue;
        }
      }
      
      // Step 3: Apply filters
      let filteredLoans = allLoans;
      
      if (filters.status && filters.status.length > 0) {
        filteredLoans = filteredLoans.filter(loan => 
          filters.status!.some(status => 
            (loan.status as string).toLowerCase().includes(status.toLowerCase())
          )
        );
      }
      
      if (filters.amountMin !== undefined) {
        filteredLoans = filteredLoans.filter(loan => (loan.amount as number) >= filters.amountMin!);
      }
      
      if (filters.amountMax !== undefined) {
        filteredLoans = filteredLoans.filter(loan => (loan.amount as number) <= filters.amountMax!);
      }
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredLoans = filteredLoans.filter(loan => 
          new Date(loan.disbursementDate as string) >= fromDate
        );
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredLoans = filteredLoans.filter(loan => 
          new Date(loan.disbursementDate as string) <= toDate
        );
      }
      
      // Step 4: Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLoans = filteredLoans.slice(startIndex, endIndex);
      
      // Step 5: Calculate statistics
      const statistics = {
        totalLoans: filteredLoans.length,
        activeLoans: filteredLoans.filter(loan => 
          (loan.status as string) === 'active' || (loan.status as string) === 'disbursed'
        ).length,
        completedLoans: filteredLoans.filter(loan => 
          (loan.status as string) === 'completed' || (loan.status as string) === 'paid'
        ).length,
        totalValue: filteredLoans.reduce((sum, loan) => sum + (loan.amount as number), 0),
        averageAmount: filteredLoans.length > 0 
          ? filteredLoans.reduce((sum, loan) => sum + (loan.amount as number), 0) / filteredLoans.length 
          : 0,
      };
      
      console.log(`Aggregated ${allLoans.length} total loans, ${filteredLoans.length} after filters, returning ${paginatedLoans.length} for page ${page}`);
      
      return {
        loans: paginatedLoans,
        statistics,
        pagination: {
          page,
          limit,
          total: filteredLoans.length,
          totalPages: Math.ceil(filteredLoans.length / limit),
        }
      };
    } catch (error) {
      console.error('Bulk loans aggregation error:', error);
      
      // Fallback to empty data with error logging
      return {
        loans: [],
        statistics: {
          totalLoans: 0,
          activeLoans: 0,
          completedLoans: 0,
          totalValue: 0,
          averageAmount: 0,
        },
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: 0,
          totalPages: 0,
        }
      };
    }
  }

  async getLoanStatistics(filters: Pick<BulkLoansFilters, 'branchId' | 'creditOfficerId' | 'dateFrom' | 'dateTo'> = {}): Promise<LoanStatistics> {
    try {
      // Since /dashboard/loan-statistics doesn't exist, calculate from bulk loans data
      console.warn('Loan statistics endpoint not available, calculating from bulk loans data');
      
      // Fetch all loans to calculate statistics
      const bulkLoansResponse = await this.getBulkLoans({
        ...filters,
        page: 1,
        limit: 1000, // Get all loans for accurate statistics
      });
      
      const allLoans = bulkLoansResponse.loans;
      
      // Calculate statistics from actual loan data
      const activeLoans = allLoans.filter(loan => 
        (loan.status as string) === 'active' || (loan.status as string) === 'disbursed'
      );
      
      const completedLoans = allLoans.filter(loan => 
        (loan.status as string) === 'completed'
      );
      
      const overdueLoans = allLoans.filter(loan => 
        (loan.status as string) === 'defaulted'
      );
      
      const totalValue = allLoans.reduce((sum, loan) => sum + (loan.amount as number), 0);
      const activeValue = activeLoans.reduce((sum, loan) => sum + (loan.amount as number), 0);
      const completedValue = completedLoans.reduce((sum, loan) => sum + (loan.amount as number), 0);
      
      const loanStats: LoanStatistics = {
        totalLoans: { 
          count: allLoans.length, 
          value: totalValue, 
          growth: 0 // Growth calculation would require historical data
        },
        activeLoans: { 
          count: activeLoans.length, 
          value: activeValue, 
          growth: 0 
        },
        completedLoans: { 
          count: completedLoans.length, 
          value: completedValue, 
          growth: 0 
        },
        overdueLoans: { 
          count: overdueLoans.length, 
          value: overdueLoans.reduce((sum, loan) => sum + (loan.amount as number), 0), 
          growth: 0 
        },
        disbursedThisMonth: { 
          count: allLoans.length, 
          value: totalValue, 
          growth: 0 
        },
        collectedThisMonth: { 
          count: completedLoans.length, 
          value: completedValue, 
          growth: 0 
        },
        averageLoanAmount: { 
          value: allLoans.length > 0 ? Math.floor(totalValue / allLoans.length) : 0, 
          growth: 0 
        },
        averageRepaymentPeriod: { 
          value: allLoans.length > 0 
            ? Math.floor(allLoans.reduce((sum, loan) => sum + ((loan.term as number) || 30), 0) / allLoans.length)
            : 30, 
          growth: 0 
        }
      };
      
      console.log('📊 Calculated loan statistics:', loanStats);
      
      return loanStats;
    } catch (error) {
      console.error('Loan statistics calculation error:', error);
      
      // Return empty statistics on error
      return {
        totalLoans: { count: 0, value: 0, growth: 0 },
        activeLoans: { count: 0, value: 0, growth: 0 },
        completedLoans: { count: 0, value: 0, growth: 0 },
        overdueLoans: { count: 0, value: 0, growth: 0 },
        disbursedThisMonth: { count: 0, value: 0, growth: 0 },
        collectedThisMonth: { count: 0, value: 0, growth: 0 },
        averageLoanAmount: { value: 0, growth: 0 },
        averageRepaymentPeriod: { value: 30, growth: 0 }
      };
    }
  }
}

// Export singleton instance
export const bulkLoansService = new BulkLoansAPIService();
