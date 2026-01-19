import { CustomerService } from "@/app/services/customerService";
import { ApiResponseError } from "@/app/types/auth";
import { CustomerData, CustomerDataResponse } from "@/app/types/customer";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";

export function useBranchCustomerById() {
  const params = useParams();
  // const customerId = Number(params.customerId);
  const { customerId } = useParams<{ customerId: string }>();

  const { isLoading, error, data } = useQuery<
    CustomerData,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["customerId", customerId],
    queryFn: () => {
      return CustomerService.getBranchCustomerById(Number(customerId));
    },
    enabled: !!customerId,
  });

  return { isLoading, error, data };
}
