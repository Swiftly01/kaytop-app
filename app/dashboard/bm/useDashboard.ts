"use client"
import { DashboardService } from "@/app/services/dashboardService";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

interface DashboardKpiResponse {
  message?: string;
}

export function useDashboard() {
  const searchParams = useSearchParams();
  const timeFilter = searchParams.get("last") ?? "custom";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const { isLoading, error, data } = useQuery<
    unknown[],
    AxiosError<DashboardKpiResponse>
  >({
    queryKey: ["dashboard", timeFilter, startDate, endDate],
    queryFn:   ({ queryKey }) => {
      const [, timeFilter,  startDate, endDate] = queryKey as [string, string, string| null, string | null];

      return DashboardService.getDashboardKpi({timeFilter, startDate, endDate});
    },
  });

  return { isLoading, error, data };
}
