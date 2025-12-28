import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { CustomerService } from "@/app/services/customerService";
import { ApiResponseError } from "@/app/types/auth";
import { CustomerListResponse } from "@/app/types/customer";
import { PaginationKey } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useBranchCustomer() {
  const { page, limit } = useUrlPagination(PaginationKey.branch_customer_page);

  const { isLoading, error, data } = useQuery<
    CustomerListResponse,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["branch-customers", page, limit],
    queryFn: () => {
      return CustomerService.getCustomersByBranch({ page, limit });
    },
  });

  return { isLoading, error, data };
}
