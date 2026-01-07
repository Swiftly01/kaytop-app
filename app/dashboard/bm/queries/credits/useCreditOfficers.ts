import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { CreditService } from "@/app/services/creditService";
import {
  CreditOfficerErrorResponse,
  CreditOfficerListResponse,
} from "@/app/types/creditOfficer";
import { PaginationKey } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useCreditOfficers() {
const {page, limit} = useUrlPagination(PaginationKey.credit_officers_page)

  const { isLoading, error, data } = useQuery<
    CreditOfficerListResponse,
    AxiosError<CreditOfficerErrorResponse>
  >({
    queryKey: ["credit-officers", page, limit],
    queryFn: ({ queryKey }) => {
      const [, page, limit] = queryKey as [string, number, number];
      return CreditService.getCreditOfficers({ page, limit });
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
