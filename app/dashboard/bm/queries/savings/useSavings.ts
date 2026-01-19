import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { DashboardService } from "@/app/services/dashboardService";
import { PaginationKey, savingsResponse } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface SavingsErrorResponse {
  message?: string;
}

export function useSavings() {
  const { page, limit } = useUrlPagination(PaginationKey.savings_page);

  const { isLoading, error, data } = useQuery<
    savingsResponse,
    AxiosError<SavingsErrorResponse>
  >({
    queryKey: ["savings", page, limit],
    queryFn: ({ queryKey }) => {
      const [, page, limit] = queryKey as [string, number, number];

      return DashboardService.getSavings({ page, limit });
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
