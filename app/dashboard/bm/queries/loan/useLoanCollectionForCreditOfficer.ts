import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { CreditService } from "@/app/services/creditService";
import {
  CreditOfficerErrorResponse,
  CreditOfficerLoanCollectionResponse,
} from "@/app/types/creditOfficer";
import { PaginationKey } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";

export function useLoanCollectionForCreditOfficer() {
  const params = useParams();
  const officerId = Number(params.officerId);
  const { page, limit } = useUrlPagination(
    PaginationKey.credit_officer_loan_collection_page
  );

  const { isLoading, error, data } = useQuery<
    CreditOfficerLoanCollectionResponse,
    AxiosError<CreditOfficerErrorResponse>
  >({
    queryKey: ["creditOfficer-loanCollection", officerId, page, limit],
    queryFn: () => {
      return CreditService.getLoanCollectionForCreditOfficer({
        creditOfficerId: officerId,
        page,
        limit
      });
    },
    enabled: !!officerId,
  });

  return { isLoading, error, data };
}
