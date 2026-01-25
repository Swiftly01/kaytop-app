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
export function useHQDisbursementsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<DisbursementRecord>, AxiosError>({
    queryKey: ["hq", "disbursements", page, limit],
    queryFn: () => systemAdminService.getDisbursements(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching recollections data
 */
export function useHQRecollectionsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<RecollectionRecord>, AxiosError>({
    queryKey: ["hq", "recollections", page, limit],
    queryFn: () => systemAdminService.getRecollections(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching savings data
 */
export function useHQSavingsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<SavingsRecord>, AxiosError>({
    queryKey: ["hq", "savings", page, limit],
    queryFn: () => systemAdminService.getSavings(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching missed payments data
 */
export function useHQMissedPaymentsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<MissedPaymentRecord>, AxiosError>({
    queryKey: ["hq", "missed-payments", page, limit],
    queryFn: () => systemAdminService.getMissedPayments(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}