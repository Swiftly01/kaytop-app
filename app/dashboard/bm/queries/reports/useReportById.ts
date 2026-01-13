import { useUrlParam } from "@/app/hooks/useUrlParam";
import { ReportService } from "@/app/services/reportService";
import { ApiResponseError } from "@/app/types/auth";
import { PaginationKey } from "@/app/types/dashboard";
import { ReportByIdResponse } from "@/app/types/report";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export default function useReportById() {
  const reportId = useUrlParam<number>(PaginationKey.report_id, (value) =>
    Number(value ?? 0)
  );

  const { isLoading, error, data } = useQuery<
    ReportByIdResponse,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["report-by-id", reportId],
    queryFn: () => {
      return ReportService.getReportsById(reportId);
    },
    enabled: reportId > 0,
  });

  return { isLoading, error, data };
}
