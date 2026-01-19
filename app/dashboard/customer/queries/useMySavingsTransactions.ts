import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { SavingsService } from "@/app/services/savingsService";
import { ApiResponseError } from "@/app/types/auth";
import { PaginationKey } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";


export function useMySavingsTransactions() {
  const { page, limit } = useUrlPagination(
    PaginationKey.customer_savings_transactions_page
  );

  const { isLoading, error, data } = useQuery<
    any[],
    AxiosError<ApiResponseError>
  >({
    queryKey: ["my-savings-transactions", page, limit],
    queryFn: () => SavingsService.getMyTransactions(),
  });

  return {
    isLoading,
    error,
    data,
    meta: {
      page,
      limit,
      total: data?.length ?? 0,
    },
  };
}
