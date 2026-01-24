'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { reportsService } from '@/lib/services/reports';
import { useBackgroundRefresh } from './useBackgroundRefresh';
import type { ReportFilters } from '@/lib/api/types';

export interface ReportsPollingConfig {
  enabled?: boolean;
  pollingInterval?: number; // in milliseconds
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

const DEFAULT_POLLING_CONFIG: Required<ReportsPollingConfig> = {
  enabled: true,
  pollingInterval: 30000, // 30 seconds
  staleTime: 15000, // 15 seconds
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};

/**
 * Hook for polling reports data with automatic updates
 * Implements periodic refresh of report data and dashboard KPIs
 */
export function useReportsPolling(
  filters: ReportFilters = {},
  config: ReportsPollingConfig = {}
) {
  const finalConfig = { ...DEFAULT_POLLING_CONFIG, ...config };
  const queryClient = useQueryClient();
  const lastUpdateRef = useRef<Date | null>(null);

  // Query for reports list with polling
  const reportsQuery = useQuery({
    queryKey: ['reports', 'list', filters],
    queryFn: () => reportsService.getAllReports(filters),
    enabled: finalConfig.enabled,
    staleTime: finalConfig.staleTime,
    refetchInterval: finalConfig.pollingInterval,
    refetchOnWindowFocus: finalConfig.refetchOnWindowFocus,
    refetchOnReconnect: finalConfig.refetchOnReconnect,
    refetchIntervalInBackground: true,
  });

  // Query for report statistics with polling
  const statisticsQuery = useQuery({
    queryKey: ['reports', 'statistics', { 
      dateFrom: filters.dateFrom, 
      dateTo: filters.dateTo, 
      branchId: filters.branchId 
    }],
    queryFn: () => reportsService.getReportStatistics({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      branchId: filters.branchId,
    }),
    enabled: finalConfig.enabled,
    staleTime: finalConfig.staleTime,
    refetchInterval: finalConfig.pollingInterval,
    refetchOnWindowFocus: finalConfig.refetchOnWindowFocus,
    refetchOnReconnect: finalConfig.refetchOnReconnect,
    refetchIntervalInBackground: true,
  });

  // Manual refresh function for coordinated updates
  const refreshReportsData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['reports'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }), // Refresh dashboard KPIs
    ]);
    lastUpdateRef.current = new Date();
  }, [queryClient]);

  // Background refresh with exponential backoff
  const backgroundRefresh = useBackgroundRefresh(refreshReportsData, {
    enabled: finalConfig.enabled,
    interval: finalConfig.pollingInterval,
    refreshOnFocus: finalConfig.refetchOnWindowFocus,
    refreshOnReconnect: finalConfig.refetchOnReconnect,
    staleTime: finalConfig.staleTime,
  });

  // Invalidate related queries when reports data changes
  useEffect(() => {
    if (reportsQuery.data && reportsQuery.dataUpdatedAt > (lastUpdateRef.current?.getTime() || 0)) {
      // Invalidate dashboard queries to update KPIs
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      lastUpdateRef.current = new Date(reportsQuery.dataUpdatedAt);
    }
  }, [reportsQuery.data, reportsQuery.dataUpdatedAt, queryClient]);

  return {
    // Reports data
    reports: reportsQuery.data,
    reportsLoading: reportsQuery.isLoading,
    reportsError: reportsQuery.error,
    
    // Statistics data
    statistics: statisticsQuery.data,
    statisticsLoading: statisticsQuery.isLoading,
    statisticsError: statisticsQuery.error,
    
    // Polling controls
    isPolling: finalConfig.enabled && !reportsQuery.isPaused,
    getLastUpdate: () => lastUpdateRef.current,
    
    // Manual controls
    refresh: refreshReportsData,
    enablePolling: () => {
      reportsQuery.refetch();
      statisticsQuery.refetch();
    },
    disablePolling: () => {
      // Note: React Query doesn't have a direct disable method
      // This would need to be handled by the parent component
      console.warn('Polling disable should be handled by updating the config prop');
    },
    
    // Background refresh status
    backgroundRefreshStatus: {
      isRefreshing: backgroundRefresh.isRefreshing,
      lastRefresh: backgroundRefresh.lastRefresh,
      isEnabled: backgroundRefresh.isEnabled,
    },
  };
}

/**
 * Hook for polling branch-specific reports data
 */
export function useBranchReportsPolling(
  branchId: string,
  filters: Omit<ReportFilters, 'branchId'> = {},
  config: ReportsPollingConfig = {}
) {
  return useReportsPolling(
    { ...filters, branchId },
    config
  );
}

/**
 * Hook for polling dashboard KPIs with report statistics
 * Automatically updates dashboard KPIs when report data changes
 */
export function useDashboardKPIPolling(
  filters: Pick<ReportFilters, 'dateFrom' | 'dateTo' | 'branchId'> = {},
  config: ReportsPollingConfig = {}
) {
  const finalConfig = { ...DEFAULT_POLLING_CONFIG, ...config };
  const queryClient = useQueryClient();

  // Poll report statistics for dashboard KPIs
  const statisticsQuery = useQuery({
    queryKey: ['reports', 'statistics', 'dashboard', filters],
    queryFn: () => reportsService.getReportStatistics(filters),
    enabled: finalConfig.enabled,
    staleTime: finalConfig.staleTime,
    refetchInterval: finalConfig.pollingInterval,
    refetchOnWindowFocus: finalConfig.refetchOnWindowFocus,
    refetchOnReconnect: finalConfig.refetchOnReconnect,
    refetchIntervalInBackground: true,
  });

  // Refresh dashboard queries when statistics change
  useEffect(() => {
    if (statisticsQuery.data) {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  }, [statisticsQuery.data, queryClient]);

  const refreshDashboardKPIs = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['reports', 'statistics'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
  }, [queryClient]);

  return {
    statistics: statisticsQuery.data,
    isLoading: statisticsQuery.isLoading,
    error: statisticsQuery.error,
    isPolling: finalConfig.enabled && !statisticsQuery.isPaused,
    refresh: refreshDashboardKPIs,
  };
}

/**
 * Hook for coordinated polling of multiple report data sources
 * Useful for pages that need both reports list and statistics
 */
export function useCoordinatedReportsPolling(
  reportsFilters: ReportFilters = {},
  statisticsFilters: Pick<ReportFilters, 'dateFrom' | 'dateTo' | 'branchId'> = {},
  config: ReportsPollingConfig = {}
) {
  const reportsPolling = useReportsPolling(reportsFilters, config);
  const dashboardPolling = useDashboardKPIPolling(statisticsFilters, config);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      reportsPolling.refresh(),
      dashboardPolling.refresh(),
    ]);
  }, [reportsPolling, dashboardPolling]);

  return {
    // Reports data
    reports: reportsPolling.reports,
    reportsLoading: reportsPolling.reportsLoading,
    reportsError: reportsPolling.reportsError,
    
    // Statistics data
    statistics: dashboardPolling.statistics,
    statisticsLoading: dashboardPolling.isLoading,
    statisticsError: dashboardPolling.error,
    
    // Combined status
    isPolling: reportsPolling.isPolling || dashboardPolling.isPolling,
    getLastUpdate: reportsPolling.getLastUpdate,
    
    // Combined controls
    refresh: refreshAll,
    backgroundRefreshStatus: reportsPolling.backgroundRefreshStatus,
  };
}