import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import { ActiveLoanData } from "../types/loan";

export class CustomerLoanService {
  static async getMyLoans(): Promise<ActiveLoanData[]> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/customer/loans/my-loans`
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  static async getActiveLoan(): Promise<ActiveLoanData> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/customer/loans/active-loan`
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }
}
