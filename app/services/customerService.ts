import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import { CustomerListResponse } from "../types/customer";

interface QueryParamsProps {
  customerId?: number;
  page: number;
  limit: number;
}

export class CustomerService {
  static async getCustomersByBranch({ page, limit }: QueryParamsProps): Promise<CustomerListResponse> {
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
}
