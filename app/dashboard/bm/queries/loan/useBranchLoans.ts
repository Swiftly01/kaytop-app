import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { LoanService } from "@/app/services/loanService";
import { ApiResponseError } from "@/app/types/auth";
import { PaginationKey } from "@/app/types/dashboard";
import { BranchLoanResponse } from "@/app/types/loan";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useBranchLoans() {
  const { page, limit } = useUrlPagination(PaginationKey.branch_loan_page);

  const { isLoading, error, data } = useQuery<
    BranchLoanResponse,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["branch-loans", page, limit],
    queryFn: () => {
      return LoanService.getBranchLoans({ page, limit });
    },
  });

  return { isLoading, error, data };
}
