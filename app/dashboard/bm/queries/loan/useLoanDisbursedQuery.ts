import { DashboardService } from "@/app/services/dashboardService";
import { LoanDisbursedResponse } from "@/app/types/dashboard";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

interface LoanDisbursedErrorResponse {
  message?: string;
}

export function useLoanDisbursedQuery() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const limit = 10;

  const { isLoading, error, data } = useQuery<
    LoanDisbursedResponse,
    AxiosError<LoanDisbursedErrorResponse>
  >({
    queryKey: ["loan-disbursed", page, limit],

    queryFn: ({ queryKey }) => {
      const [, page, limit] = queryKey as [string, number, number];
      return DashboardService.getLoanDisbursed({ page, limit });
    },
  });

  return { isLoading, error, data };
}
