import { CustomerService } from "@/app/services/customerService";
import { ApiResponseError } from "@/app/types/auth";
import { SavingsProgressResponse } from "@/app/types/loan";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";

export function useCustomerSavingsProgress() {
  const params = useParams();
  const customerId = Number(params.customerId);

  const { isLoading, error, data } = useQuery<
    SavingsProgressResponse,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["customer-savings", customerId],
    queryFn: () => {
      return CustomerService.getCustomerSavingsProgress(customerId);
    },
    enabled: customerId > 0,
  });

  return { isLoading, error, data };
}
