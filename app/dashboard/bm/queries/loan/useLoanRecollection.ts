import { DashboardService } from "@/app/services/dashboardService";
import { LoanRecollectionResponse } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import { meta } from "zod/v4/core";

interface LoanRecollectionErrorResponse {
  message?: string;
}

export function useLoanRecollection() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("recollectionPage") ?? "1");
  const limit = 10;

  const { isLoading, error, data } = useQuery<
    LoanRecollectionResponse,
    AxiosError<LoanRecollectionErrorResponse>
  >({
    queryKey: ["loan-recollection", page, limit],
    queryFn: ({ queryKey }) => {
      const [, page, limit] = queryKey as [string, number, number];

      return DashboardService.getLoanRecollection({ page, limit });
    },
    select: (response) => {
      if (Array.isArray(response)) {
        return {
          data: response,
          meta: undefined,
        };
      }

      return response;
    },
  });

  return { isLoading, error, data };
}
