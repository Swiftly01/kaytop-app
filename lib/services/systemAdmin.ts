/**
 * System Admin Service
 * Handles system admin specific data fetching following BM dashboard patterns
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '../api/config';
import type { PaginatedResponse } from '../api/types';
import { isSuccessResponse } from '../utils/responseHelpers';

// Backend data interfaces for type safety
interface BackendDisbursementData {
  id?: string;
  _id?: string;
  loanId?: string;
  name?: string;
  amount?: string | number;
  interest?: string | number;
  dateDisbursed?: string;
  status?: string;
  [key: string]: unknown;
}

interface BackendRecollectionData {
  id?: string;
  _id?: string;
  loanId?: string;
  name?: string;
  amount?: string | number;
  dateCollected?: string;
  status?: string;
  [key: string]: unknown;
}

interface BackendSavingsData {
  id?: string;
  _id?: string;
  customerId?: string;
  name?: string;
  amount?: string | number;
  dateSaved?: string;
  status?: string;
  [key: string]: unknown;
}

interface BackendMissedPaymentData {
  id?: string;
  _id?: string;
  loanId?: string;
  name?: string;
  amount?: string | number;
  dueDate?: string;
  daysMissed?: string | number;
  [key: string]: unknown;
}

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
  getDisbursements(page?: number, limit?: number, search?: string): Promise<PaginatedResponse<DisbursementRecord>>;
  getRecollections(page?: number, limit?: number, search?: string): Promise<PaginatedResponse<RecollectionRecord>>;
  getSavings(page?: number, limit?: number, search?: string): Promise<PaginatedResponse<SavingsRecord>>;
  getMissedPayments(page?: number, limit?: number, search?: string): Promise<PaginatedResponse<MissedPaymentRecord>>;
}

class SystemAdminAPIService implements SystemAdminService {
  async getDisbursements(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<DisbursementRecord>> {
    try {
      let url = `${API_ENDPOINTS.LOANS.DISBURSED}?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiClient.get<any>(url);

      // Backend now handles pagination, expect response with data and pagination
      if (response?.data?.data && response?.data?.pagination) {
        return {
          data: response.data.data.map((item: BackendDisbursementData) => this.transformDisbursementRecord(item)),
          pagination: response.data.pagination
        };
      }

      // Handle various response formats (legacy support)
      let dataArray: BackendDisbursementData[] = [];

      // Check if response is wrapped with success field
      if (isSuccessResponse(response)) {
        if (Array.isArray(response.data.data)) {
          dataArray = response.data.data as BackendDisbursementData[];
        } else if (Array.isArray(response.data)) {
          dataArray = response.data as BackendDisbursementData[];
        }
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        dataArray = response.data as BackendDisbursementData[];
      }
      // Check if it's a direct array response (not wrapped in response.data)
      else if (Array.isArray(response)) {
        dataArray = response;
      }

      return {
        data: dataArray.map((item: BackendDisbursementData) => this.transformDisbursementRecord(item)),
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

  async getRecollections(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<RecollectionRecord>> {
    try {
      let url = `${API_ENDPOINTS.LOANS.RECOLLECTIONS}?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiClient.get<any>(url);

      // Backend now handles pagination, expect response with data and pagination
      if (response?.data?.data && response?.data?.pagination) {
        return {
          data: response.data.data.map((item: BackendRecollectionData) => this.transformRecollectionRecord(item)),
          pagination: response.data.pagination
        };
      }
      // ... legacy handling ...
      let dataArray: BackendRecollectionData[] = [];
      // Check if response is wrapped with success field
      if (isSuccessResponse(response)) {
        if (Array.isArray(response.data.data)) {
          dataArray = response.data.data as BackendRecollectionData[];
        } else if (Array.isArray(response.data)) {
          dataArray = response.data as BackendRecollectionData[];
        }
      }
      // ... other checks ...
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        dataArray = response.data as BackendRecollectionData[];
      }
      // Check if it's a direct array response (not wrapped in response.data)
      else if (Array.isArray(response)) {
        dataArray = response;
      }

      return {
        data: dataArray.map((item: BackendRecollectionData) => this.transformRecollectionRecord(item)),
        pagination: {
          page,
          limit,
          total: dataArray.length,
          totalPages: Math.ceil(dataArray.length / limit)
        }
      };
    } catch (error) {
      // ... error handling ...
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
  }

  async getSavings(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<SavingsRecord>> {
    try {
      let url = `${API_ENDPOINTS.SAVINGS.ALL_ACCOUNTS}?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      console.log('🔍 getSavings - Starting request:', { endpoint: url, page, limit, search });

      const response = await apiClient.get<any>(url);

      // ... rest of implementation ...
      console.log('🔍 getSavings - Response received:', response);

      // Backend now handles pagination, expect response with data and pagination
      if (response?.data?.data && response?.data?.pagination) {
        return {
          data: response.data.data.map((item: BackendSavingsData) => this.transformSavingsRecord(item)),
          pagination: response.data.pagination
        };
      }

      // Handle various response formats (legacy support)
      let dataArray: BackendSavingsData[] = [];

      // Check if response is wrapped with success field
      if (isSuccessResponse(response)) {
        if (Array.isArray(response.data.data)) {
          dataArray = response.data.data as BackendSavingsData[];
        } else if (Array.isArray(response.data)) {
          dataArray = response.data as BackendSavingsData[];
        }
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        dataArray = response.data as BackendSavingsData[];
      }
      // Check if it's a direct array response (not wrapped in response.data)
      else if (Array.isArray(response)) {
        dataArray = response;
      }

      return {
        data: dataArray.map((item: BackendSavingsData) => this.transformSavingsRecord(item)),
        pagination: {
          page,
          limit,
          total: dataArray.length,
          totalPages: Math.ceil(dataArray.length / limit)
        }
      };
    } catch (error) {
      // ...
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
  }

  async getMissedPayments(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<MissedPaymentRecord>> {
    try {
      let url = `${API_ENDPOINTS.LOANS.MISSED}?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      console.log('🔍 getMissedPayments - Starting request:', { endpoint: url, page, limit });

      const response = await apiClient.get<any>(url);

      console.log('🔍 getMissedPayments - Response received:', response);
      console.log('🔍 getMissedPayments - Response data structure:', {
        hasData: !!response?.data,
        dataType: Array.isArray(response?.data) ? 'array' : typeof response?.data,
        dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A',
        hasPagination: !!response?.data?.pagination,
        sampleItem: response?.data?.data?.[0] || response?.data?.[0] || 'No items'
      });

      // Backend now handles pagination, expect response with data and pagination
      if (response?.data?.data && response?.data?.pagination) {
        console.log('🔍 getMissedPayments - Using paginated response format');
        const transformedData = response.data.data.map((item: BackendMissedPaymentData, index: number) => {
          console.log(`🔍 getMissedPayments - Transforming item ${index}:`, item);
          const transformed = this.transformMissedPaymentRecord(item);
          console.log(`🔍 getMissedPayments - Transformed item ${index}:`, transformed);
          return transformed;
        });
        return {
          data: transformedData,
          pagination: response.data.pagination
        };
      }

      // Handle various response formats (legacy support)
      let dataArray: BackendMissedPaymentData[] = [];

      // Check if response is wrapped with success field
      if (isSuccessResponse(response)) {
        if (Array.isArray(response.data.data)) {
          dataArray = response.data.data as BackendMissedPaymentData[];
          console.log('🔍 getMissedPayments - Using response.data.data format');
        } else if (Array.isArray(response.data)) {
          dataArray = response.data as BackendMissedPaymentData[];
          console.log('🔍 getMissedPayments - Using response.data format');
        }
      }
      // Check if response.data is directly an array
      else if (Array.isArray(response.data)) {
        dataArray = response.data as BackendMissedPaymentData[];
        console.log('🔍 getMissedPayments - Using direct response.data array format');
      }
      // Check if it's a direct array response (not wrapped in response.data)
      else if (Array.isArray(response)) {
        dataArray = response;
        console.log('🔍 getMissedPayments - Using direct response array format');
      }

      console.log('🔍 getMissedPayments - Final dataArray:', {
        length: dataArray.length,
        sampleItem: dataArray[0] || 'No items'
      });

      const transformedData = dataArray.map((item: BackendMissedPaymentData, index: number) => {
        console.log(`🔍 getMissedPayments - Legacy transforming item ${index}:`, item);
        const transformed = this.transformMissedPaymentRecord(item);
        console.log(`🔍 getMissedPayments - Legacy transformed item ${index}:`, transformed);
        return transformed;
      });

      return {
        data: transformedData,
        pagination: {
          page,
          limit,
          total: dataArray.length,
          totalPages: Math.ceil(dataArray.length / limit)
        }
      };
    } catch (error) {
      console.error('🚨 getMissedPayments - Fetch error:', error);
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
  private transformDisbursementRecord(backendData: BackendDisbursementData): DisbursementRecord {
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
  private transformRecollectionRecord(backendData: BackendRecollectionData): RecollectionRecord {
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
  private transformSavingsRecord(backendData: BackendSavingsData): SavingsRecord {
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
  private transformMissedPaymentRecord(backendData: BackendMissedPaymentData): MissedPaymentRecord {
    console.log('🔍 transformMissedPaymentRecord - Input data:', backendData);

    // Check for ID fields
    const id = backendData.id || backendData._id || '';

    // Check for loanId fields (including nested and fallbacks)
    let loanId = backendData.loanId || backendData.loan_id || backendData.loanReference || '';
    if (!loanId && backendData.loan && typeof backendData.loan === 'object') {
      loanId = backendData.loan.loanId || backendData.loan.loan_id || backendData.loan.id || '';
    }
    // Fallback to generating from main ID if extracted loanId is still empty
    if (!loanId && id) {
      loanId = String(id).slice(-5).toUpperCase();
    }

    // Check for name fields
    const name = backendData.customerName || backendData.customer?.name || backendData.name || '';

    // Check for amount fields
    // For missed payments, we prefer missedAmount, but fallback to amount/balance
    const amountVal = backendData.missedAmount || backendData.amount || backendData.loanAmount || backendData.balance || 0;
    const amount = this.formatCurrency(amountVal);

    // Check for date fields (including nested)
    let dueDateRaw = backendData.dueDate ||
      backendData.due_date ||
      backendData.nextRepaymentDate ||
      backendData.next_repayment_date ||
      backendData.dateToBePaid ||
      backendData.date_to_be_paid ||
      backendData.repaymentDate ||
      backendData.expectedDate;

    if (!dueDateRaw && backendData.loan && typeof backendData.loan === 'object') {
      dueDateRaw = backendData.loan.nextRepaymentDate || backendData.loan.dueDate;
    }

    const dueDate = this.formatDate(dueDateRaw);

    // Check for days missed fields
    const daysMissed = backendData.daysMissed || backendData.days_missed || 0;

    // Check for status field
    const status = backendData.status || 'overdue';

    const result = {
      id,
      loanId,
      name,
      amount,
      dueDate,
      daysMissed,
      status
    };

    console.log('🔍 transformMissedPaymentRecord - Final result:', result);
    return result;
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
