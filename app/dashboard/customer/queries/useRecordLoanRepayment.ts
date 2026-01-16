import { LoanService } from "@/app/services/loanService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRecordLoanRepayment(loanId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      LoanService.recordRepayment(loanId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-active-loan"] });
      queryClient.invalidateQueries({ queryKey: ["my-loans"] });
    },
  });
}
