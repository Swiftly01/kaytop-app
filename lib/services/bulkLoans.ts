/**
 * Bulk Loans Service
 * Handles bulk loan operations and statistics to optimize performance
 */

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { userService } from './users';
import type {
  BulkLoansResponse,
  BulkLoansFilters,
  LoanStatistics,
  User,
} from '../api/types';

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
      const allLoans: any[] = [];
      let totalValue = 0;
      let activeCount = 0;
      let completedCount = 0;
      
      for (const customer of customers) {
        try {
          // Use the customer loans endpoint
          const customerLoansResponse = await apiClient.get<any>(
            API_ENDPOINTS.LOANS.CUSTOMER_LOANS(String(customer.id))
          ) as any; // Cast to any since backend returns direct data, not wrapped ApiResponse
          
          // Handle direct response format (backend returns direct data, not wrapped)
          let customerLoans: any[] = [];
          if (Array.isArray(customerLoansResponse)) {
            customerLoans = customerLoansResponse;
          } else if (customerLoansResponse && typeof customerLoansResponse === 'object') {
            // Check for various possible response structures
            if (customerLoansResponse.loans && Array.isArray(customerLoansResponse.loans)) {
              customerLoans = customerLoansResponse.loans;
            } else if (customerLoansResponse.data && Array.isArray(customerLoansResponse.data)) {
              customerLoans = customerLoansResponse.data;
            } else if (customerLoansResponse.success && customerLoansResponse.data && Array.isArray(customerLoansResponse.data)) {
              customerLoans = customerLoansResponse.data;
            }
          }
          
          // Transform and add customer info to loans
          for (const loan of customerLoans) {
            const transformedLoan = {
              id: String(loan.id || loan.loanId || Math.random().toString(36).substr(2, 9)),
              loanId: String(loan.id || loan.loanId || '').slice(-5).toUpperCase() || 'L' + Math.random().toString(36).substr(2, 4).toUpperCase(),
              customerId: String(customer.id),
              customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || 'Unknown Customer',
              amount: parseFloat(loan.amount || loan.loanAmount || 0),
              interestRate: parseFloat(loan.interestRate || loan.rate || 0),
              status: loan.status || 'active',
              disbursementDate: loan.disbursementDate || loan.createdAt || new Date().toISOString(),
              nextRepaymentDate: loan.nextRepaymentDate || loan.dueDate || new Date().toISOString(),
              repaymentPeriod: loan.repaymentPeriod || loan.duration || 30,
              totalRepaid: parseFloat(loan.totalRepaid || loan.amountPaid || 0),
              remainingBalance: parseFloat(loan.remainingBalance || loan.outstandingAmount || loan.amount || 0),
              createdAt: loan.createdAt || new Date().toISOString(),
              updatedAt: loan.updatedAt || new Date().toISOString(),
            };
            
            allLoans.push(transformedLoan);
            totalValue += transformedLoan.amount;
            
            if (transformedLoan.status === 'active' || transformedLoan.status === 'disbursed') {
              activeCount++;
            } else if (transformedLoan.status === 'completed' || transformedLoan.status === 'paid') {
              completedCount++;
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
            loan.status.toLowerCase().includes(status.toLowerCase())
          )
        );
      }
      
      if (filters.amountMin !== undefined) {
        filteredLoans = filteredLoans.filter(loan => loan.amount >= filters.amountMin!);
      }
      
      if (filters.amountMax !== undefined) {
        filteredLoans = filteredLoans.filter(loan => loan.amount <= filters.amountMax!);
      }
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredLoans = filteredLoans.filter(loan => 
          new Date(loan.disbursementDate) >= fromDate
        );
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredLoans = filteredLoans.filter(loan => 
          new Date(loan.disbursementDate) <= toDate
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
          loan.status === 'active' || loan.status === 'disbursed'
        ).length,
        completedLoans: filteredLoans.filter(loan => 
          loan.status === 'completed' || loan.status === 'paid'
        ).length,
        totalValue: filteredLoans.reduce((sum, loan) => sum + loan.amount, 0),
        averageAmount: filteredLoans.length > 0 
          ? filteredLoans.reduce((sum, loan) => sum + loan.amount, 0) / filteredLoans.length 
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
      const params = new URLSearchParams();
      
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.creditOfficerId) params.append('creditOfficerId', filters.creditOfficerId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      // Since /dashboard/loan-statistics doesn't exist, use the working KPI endpoint
      console.warn('Loan statistics endpoint not available, using KPI endpoint');
      
      const response = await apiClient.get<any>(API_ENDPOINTS.DASHBOARD.KPI);

      // Transform KPI data to LoanStatistics format
      if (response && typeof response === 'object') {
        // Handle direct response format (not wrapped)
        const kpiData = response as any;
        
        // Create loan statistics from KPI data
        const loanStats: LoanStatistics = {
          totalLoans: { 
            count: kpiData.totalLoans || 0, 
            value: kpiData.loanAmounts?.value || 0, 
            growth: kpiData.totalLoans?.change || 0 
          },
          activeLoans: { 
            count: kpiData.activeLoans || 0, 
            value: kpiData.loanAmounts?.value || 0, 
            growth: kpiData.activeLoans?.change || 0 
          },
          completedLoans: { 
            count: 0, 
            value: 0, 
            growth: 0 
          },
          overdueLoans: { 
            count: 0, 
            value: 0, 
            growth: 0 
          },
          disbursedThisMonth: { 
            count: kpiData.loansProcessed || 0, 
            value: kpiData.loanAmounts?.value || 0, 
            growth: kpiData.loansProcessed?.change || 0 
          },
          collectedThisMonth: { 
            count: 0, 
            value: 0, 
            growth: 0 
          },
          averageLoanAmount: { 
            value: kpiData.loanAmounts?.value ? Math.floor(kpiData.loanAmounts.value / Math.max(kpiData.totalLoans || 1, 1)) : 0, 
            growth: 0 
          },
          averageRepaymentPeriod: { 
            value: 30, 
            growth: 0 
          }
        };
        
        return loanStats;
      }

      throw new Error('Failed to fetch loan statistics - invalid response format');
    } catch (error) {
      console.error('Loan statistics fetch error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bulkLoansService = new BulkLoansAPIService();