import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import {
  CustomerApiResponse,
  CustomerData,
  CustomerListResponse,
  CustomerSavingsResponse,
} from "../types/customer";
import {
  ActiveLoanData,
  PaymentSchedule,
  SavingsProgressResponse,
} from "../types/loan";

interface QueryParamsProps {
  customerId?: number;
  loanId?: number;
  page: number;
  limit: number;
}

export class CustomerService {
  static async getCustomersByBranch({
    page,
    limit,
  }: QueryParamsProps): Promise<CustomerListResponse> {
    try {
      const response = await apiClient.get<CustomerApiResponse>(
        `${apiBaseUrl}/users/my-branch`,
        {
          params: {
            page,
            limit,
          },
        },
      );
      const { total, users } = response.data;

      return {
        data: users,
        meta: {
          total,
          limit,
          page,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching all branch customer", err.response?.data);
      throw err;
    }
  }

  static async getBranchCustomerById(
    customerId: number,
  ): Promise<CustomerData> {
    try {
      const response = await apiClient.get<CustomerData>(
        `${apiBaseUrl}/admin/users/${customerId}`,
      );
      // console.log(response);
      // return { data: response.data };
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching branch customer by id", err.response?.data);
      throw err;
    }
  }

  static async getBranchCustomerLoan(
    customerId: number,
  ): Promise<ActiveLoanData[]> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/loans/customer/${customerId}`,
      );
      // console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;

      console.log("Error fetching branch customer by id", err.response?.data);
      throw err;
    }
  }

  static async getBranchCustomerSavings({
    customerId,
    page,
    limit,
  }: QueryParamsProps): Promise<CustomerSavingsResponse> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/savings/customer/${customerId}`,
        {
          params: {
            page,
            limit,
          },
        },
      );
      // console.log(response);
      return { data: response.data, meta: response.data.meta ?? null };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      //   console.log("Error fetching branch customer by id", err.response?.data);
      throw err;
    }
  }

  static async getLoanPaymentsSchedule({
    loanId,
    page,
    limit,
  }: QueryParamsProps): Promise<PaymentSchedule> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/loans/${loanId}/payment-schedule`,
        {
          params: {
            page,
            limit,
          },
        },
      );

      //  console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching all branch customer", err.response?.data);
      throw err;
    }
  }

  static async getCustomerSavingsProgress(
    customerId: number,
  ): Promise<SavingsProgressResponse> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/savings/customer/${customerId}/progress`,
      );

      // console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching all branch customer", err.response?.data);
      throw err;
    }
  }
}
