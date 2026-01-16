import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import {
  ActiveLoanData,
  BranchLoanApiResponse,
  BranchLoanResponse,
  LoanDetailsApiResponse,
  LoanDetailsResponse,
} from "../types/loan";

interface QueryParamsProps {
  loanId?: number;
  page: number;
  limit: number;
  status?: string
}

export class LoanService {
  static async getBranchLoans({
    page,
    limit,
    status
  }: QueryParamsProps): Promise<BranchLoanResponse> {
    try {
      const response = await apiClient.get<BranchLoanApiResponse>(
        `${apiBaseUrl}/loans`,
        {
          params: {
            page,
            limit,
            status,
          },
        }
      );

      const { loans, total, totalPages } = response.data;

      return {
        data: loans,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching all branch loans", err.response?.data);
      throw err;
    }
  }


  static async getLoanDetails({
    loanId,
    page,
    limit,
  }: QueryParamsProps): Promise<LoanDetailsResponse> {
    try {
      const response = await apiClient.get<LoanDetailsApiResponse>(
        `${apiBaseUrl}/loans/${loanId}/details`,
        {
          params: {
            page,
            limit,
          },
        }
      );
      return {
        data: response.data,
        meta: undefined,
      };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching loan details", err.response?.data);
      throw err;
    }
  }


  // 

  static async createLoan(
    customerId: number,
    payload: {
      amount: number;
      term: number;
      interestRate: number;
    }
  ): Promise<ActiveLoanData> {
    try {
      const response = await apiClient.post(
        `${apiBaseUrl}/loans/customer/${customerId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async disburseLoan(
    loanId: number,
    formData: FormData
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.put(
        `${apiBaseUrl}/loans/${loanId}/disburse`,
        formData
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async recordRepayment(
    loanId: number,
    formData: FormData
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(
        `${apiBaseUrl}/loans/${loanId}/repayments`,
        formData
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async getLoanSummary(customerId: number) {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/loans/customer/${customerId}/loan-summary`
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async getDisbursementSummary(customerId: number) {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/loans/customer/${customerId}/disbursement-summary`
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }
  
}
