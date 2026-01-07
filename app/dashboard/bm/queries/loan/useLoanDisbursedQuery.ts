import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { DashboardService } from "@/app/services/dashboardService";
import { ApiResponseError } from "@/app/types/auth";
import { LoanDisbursedResponse, PaginationKey } from "@/app/types/dashboard";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useLoanDisbursedQuery() {
  const { page, limit } = useUrlPagination(PaginationKey.loan_page);

  const { isLoading, error, data } = useQuery<
    LoanDisbursedResponse,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["loan-disbursed", page, limit],

    queryFn: ({ queryKey }) => {
      const [, page, limit] = queryKey as [string, number, number];
      return DashboardService.getLoanDisbursed({ page, limit });
    },
  });

  return { isLoading, error, data };
}
