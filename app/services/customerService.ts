import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import {
  CustomerDataResponse,
  CustomerListResponse,
  CustomerSavingsResponse,
} from "../types/customer";

interface QueryParamsProps {
  customerId?: number;
  page: number;
  limit: number;
}

export class CustomerService {
  static async getCustomersByBranch({
    page,
    limit,
  }: QueryParamsProps): Promise<CustomerListResponse> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/users/my-branch`, {
        params: {
          page,
          limit,
        },
      });
      // console.log(response);
      return { data: response.data, meta: undefined };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching all branch customer", err.response?.data);
      throw err;
    }
  }

  static async getBranchCustomerById(
    customerId: number
  ): Promise<CustomerDataResponse> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/admin/users/${customerId}`
      );
      // console.log(response);
      return { data: response.data };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching branch customer by id", err.response?.data);
      throw err;
    }
  }

  static async getBranchCustomerLoan(customerId: number) {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/loans/customer/${customerId}`
      );
      console.log(response);
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
            customerId,
            page,
            limit,
          },
        }
      );
      // console.log(response);
      return { data: response.data, meta: response.data.meta ?? null };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching branch customer by id", err.response?.data);
      throw err;
    }
  }
}
