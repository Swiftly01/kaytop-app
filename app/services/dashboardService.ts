import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import { DashboardKpi, LoanDisbursedResponse } from "../types/dashboard";

interface DashboardProps {
  timeFilter: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface LoanDisbursedProps {
  page: number;
  limit: number;
}

export class DashboardService {
  static async getDashboardKpi({
    timeFilter,
    startDate,
    endDate,
  }: DashboardProps): Promise<DashboardKpi> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/dashboard/kpi`, {
        params: {
          timeFilter,
          startDate,
          endDate,
        },
      });
      //console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      //  console.log("Error fetching dashboard kpi", err.response?.data);
      throw err;
    }
  }

  static async getLoanDisbursed({
    page,
    limit,
  }: LoanDisbursedProps): Promise<LoanDisbursedResponse> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/loans/disbursed`, {
        params: {
          page,
          limit,
        },
      });
      console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching loan disbursed", err.response?.data);
      throw err;
    }
  }

  static async getDisbursedVolume() {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/disbursed/volume`);
      console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching disbursed volume", err.response?.data);
      throw err;
    }
  }
}
