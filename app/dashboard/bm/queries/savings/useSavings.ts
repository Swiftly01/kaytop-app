import { DashboardService } from "@/app/services/dashboardService";
import { SavingsApiResponse } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

interface SavingsErrorResponse {
  message?: string;
}

export function useSavings() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("savingsPage") ?? "1");
  const limit = 10;

  const { isLoading, error, data } = useQuery<
    SavingsApiResponse,
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
