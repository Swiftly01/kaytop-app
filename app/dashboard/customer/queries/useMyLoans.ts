import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiResponseError } from "@/app/types/auth";
import { ActiveLoanData } from "@/app/types/loan";
import { CustomerLoanService } from "@/app/services/customerLoanService";

export function useMyLoans() {
  const { isLoading, error, data } = useQuery<
    ActiveLoanData[],
    AxiosError<ApiResponseError>
  >({
    queryKey: ["my-loans"],
    queryFn: () => CustomerLoanService.getMyLoans(),
  });

  return { isLoading, error, data };
}
