import { SavingsService } from "@/app/services/savingsService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useWithdrawSavings(customerId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { amount: number; description: string }) =>
      SavingsService.withdraw(customerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-savings-balance"] });
      queryClient.invalidateQueries({ queryKey: ["my-savings-transactions"] });
    },
  });
}
