import { CustomerService } from "@/app/services/customerService";
import { ApiResponseError } from "@/app/types/auth";
import { ActiveLoanData } from "@/app/types/loan";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";

export function useBranchCustomerLoan() {
  const params = useParams();
  const customerId = Number(params.customerId);

  const { isLoading, error, data } = useQuery<
    ActiveLoanData[],
    AxiosError<ApiResponseError>
  >({
    queryKey: ["loan-customerId", customerId],
    queryFn: () => {
      return CustomerService.getBranchCustomerLoan(customerId);
    },
    enabled: !!customerId,
  });

  return { isLoading, error, data };
}
