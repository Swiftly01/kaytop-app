import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import { CustomerSavingsResponse } from "../types/customer";

export class SavingsService {
  static async deposit(
    customerId: number,
    payload: { amount: number; description: string }
  ) {
    try {
      const response = await apiClient.post(
        `${apiBaseUrl}/savings/customer/${customerId}/deposit`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async useForLoanCoverage(
    customerId: number,
    payload: { loanId: number; amount: number }
  ) {
    try {
      const response = await apiClient.post(
        `${apiBaseUrl}/savings/customer/${customerId}/loan-coverage`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async approveLoanCoverage(transactionId: number) {
    try {
      const response = await apiClient.put(
        `${apiBaseUrl}/savings/transactions/${transactionId}/approve-loan-coverage`
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async withdraw(
    customerId: number,
    payload: { amount: number; description: string }
  ) {
    try {
      const response = await apiClient.post(
        `${apiBaseUrl}/savings/customer/${customerId}/withdraw`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async approveWithdraw(transactionId: number) {
    try {
      const response = await apiClient.put(
        `${apiBaseUrl}/savings/transactions/${transactionId}/approve-withdraw`
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async getCustomerSavings(
    customerId: number
  ): Promise<CustomerSavingsResponse> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/savings/customer/${customerId}`
      );
      return { data: response.data, meta: response.data.meta ?? null };
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async getMyBalance() {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/customer/savings/my-balance`
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async getMyTransactions() {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/customer/savings/my-transactions`
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }
}
