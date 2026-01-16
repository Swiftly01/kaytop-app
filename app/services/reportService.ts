import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import {
  ApproveFormData,
  ReportApiResponse,
  ReportById,
  ReportByIdResponse,
  ReportResponse,
  ReportStatus,
  ReportType,
} from "../types/report";

//page=1&limit=20&status=pending&branch=Lagos%20Island&type=monthly

interface QueryParamsProps {
  page: number;
  limit: number;
  status?: ReportStatus;
  branch?: string;
  type?: ReportType;
}

interface ApproveReportProps {
  data: ApproveFormData;
  reportId: number;
}

export class ReportService {
  static async getReports({
    page,
    limit,
    status,
    branch,
    type = "custom",
  }: QueryParamsProps): Promise<ReportResponse> {
    const response = await apiClient.get<ReportApiResponse>(
      `${apiBaseUrl}/reports`,
      {
        params: {
          page,
          limit,
          status,
          branch,
          type,
        },
      }
    );

    // console.log(response);
    const { reports, total, totalPages } = response.data;

    return {
      data: reports,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getReportsById(reportId: number): Promise<ReportByIdResponse> {
    const response = await apiClient.get<ReportById>(
      `${apiBaseUrl}/reports/${reportId}`
    );
    // console.log(response);
    return {
      data: response.data,
    };
  }

  static async approveReport({ data, reportId }: ApproveReportProps) {
    const response = await apiClient.post(
      `${apiBaseUrl}/reports/${reportId}/approve`,
      data
    );

    console.log(response);
    return response.data;
  }

  static async declineReport({ data, reportId }: ApproveReportProps) {
    const response = await apiClient.post(
      `${apiBaseUrl}/reports/${reportId}/decline`,
      { declineReason: data.remarks }
    );

    console.log(response);
    return response.data;
  }
}
