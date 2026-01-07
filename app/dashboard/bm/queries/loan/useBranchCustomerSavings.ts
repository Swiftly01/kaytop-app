import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { CustomerService } from "@/app/services/customerService";
import { ApiResponseError } from "@/app/types/auth";
import { CustomerSavingsResponse } from "@/app/types/customer";
import { PaginationKey } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";

export function useBranchCustomerSavings() {
  const params = useParams();
  const customerId = Number(params.customerId);

  const { page, limit } = useUrlPagination(
    PaginationKey.branch_customer_savings_page
  );

  const { isLoading, error, data } = useQuery<
    CustomerSavingsResponse,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["savings-customerId", customerId, page, limit],
    queryFn: () => {
      return CustomerService.getBranchCustomerSavings({
        customerId,
        page,
        limit,
      });
    },
    enabled: !!customerId,
  });

  return { isLoading, error, data };
}
