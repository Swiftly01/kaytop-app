/**
 * System Admin Service
 * Handles system admin specific data fetching following BM dashboard patterns
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '../api/config';
import type { PaginatedResponse } from '../api/types';
import { isSuccessResponse, isFailureResponse, extractResponseData } from '../utils/responseHelpers';

export interface SystemAdminTabData {
  disbursements: DisbursementRecord[];
  're-collections': RecollectionRecord[];
  savings: SavingsRecord[];
  'missed-payments': MissedPaymentRecord[];
}

export interface DisbursementRecord {
  id: string;
  loanId: string;
  name: string;
  amount: string;
  interest: string;
  dateDisbursed: string;
  status: string;
}

export interface RecollectionRecord {
  id: string;
  loanId: string;
  name: string;
  amount: string;
  interest: string;
  dateCollected: string;
  status: string;
}

export interface SavingsRecord {
  id: string;
  accountId: string;
  name: string;
  amount: string;
  interest: string;
  dateCreated: string;
  status: string;
}

export interface MissedPaymentRecord {
  id: string;
  loanId: string;
  name: string;
  amount: string;
  dueDate: string;
  daysMissed: number;
  status: string;
}

export interface SystemAdminService {
  getDisbursements(page?: number, limit?: number): Promise<PaginatedResponse<DisbursementRecord>>;
  getRecollections(page?: number, limit?: number): Promise<PaginatedResponse<RecollectionRecord>>;
  getSavings(page?: number, limit?: number): Promise<PaginatedResponse<SavingsRecord>>;
  getMissedPayments(page?: number, limit?: number): Promise<PaginatedResponse<MissedPaymentRecord>>;
}

class SystemAdminAPIService implements SystemAdminService {
  async getDisbursements(page: number = 1, limit: number = 10): Promise<PaginatedResponse<DisbursementRecord>> {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.LOANS.DISBURSED}?page=${page}&limit=${limit}`
      );

      // Handle various response formats
      let dataArray: any[] = [];
      
      // Check if response is wrapped with success field
      if (isSuccessResponse(response)) {
        if (Array.isArray(response.data.data)) {
          dataArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          dataArray = response.data;
        }
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        dataArray = response.data;
      }
      // Check if it's a direct array response (not wrapped in response.data)
      else if (Array.isArray(response)) {
        dataArray = response;
      }

      return {
        data: dataArray.map((item: any) => this.transformDisbursementRecord(item)),
        pagination: {
          page,
          limit,
          total: dataArray.length,
          totalPages: Math.ceil(dataArray.length / limit)
        }
      };
    } catch (error) {
      console.error('Disbursements fetch error:', error);
      // Return empty data instead of throwing to prevent dashboard from breaking
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  async getRecollections(page: number = 1, limit: number = 10): Promise<PaginatedResponse<RecollectionRecord>> {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.LOANS.RECOLLECTIONS}?page=${page}&limit=${limit}`
      );

      // Handle various response formats
      let dataArray: any[] = [];
      
      // Check if response is wrapped with success field
      if (isSuccessResponse(response)) {
        if (Array.isArray(response.data.data)) {
          dataArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          dataArray = response.data;
        }
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        dataArray = response.data;
      }
      // Check if it's a direct array response (not wrapped in response.data)
      else if (Array.isArray(response)) {
        dataArray = response;
      }

      return {
        data: dataArray.map((item: any) => this.transformRecollectionRecord(item)),
        pagination: {
          page,
          limit,
          total: dataArray.length,
          totalPages: Math.ceil(dataArray.length / limit)
        }
      };
    } catch (error) {
      console.error('Recollections fetch error:', error);
      // Return empty data instead of throwing to prevent dashboard from breaking
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  async getSavings(page: number = 1, limit: number = 10): Promise<PaginatedResponse<SavingsRecord>> {
    try {
      console.log('🔍 getSavings - Starting request:', {
        endpoint: `${API_ENDPOINTS.SAVINGS.ALL_ACCOUNTS}?page=${page}&limit=${limit}`,
        page,
        limit
      });

      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.SAVINGS.ALL_ACCOUNTS}?page=${page}&limit=${limit}`
      );

      console.log('🔍 getSavings - Response received:', response);

      // Handle various response formats
      let dataArray: any[] = [];
      
      // Check if response is wrapped with success field
      if (isSuccessResponse(response)) {
        if (Array.isArray(response.data.data)) {
          dataArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          dataArray = response.data;
        }
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        dataArray = response.data;
      }
      // Check if it's a direct array response (not wrapped in response.data)
      else if (Array.isArray(response)) {
        dataArray = response;
      }

      return {
        data: dataArray.map((item: any) => this.transformSavingsRecord(item)),
        pagination: {
          page,
          limit,
          total: dataArray.length,
          totalPages: Math.ceil(dataArray.length / limit)
        }
      };
    } catch (error) {
      console.error('Savings fetch error:', error);
      // Return empty data instead of throwing to prevent dashboard from breaking
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  async getMissedPayments(page: number = 1, limit: number = 10): Promise<PaginatedResponse<MissedPaymentRecord>> {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.LOANS.MISSED}?page=${page}&limit=${limit}`
      );

      // Handle various response formats
      let dataArray: any[] = [];
      
      // Check if response is wrapped with success field
      if (isSuccessResponse(response)) {
        if (Array.isArray(response.data.data)) {
          dataArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          dataArray = response.data;
        }
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        dataArray = response.data;
      }
      // Check if it's a direct array response (not wrapped in response.data)
      else if (Array.isArray(response)) {
        dataArray = response;
      }

      return {
        data: dataArray.map((item: any) => this.transformMissedPaymentRecord(item)),
        pagination: {
          page,
          limit,
          total: dataArray.length,
          totalPages: Math.ceil(dataArray.length / limit)
        }
      };
    } catch (error) {
      console.error('Missed payments fetch error:', error);
      // Return empty data instead of throwing to prevent dashboard from breaking
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  /**
   * Transform backend disbursement data to frontend format
   */
  private transformDisbursementRecord(backendData: any): DisbursementRecord {
    return {
      id: backendData.id || backendData._id || '',
      loanId: backendData.loanId || backendData.loan_id || '',
      name: backendData.customerName || backendData.customer?.name || backendData.name || '',
      amount: this.formatCurrency(backendData.amount || backendData.loanAmount || 0),
      interest: this.formatPercentage(backendData.interestRate || backendData.interest || 0),
      dateDisbursed: this.formatDate(backendData.disbursedDate || backendData.createdAt || backendData.date),
      status: backendData.status || 'active'
    };
  }

  /**
   * Transform backend recollection data to frontend format
   */
  private transformRecollectionRecord(backendData: any): RecollectionRecord {
    return {
      id: backendData.id || backendData._id || '',
      loanId: backendData.loanId || backendData.loan_id || '',
      name: backendData.customerName || backendData.customer?.name || backendData.name || '',
      amount: this.formatCurrency(backendData.amount || backendData.collectedAmount || 0),
      interest: this.formatPercentage(backendData.interestRate || backendData.interest || 0),
      dateCollected: this.formatDate(backendData.collectedDate || backendData.createdAt || backendData.date),
      status: backendData.status || 'collected'
    };
  }

  /**
   * Transform backend savings data to frontend format
   */
  private transformSavingsRecord(backendData: any): SavingsRecord {
    return {
      id: backendData.id || backendData._id || '',
      accountId: backendData.accountId || backendData.account_id || '',
      name: backendData.customerName || backendData.customer?.name || backendData.name || '',
      amount: this.formatCurrency(backendData.amount || backendData.balance || 0),
      interest: this.formatPercentage(backendData.interestRate || backendData.interest || 0),
      dateCreated: this.formatDate(backendData.createdDate || backendData.createdAt || backendData.date),
      status: backendData.status || 'active'
    };
  }

  /**
   * Transform backend missed payment data to frontend format
   */
  private transformMissedPaymentRecord(backendData: any): MissedPaymentRecord {
    return {
      id: backendData.id || backendData._id || '',
      loanId: backendData.loanId || backendData.loan_id || '',
      name: backendData.customerName || backendData.customer?.name || backendData.name || '',
      amount: this.formatCurrency(backendData.amount || backendData.missedAmount || 0),
      dueDate: this.formatDate(backendData.dueDate || backendData.due_date),
      daysMissed: backendData.daysMissed || backendData.days_missed || 0,
      status: backendData.status || 'overdue'
    };
  }

  /**
   * Format currency values
   */
  private formatCurrency(amount: number): string {
    return `NGN${amount.toLocaleString()}`;
  }

  /**
   * Format percentage values
   */
  private formatPercentage(rate: number): string {
    return `${rate}%`;
  }

  /**
   * Format date values
   */
  private formatDate(date: string | Date): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  }
}

// Export singleton instance
export const systemAdminService = new SystemAdminAPIService();
