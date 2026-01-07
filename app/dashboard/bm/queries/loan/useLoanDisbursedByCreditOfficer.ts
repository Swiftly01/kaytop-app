import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { CreditService } from "@/app/services/creditService";
import {
  CreditOfficerErrorResponse,
  CreditOfficerLoanDisbursedResponse,
} from "@/app/types/creditOfficer";
import { PaginationKey } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";

export function useLoanDisbursedByCreditOfficer() {
  const params = useParams();
  const officerId = Number(params.officerId);
  const { page, limit } = useUrlPagination(
    PaginationKey.credit_officer_loan_disbursed_Page
  );

  const { isLoading, error, data } = useQuery<
    CreditOfficerLoanDisbursedResponse,
    AxiosError<CreditOfficerErrorResponse>
  >({
    queryKey: ["creditOfficer-loanDisbursed", officerId, page, limit],
    queryFn: () => {
      return CreditService.getLoanDisbursedByCreditOfficer({
        creditOfficerId: officerId,
        page,
        limit,
      });
    },

    enabled: !!officerId,
  });

  return { isLoading, error, data };
}
