import { DashboardService } from "@/app/services/dashboardService";
import { LoanDisbursedVolumeResponse } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface DisburseVolumeResponse {
  message?: string;
}

export function useDisburseVolume() {
  const { isLoading, error, data } = useQuery<
    LoanDisbursedVolumeResponse[],
    AxiosError<DisburseVolumeResponse>
  >({
    queryKey: ["disburse-volume"],
    queryFn: DashboardService.getDisbursedVolume,
  });

  return { isLoading, error, data };
}
