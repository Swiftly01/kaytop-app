"use client";
import { DashboardService } from "@/app/services/dashboardService";
import { DashboardKpi, DashboardKpiResponse } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import { useDashboardKPIPolling } from "@/app/hooks/useReportsPolling";

export function useDashboardQuery() {
  const searchParams = useSearchParams();
  const timeFilter = searchParams.get("last") ?? "custom";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Use polling for report statistics to keep dashboard KPIs updated
  const reportsPolling = useDashboardKPIPolling({
    dateFrom: startDate || undefined,
    dateTo: endDate || undefined,
  }, {
    enabled: true,
    pollingInterval: 30000, // 30 seconds
  });

  const { isLoading, error, data } = useQuery<
    DashboardKpi,
    AxiosError<DashboardKpiResponse>
  >({
    queryKey: ["dashboard", timeFilter, startDate, endDate],
    queryFn: ({ queryKey }) => {
      const [, timeFilter, startDate, endDate] = queryKey as [
        string,
        string,
        string | null,
        string | null
      ];

      return DashboardService.getDashboardKpi({
        timeFilter,
        startDate,
        endDate,
      });
    },
    // Enable automatic refetching to keep dashboard data fresh
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
  });

  return { 
    isLoading, 
    error, 
    data,
    // Expose polling status for debugging/monitoring
    reportsPollingStatus: {
      isPolling: reportsPolling.isPolling,
      statistics: reportsPolling.statistics,
      refresh: reportsPolling.refresh,
    }
  };
}
