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
 * Hook for fetching disbursements data
 */
export function useDisbursementsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<DisbursementRecord>, AxiosError>({
    queryKey: ["system-admin", "disbursements", page, limit],
    queryFn: () => systemAdminService.getDisbursements(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching recollections data
 */
export function useRecollectionsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<RecollectionRecord>, AxiosError>({
    queryKey: ["system-admin", "recollections", page, limit],
    queryFn: () => systemAdminService.getRecollections(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching savings data
 */
export function useSavingsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<SavingsRecord>, AxiosError>({
    queryKey: ["system-admin", "savings", page, limit],
    queryFn: () => systemAdminService.getSavings(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching missed payments data
 */
export function useMissedPaymentsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<MissedPaymentRecord>, AxiosError>({
    queryKey: ["system-admin", "missed-payments", page, limit],
    queryFn: () => systemAdminService.getMissedPayments(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}