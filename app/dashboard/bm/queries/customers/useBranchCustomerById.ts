import { CustomerService } from "@/app/services/customerService";
import { ApiResponseError } from "@/app/types/auth";
import { CustomerDataResponse } from "@/app/types/customer";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";

export function useBranchCustomerById() {
  const params = useParams();
  const customerId = Number(params.customerId);

  const { isLoading, error, data } = useQuery<
    CustomerDataResponse,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["customerId", customerId],
    queryFn: () => {
      return CustomerService.getBranchCustomerById(customerId);
    },
    enabled: !!customerId,
  });

  return { isLoading, error, data };
}
