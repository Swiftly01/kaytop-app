"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/lib/services/dashboard";
import type { DashboardKPIs, DashboardParams } from "@/lib/api/types";
import { AxiosError } from "axios";

/**
 * Hook for fetching AM dashboard KPIs
 * Uses same backend endpoints as System Admin but with AM query keys
 */
export function useAMDashboardQuery(params?: DashboardParams) {
  return useQuery<DashboardKPIs, AxiosError>({
    queryKey: ["account-manager", "dashboard", "kpis", params],
    queryFn: () => dashboardService.getKPIs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}