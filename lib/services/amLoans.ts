/**
 * Account Manager Loans Service
 * Handles loan-related operations for Account Managers
 */

import { unifiedLoanService } from './unifiedLoan';
import type { Loan, PaginatedResponse } from '../api/types';

export interface AMLoanFilters {
  page?: number;
  limit?: number;
}

class AMLoansService {
  /**
   * Get all loans for Account Manager view
   */
  async getAllLoans(params?: AMLoanFilters): Promise<PaginatedResponse<Loan>> {
    const page = parseInt(params?.page?.toString() || '1');
    const limit = parseInt(params?.limit?.toString() || '10');

    return await unifiedLoanService.getLoans({ page, limit });
  }

  /**
   * Helper function to create default pagination
   */
  private createDefaultPagination(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

// Export singleton instance
export const amLoansService = new AMLoansService();