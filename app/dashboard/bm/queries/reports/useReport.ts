import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { useUrlParam } from "@/app/hooks/useUrlParam";
import { ReportService } from "@/app/services/reportService";
import { ApiResponseError } from "@/app/types/auth";
import { PaginationKey } from "@/app/types/dashboard";
import { ReportResponse, ReportStatus, ReportType } from "@/app/types/report";
import { isReportStatus, isReportType } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

interface QueryProps {
  branch?: string;
}
export function useReport({ branch }: QueryProps) {
  const searchParams = useSearchParams();
  const rawStatus = searchParams.get("status");
  const status: ReportStatus =
    rawStatus && isReportStatus(rawStatus) ? rawStatus as ReportStatus : ReportStatus.PENDING;

  const { page, limit } = useUrlPagination(PaginationKey.report_page);
  const type = useUrlParam<ReportType>(PaginationKey.report_type, (value) =>
    isReportType(value) ? value : "custom"
  );

  const { isLoading, error, data } = useQuery<
    ReportResponse,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["branch-reports", page, limit, status, type, branch],
    queryFn: () => {
      return ReportService.getReports({ page, limit, status, branch, type });
    },
    enabled: Boolean(branch),
  });

  return { isLoading, error, data };
}
