// Reports Hook - React Query hooks for reports

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CreateReportPayload, CreateReportResponse, ReportStatus, ReportType, SubmitReportPayload } from "../types/report";
import { ReportService } from "../services/reportService";


export interface UseReportsOptions {
  initialPage?: number;
  initialLimit?: number;
  initialStatus?: ReportStatus;
  initialType?: ReportType;
  branch?: string;
}

export function useReports(options: UseReportsOptions = {}) {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialStatus,
    initialType,
    branch,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [status, setStatus] = useState<ReportStatus | undefined>(initialStatus);
  const [type, setType] = useState<ReportType | undefined>(initialType);

  

  const query = useQuery({
    queryKey: ["reports", page, limit, status, type],
    queryFn: () =>
      ReportService.getReports({
        page,
        limit,
        status,
        type,
      }),
  });

  return {
    ...query,
    page,
    setPage,
    status,
    setStatus,
    type,
    setType,
  };
}

export function useReportById(reportId: number | null) {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: () => ReportService.getReportsById(reportId!),
    enabled: !!reportId,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation<CreateReportResponse, unknown, CreateReportPayload>({
    mutationFn: (payload) => ReportService.createReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}


export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      payload,
    }: {
      reportId: number;
      payload: SubmitReportPayload;
    }) => ReportService.submitReport(reportId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
