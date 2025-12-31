import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import { BranchLoanResponse } from "../types/loan";

interface QueryParamsProps {
  page: number;
  limit: number;
}

export class LoanService {
  static async getBranchLoans({ page, limit }: QueryParamsProps): Promise<BranchLoanResponse> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/loans/all`, {
        params: {
          page,
          limit,
        },
      });
      
      return { data: response.data, meta: undefined };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching all branch loans", err.response?.data);
      throw err;
    }
  } 
}
