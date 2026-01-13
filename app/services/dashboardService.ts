import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import {
  DashboardKpi,
  LoanDisbursedResponse,
  LoanDisbursedVolumeResponse,
  LoanRecollectionResponse,
  MissedPaymentResponse,
  SavingsApiResponse,
} from "../types/dashboard";
import { reportsService } from "@/lib/services/reports";
import type { ReportStatistics } from "@/lib/api/types";

interface DashboardProps {
  timeFilter: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface LoanDisbursedProps {
  page: number;
  limit: number;
}

interface MissedPaymentProps {
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
      // Fetch both dashboard KPIs and report statistics in parallel
      const [dashboardResponse, reportStats] = await Promise.all([
        apiClient.get(`${apiBaseUrl}/dashboard/kpi`, {
          params: {
            timeFilter,
            startDate,
            endDate,
          },
        }),
        this.getReportStatistics({ timeFilter, startDate, endDate }),
      ]);

      const dashboardData = dashboardResponse.data;

      // Merge dashboard data with report statistics
      return {
        ...dashboardData,
        // Add report statistics to the dashboard KPI response
        totalReports: reportStats.totalReports.count,
        pendingReports: reportStats.pendingReports.count,
        approvedReports: reportStats.approvedReports.count,
        missedReports: reportStats.missedReports.count,
        // Add growth data for reports
        totalReportsGrowth: reportStats.totalReports.growth,
        pendingReportsGrowth: reportStats.pendingReports.growth,
        approvedReportsGrowth: reportStats.approvedReports.growth,
        missedReportsGrowth: reportStats.missedReports.growth,
      };
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.error("Error fetching dashboard kpi with reports:", err.response?.data);
      throw err;
    }
  }

  /**
   * Get report statistics for dashboard integration
   * Uses the unified reports service to fetch real-time report data
   */
  static async getReportStatistics({
    timeFilter,
    startDate,
    endDate,
  }: DashboardProps): Promise<ReportStatistics> {
    try {
      // Convert dashboard time filter to report filter format
      const reportFilters: { dateFrom?: string; dateTo?: string } = {};
      
      if (startDate) {
        reportFilters.dateFrom = startDate;
      }
      
      if (endDate) {
        reportFilters.dateTo = endDate;
      }

      // If no specific dates provided, use timeFilter to calculate date range
      if (!startDate && !endDate && timeFilter) {
        const now = new Date();
        let startDate: Date;

        switch (timeFilter) {
          case '24hours':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '12months':
          default:
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 12);
            break;
        }

        reportFilters.dateFrom = startDate.toISOString().split('T')[0];
        reportFilters.dateTo = now.toISOString().split('T')[0];
      }

      // Use the reports service to get statistics
      return await reportsService.getReportStatistics(reportFilters);
    } catch (error) {
      console.error('Report statistics fetch error for dashboard:', error);
      // Return default values if report statistics fail
      return {
        totalReports: { count: 0, growth: 0 },
        submittedReports: { count: 0, growth: 0 },
        pendingReports: { count: 0, growth: 0 },
        approvedReports: { count: 0, growth: 0 },
        missedReports: { count: 0, growth: 0 },
      };
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
      //  console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      //   console.log("Error fetching loan disbursed", err.response?.data);
      throw err;
    }
  }

  static async getLoanRecollection({
    page,
    limit,
  }: LoanDisbursedProps): Promise<LoanRecollectionResponse> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/loans/recollections`,
        {
          params: {
            page,
            limit,
          },
        }
      );
      // console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      //   console.log("Error fetching disbursed volume", err.response?.data);
      throw err;
    }
  }

  static async getSavings({
    page,
    limit,
  }: LoanDisbursedProps): Promise<SavingsApiResponse> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/savings/all`, {
        params: {
          page,
          limit,
        },
      });
      //console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      //   console.log("Error fetching disbursed volume", err.response?.data);
      throw err;
    }
  }

  static async getMissedPayment({
    page,
    limit,
  }: MissedPaymentProps): Promise<MissedPaymentResponse> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/loans/missed`, {
        params: {
          page,
          limit,
        },
      });
      //   console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      //  console.log("Error fetching disbursed volume", err.response?.data);
      throw err;
    }
  }

  static async getDisbursedVolume(): Promise<LoanDisbursedVolumeResponse[]> {
    try {
      const response = await apiClient.get(
        `${apiBaseUrl}/loans/disbursed/volume`
      );
      //  console.log(response);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      //   console.log("Error fetching disbursed volume", err.response?.data);
      throw err;
    }
  }
}
