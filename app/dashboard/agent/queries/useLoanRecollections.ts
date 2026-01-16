
import { DashboardService } from "@/app/services/dashboardService";
import { useQuery } from "@tanstack/react-query";

export function useLoanRecollections(page = 1, limit = 5) {
  return useQuery({
    queryKey: ["loan-recollections", page, limit],
    queryFn: () =>
      DashboardService.getLoanRecollection({ page, limit }),
  });
}
