/**
 * Credit Officer Service
 * Handles credit officer specific data fetching and management
 */

import { userService } from './users';
import { loanService } from './loans';
import { savingsService } from './savings';
import type { User, Loan, Transaction } from '../api/types';

export interface CreditOfficerData {
  officer: User;
  branchCustomers: User[];
  branchLoans: Loan[];
  branchTransactions: Transaction[];
  statistics: {
    totalCustomers: number;
    activeLoans: number;
    totalLoansProcessed: number;
    totalLoanAmount: number;
    totalCollections: number;
  };
}

export interface CreditOfficerService {
  getCreditOfficerData(creditOfficerId: string): Promise<CreditOfficerData>;
  getBranchCustomers(branch: string): Promise<User[]>;
  getBranchLoans(branch: string): Promise<Loan[]>;
}

class CreditOfficerAPIService implements CreditOfficerService {
  async getCreditOfficerData(creditOfficerId: string): Promise<CreditOfficerData> {
    try {
      console.log(`[CreditOfficerService] Fetching data for credit officer: ${creditOfficerId}`);
      
      // Fetch credit officer details
      const officer = await userService.getUserById(creditOfficerId);
      console.log(`[CreditOfficerService] Officer fetched:`, { id: officer.id, role: officer.role, branch: officer.branch });
      
      // Check if user is a credit officer (handle multiple role variations)
      const userRole = officer.role?.toLowerCase() || '';
      const isCreditOfficer = userRole === 'credit_officer' || 
                             userRole === 'creditofficer' || 
                             userRole === 'credit officer' ||
                             userRole === 'co' ||
                             userRole.includes('credit');
      
      if (!isCreditOfficer) {
        console.warn(`[CreditOfficerService] User role "${officer.role}" may not be a credit officer, but proceeding...`);
      }

      // Get credit officer's branch
      const branch = officer.branch;
      console.log(`[CreditOfficerService] Officer branch: ${branch}`);
      
      if (!branch) {
        console.warn('Credit officer has no branch assigned');
      }

      // Fetch branch-specific data in parallel
      console.log(`[CreditOfficerService] Fetching branch data...`);
      const [branchCustomers, allLoans, allTransactions] = await Promise.all([
        this.getBranchCustomers(branch || ''),
        loanService.getAllLoans(),
        savingsService.getAllSavingsTransactions({ limit: 100 }) // Limit for performance
      ]);

      console.log(`[CreditOfficerService] Data fetched:`, {
        branchCustomers: branchCustomers.length,
        allLoans: allLoans.length,
        allTransactions: allTransactions.length
      });

      // Filter loans by branch customers
      const branchCustomerIds = branchCustomers.map(c => String(c.id));
      const branchLoans = allLoans.filter(loan => 
        branchCustomerIds.includes(String(loan.customerId))
      );

      console.log(`[CreditOfficerService] Filtered loans: ${branchLoans.length} out of ${allLoans.length}`);

      // For transactions, we'll use a subset since we don't have direct customer linking
      // In a real implementation, this would be filtered by savings accounts of branch customers
      const branchTransactions = allTransactions.slice(0, Math.min(50, branchCustomers.length * 2));

      // Calculate statistics
      const activeLoans = branchLoans.filter(loan => loan.status === 'active').length;
      const totalLoanAmount = branchLoans.reduce((sum, loan) => sum + loan.amount, 0);
      const totalCollections = branchTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

      const statistics = {
        totalCustomers: branchCustomers.length,
        activeLoans,
        totalLoansProcessed: branchLoans.length,
        totalLoanAmount,
        totalCollections
      };

      console.log(`[CreditOfficerService] Statistics calculated:`, statistics);

      return {
        officer,
        branchCustomers,
        branchLoans,
        branchTransactions,
        statistics
      };
    } catch (error) {
      console.error('Failed to fetch credit officer data:', error);
      throw error;
    }
  }

  async getBranchCustomers(branch: string): Promise<User[]> {
    if (!branch) {
      console.warn('[CreditOfficerService] No branch provided, returning empty array');
      return [];
    }

    try {
      console.log(`[CreditOfficerService] Fetching customers for branch: ${branch}`);
      const branchUsersResponse = await userService.getUsersByBranch(branch);
      const customers = branchUsersResponse.data.filter(user => user.role === 'customer');
      console.log(`[CreditOfficerService] Found ${customers.length} customers in branch ${branch}`);
      return customers;
    } catch (error) {
      console.error(`Failed to fetch customers for branch ${branch}:`, error);
      return [];
    }
  }

  async getBranchLoans(branch: string): Promise<Loan[]> {
    if (!branch) {
      return [];
    }

    try {
      // Get branch customers first
      const branchCustomers = await this.getBranchCustomers(branch);
      const branchCustomerIds = branchCustomers.map(c => String(c.id));

      // Get all loans and filter by branch customers
      const allLoans = await loanService.getAllLoans();
      return allLoans.filter(loan => 
        branchCustomerIds.includes(String(loan.customerId))
      );
    } catch (error) {
      console.error(`Failed to fetch loans for branch ${branch}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const creditOfficerService = new CreditOfficerAPIService();