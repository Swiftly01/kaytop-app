import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { useUrlParam } from "@/app/hooks/useUrlParam";
import { LoanService } from "@/app/services/loanService";
import { ApiResponseError } from "@/app/types/auth";
import { PaginationKey } from "@/app/types/dashboard";
import { LoanDetailsResponse } from "@/app/types/loan";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useLoanDetails() {
  const { page, limit } = useUrlPagination(PaginationKey.loan_page_repayment);

  const loanId = useUrlParam<number>(PaginationKey.loan_page_id, (value) =>
    Number(value ?? 0)
  );

  const { isLoading, error, data } = useQuery<
    LoanDetailsResponse,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["loanpage-details", loanId, page, limit],
    queryFn: () => {
      return LoanService.getLoanDetails({ loanId, page, limit });
    },
    enabled: loanId > 0,
  });

  return { isLoading, error, data };
}
