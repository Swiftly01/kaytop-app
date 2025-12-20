import { DashboardService } from "@/app/services/dashboardService";
import { MissedPaymentResponse} from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

interface MissedPaymentErrorResponse {
  message?: string;
}

export function useMissedPayment() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("missedPaymentPage") ?? "1");
  const limit = 10;

  const { isLoading, error, data } = useQuery<MissedPaymentResponse,
    AxiosError<MissedPaymentErrorResponse>
  >({
    queryKey: ["missed-payment", page, limit],
    queryFn: ({ queryKey }) => {
      const [, page, limit] = queryKey as [string, number, number];

      return DashboardService.getMissedPayment({page, limit});
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
