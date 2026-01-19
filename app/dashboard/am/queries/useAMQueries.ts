"use client";

import { useQuery } from "@tanstack/react-query";
import { systemAdminService } from "@/lib/services/systemAdmin";
import type { 
  DisbursementRecord, 
  RecollectionRecord, 
  SavingsRecord, 
  MissedPaymentRecord 
} from "@/lib/services/systemAdmin";
import type { PaginatedResponse } from "@/lib/api/types";
import { AxiosError } from "axios";

/**
 * Hook for fetching disbursements data (AM dashboard)
 * Uses same backend endpoints as System Admin but with AM query keys
 */
export function useAMDisbursementsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<DisbursementRecord>, AxiosError>({
    queryKey: ["account-manager", "disbursements", page, limit],
    queryFn: () => systemAdminService.getDisbursements(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching recollections data (AM dashboard)
 * Uses same backend endpoints as System Admin but with AM query keys
 */
export function useAMRecollectionsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<RecollectionRecord>, AxiosError>({
    queryKey: ["account-manager", "recollections", page, limit],
    queryFn: () => systemAdminService.getRecollections(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching savings data (AM dashboard)
 * Uses same backend endpoints as System Admin but with AM query keys
 */
export function useAMSavingsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<SavingsRecord>, AxiosError>({
    queryKey: ["account-manager", "savings", page, limit],
    queryFn: () => systemAdminService.getSavings(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching missed payments data (AM dashboard)
 * Uses same backend endpoints as System Admin but with AM query keys
 */
export function useAMMissedPaymentsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<MissedPaymentRecord>, AxiosError>({
    queryKey: ["account-manager", "missed-payments", page, limit],
    queryFn: () => systemAdminService.getMissedPayments(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}