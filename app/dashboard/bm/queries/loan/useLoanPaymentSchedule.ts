import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { useUrlParam } from "@/app/hooks/useUrlParam";
import { CustomerService } from "@/app/services/customerService";
import { ApiResponseError } from "@/app/types/auth";
import { PaginationKey } from "@/app/types/dashboard";
import { PaymentSchedule } from "@/app/types/loan";


import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useLoanPaymentSchedule() {
  const { page, limit } = useUrlPagination(PaginationKey.payment_schedule_page);

  const loanId = useUrlParam<number>(PaginationKey.active_loan_id, (value) =>
    Number(value ?? 0)
  );

  const { isLoading, error, data } = useQuery<PaymentSchedule, AxiosError<ApiResponseError>>({
    queryKey: ["payment-schedule", loanId, page, limit],
    queryFn: () => {
      return CustomerService.getLoanPaymentsSchedule({ loanId, page, limit });
    },
    enabled: loanId > 0,
  });

  return { isLoading, error, data };
}
