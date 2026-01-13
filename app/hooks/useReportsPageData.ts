'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '@/lib/services/reports';
import { userProfileService } from '@/lib/services/userProfile';
import { useReportsPolling } from './useReportsPolling';
import type { 
  Report, 
  ReportStatistics, 
  ReportFilters as APIReportFilters,
  PaginatedResponse 
} from '@/lib/api/types';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';
import { DateRange } from 'react-day-picker';

export interface ReportsFilters {
  creditOfficer: string;
  reportStatus: string;
  reportType: string;
  dateFrom: string;
  dateTo: string;
}

export interface UseReportsPageDataConfig {
  userRole: 'branch_manager' | 'area_manager' | 'system_admin';
  itemsPerPage?: number;
  enablePolling?: boolean;
  pollingInterval?: number;
}

export interface UseReportsPageDataResult {
  // Data
  reports: Report[];
  reportStatistics: ReportStatistics | null;
  totalReports: number;
  
  // Loading states
  loading: boolean;
  statisticsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // User context
  userBranch: string | null;
  branchName: string;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  
  // Filters
  selectedPeriod: TimePeriod;
  setSelectedPeriod: (period: TimePeriod) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  appliedFilters: ReportsFilters;
  setAppliedFilters: (filters: ReportsFilters) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  
  // Polling status
  isPolling: boolean;
  lastUpdate: Date | null;
}

/**
 * Comprehensive hook for reports page data management with polling
 * Handles data fetching, filtering, pagination, and real-time updates
 */
export function useReportsPageData(config: UseReportsPageDataConfig): UseReportsPageDataResult {
  const {
    userRole,
    itemsPerPage = 10,
    enablePolling = true,
    pollingInterval = 30000, // 30 seconds
  } = config;

  const queryClient = useQueryClient();
  
  // UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('last_30_days');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [appliedFilters, setAppliedFilters] = useState<ReportsFilters>({
    creditOfficer: '',
    reportStatus: '',
    reportType: '',
    dateFrom: '',
    dateTo: '',
  });
  
  // User profile state
  const [userBranch, setUserBranch] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string>('Branch');

  // Load user profile
  const { data: userProfile, error: profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userProfileService.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Update user branch when profile loads
  useEffect(() => {
    if (userProfile) {
      setUserBranch(userProfile.branch || null);
      setBranchName(userProfile.branch || 'Branch');
    }
  }, [userProfile]);

  // Build API filters
  const apiFilters = useMemo((): APIReportFilters => {
    const filters: APIReportFilters = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // For branch managers, filter by their branch
    if (userRole === 'branch_manager' && userBranch) {
      filters.branchId = userBranch;
    }

    // Apply period filter
    if (selectedPeriod) {
      const now = new Date();
      let startDate: Date;

      switch (selectedPeriod) {
        case 'last_24_hours':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'last_7_days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last_30_days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
        default:
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 12);
          break;
      }

      filters.dateFrom = startDate.toISOString().split('T')[0];
    }

    // Apply custom date range filter
    if (dateRange?.from) {
      filters.dateFrom = dateRange.from.toISOString().split('T')[0];
      if (dateRange.to) {
        filters.dateTo = dateRange.to.toISOString().split('T')[0];
      }
    }

    // Apply advanced filters
    if (appliedFilters.creditOfficer) {
      filters.creditOfficerId = appliedFilters.creditOfficer;
    }
    if (appliedFilters.reportStatus) {
      filters.status = appliedFilters.reportStatus.toLowerCase();
    }
    if (appliedFilters.reportType) {
      filters.reportType = appliedFilters.reportType.toLowerCase() as 'daily' | 'weekly' | 'monthly';
    }

    return filters;
  }, [
    currentPage,
    itemsPerPage,
    userRole,
    userBranch,
    selectedPeriod,
    dateRange,
    appliedFilters,
  ]);

  // Statistics filters (for KPI polling)
  const statisticsFilters = useMemo(() => ({
    dateFrom: apiFilters.dateFrom,
    dateTo: apiFilters.dateTo,
    branchId: userRole === 'branch_manager' ? userBranch : undefined,
  }), [apiFilters.dateFrom, apiFilters.dateTo, userRole, userBranch]);

  // Use polling hook for real-time updates
  const pollingResult = useReportsPolling(apiFilters, {
    enabled: enablePolling && !!userProfile && (userRole !== 'branch_manager' || !!userBranch),
    pollingInterval,
    staleTime: 15000, // 15 seconds
  });

  // Query for branch-specific statistics (for branch managers)
  const branchStatisticsQuery = useQuery({
    queryKey: ['reports', 'branch-statistics', userBranch, statisticsFilters],
    queryFn: () => userBranch ? reportsService.getBranchReportStatistics(userBranch, statisticsFilters) : null,
    enabled: userRole === 'branch_manager' && !!userBranch && enablePolling,
    staleTime: 15000,
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: true,
  });

  // Determine which statistics to use
  const reportStatistics = userRole === 'branch_manager' 
    ? (branchStatisticsQuery.data || null)
    : (pollingResult.statistics || null);

  const statisticsLoading = userRole === 'branch_manager' 
    ? branchStatisticsQuery.isLoading 
    : pollingResult.statisticsLoading;

  // Manual refresh function
  const refreshData = useCallback(async () => {
    await Promise.all([
      pollingResult.refresh(),
      userRole === 'branch_manager' && userBranch 
        ? queryClient.invalidateQueries({ queryKey: ['reports', 'branch-statistics', userBranch] })
        : Promise.resolve(),
    ]);
  }, [pollingResult.refresh, queryClient, userRole, userBranch]);

  // Error handling
  const error = useMemo(() => {
    if (profileError) {
      return 'Failed to load user profile. Please try logging in again.';
    }
    if (userRole === 'branch_manager' && !userBranch && userProfile) {
      return 'Branch information not available. Please ensure you are logged in as a branch manager.';
    }
    if (pollingResult.reportsError) {
      return pollingResult.reportsError instanceof Error 
        ? pollingResult.reportsError.message 
        : 'Failed to load reports data';
    }
    if (userRole === 'branch_manager' && branchStatisticsQuery.error) {
      return branchStatisticsQuery.error instanceof Error 
        ? branchStatisticsQuery.error.message 
        : 'Failed to load branch statistics';
    }
    return null;
  }, [
    profileError,
    userRole,
    userBranch,
    userProfile,
    pollingResult.reportsError,
    branchStatisticsQuery.error,
  ]);

  return {
    // Data
    reports: pollingResult.reports?.data || [],
    reportStatistics,
    totalReports: pollingResult.reports?.pagination?.total || 0,
    
    // Loading states
    loading: pollingResult.reportsLoading || !userProfile,
    statisticsLoading,
    
    // Error states
    error,
    
    // User context
    userBranch,
    branchName,
    
    // Pagination
    currentPage,
    setCurrentPage,
    
    // Filters
    selectedPeriod,
    setSelectedPeriod,
    dateRange,
    setDateRange,
    appliedFilters,
    setAppliedFilters,
    
    // Actions
    refreshData,
    
    // Polling status
    isPolling: pollingResult.isPolling,
    lastUpdate: pollingResult.lastUpdate,
  };
}