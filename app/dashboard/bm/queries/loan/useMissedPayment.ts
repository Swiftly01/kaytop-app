import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { DashboardService } from "@/app/services/dashboardService";
import { MissedPaymentResponse, PaginationKey } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface MissedPaymentErrorResponse {
  message?: string;
}

export function useMissedPayment() {
  const { page, limit } = useUrlPagination(PaginationKey.missed_payment_page);

  const { isLoading, error, data } = useQuery<
    MissedPaymentResponse,
    AxiosError<MissedPaymentErrorResponse>
  >({
    queryKey: ["missed-payment", page, limit],
    queryFn: ({ queryKey }) => {
      const [, page, limit] = queryKey as [string, number, number];

      return DashboardService.getMissedPayment({ page, limit });
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
