import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiResponseError } from "@/app/types/auth";
import { SavingsService } from "@/app/services/savingsService";

export function useMySavingsBalance() {
  const { isLoading, error, data } = useQuery<
    {
      id: number;
      balance: string;
      targetAmount: string;
      targetDescription: string;
      transactions: Record<string, unknown>[];
    },
    AxiosError<ApiResponseError>
  >({
    queryKey: ["my-savings-balance"],
    queryFn: () => SavingsService.getMyBalance(),
  });

  return { isLoading, error, data };
}
