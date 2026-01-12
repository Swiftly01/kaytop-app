import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import {
  ActiveLoanData,
  PaymentSchedule,
} from "../types/loan";

export class StaffLoanService {
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
