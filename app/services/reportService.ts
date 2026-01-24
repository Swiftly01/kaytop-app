import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import {
  ApproveFormData,
  CreateReportPayload,
  CreateReportResponse,
  GenerateReportPostFormData,
  GenerateReportResponse,
  ReportApiResponse,
  ReportById,
  ReportByIdResponse,
  ReportResponse,
  ReportStatus,
  ReportType,
  SubmitHqReportFormData,
  SubmitReportPayload
} from "../types/report";
import { AxiosError } from "axios";

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

interface SubmitReportHqProps {
  data: SubmitHqReportFormData;
  reportId: number;
}

export class ReportService {
  static async getReports({
    page,
    limit,
    status,
    branch,
    type,
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
      },
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
      `${apiBaseUrl}/reports/${reportId}`,
    );
    // console.log(response);
    return {
      data: response.data,
    };
  }

  static async generateReport(
    data: GenerateReportPostFormData,
  ): Promise<GenerateReportResponse> {
    const response = await apiClient.post(
      `${apiBaseUrl}/reports/branch/aggregate`,
      data,
    );

    //  console.log(response);
    return response;
  }

  static async submitReportToHq({ reportId, data }: SubmitReportHqProps) {
     const response = apiClient.post(
      `${apiBaseUrl}/reports/branch/${reportId}/submit-to-hq`,
      data,
    );

   // console.log(response);
    return response;
  }

  static async approveReport({ data, reportId }: ApproveReportProps) {
    const response = await apiClient.put(
      `${apiBaseUrl}/reports/${reportId}/approve`,
      data,
    );

    console.log(response);
    return response.data;
  }

  static async declineReport({ data, reportId }: ApproveReportProps) {
    const response = await apiClient.put(
      `${apiBaseUrl}/reports/${reportId}/decline`,
      { declineReason: data.remarks },
    );

    console.log(response);
    return response.data;
  }

   /* ===================== GENERATE (CREATE) REPORT ===================== */
  
  static async createReport(
  payload: CreateReportPayload
): Promise<CreateReportResponse> {
  const res = await apiClient.post<CreateReportResponse>(
    `${apiBaseUrl}/reports`,
    payload
  );
  return res.data;
}


  /* ===================== SUBMIT REPORT ===================== */
  static async submitReport(
    reportId: number,
    payload: SubmitReportPayload
  ): Promise<Report> {
    try {
      const response = await apiClient.post<Report>(
        `${apiBaseUrl}/reports/${reportId}/submit`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }


}
