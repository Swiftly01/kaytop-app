'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import { PerformanceStatisticsCard, PerformanceStatSection } from '@/app/_components/ui/PerformanceStatisticsCard';
import { PerformanceLeaderboard, LeaderboardEntry } from '@/app/_components/ui/PerformanceLeaderboard';
import Table, { BranchRecord } from '@/app/_components/ui/Table';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import AdvancedFiltersModal, { AdvancedFilters } from '@/app/_components/ui/AdvancedFiltersModal';
import { LeaderboardErrorBoundary, HQDashboardErrorBoundary } from '@/app/_components/ui/HQDashboardErrorBoundary';
import { DateRange } from 'react-day-picker';
import { dashboardService } from '@/lib/services/dashboard';
import { ratingsService } from '@/lib/services/ratings';
import { unifiedUserService } from '@/lib/services/unifiedUser';
import { extractValue } from '@/lib/utils/dataExtraction';
import { useAuth } from '@/app/context/AuthContext';

type TimePeriod = 'last_24_hours' | 'last_7_days' | 'last_30_days' | 'custom' | null;
type TabType = 'branches' | 'leaderboard';
type LeaderboardType = 'MONEY_DISBURSED' | 'LOAN_REPAYMENT' | 'SAVINGS';
type LeaderboardPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
type RatingPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export default function AMBranchesPage() {
  const router = useRouter();
  const { session } = useAuth();
  const { toasts, removeToast, success, error } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('branches');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(null);
  const [isCalculatingRatings, setIsCalculatingRatings] = useState(false);
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('MONEY_DISBURSED');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('MONTHLY');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof BranchRecord | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    region: '',
    coCountMin: '',
    coCountMax: '',
    customerCountMin: '',
    customerCountMax: '',
    dateFrom: '',
    dateTo: '',
  });

  // API data state
  const [branchData, setBranchData] = useState<BranchRecord[]>([]);
  const [branchStatistics, setBranchStatistics] = useState<StatSection[]>([]);
  const [performanceStatistics, setPerformanceStatistics] = useState<PerformanceStatSection[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch branch data from unified API
  const fetchBranchData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Fetch branches using branch service (same as System Admin)
      const { branchService } = await import('@/lib/services/branches');
      const branchesResponse = await branchService.getAllBranches({ limit: 1000 });

      // Get user counts for each branch
      const branchRecordsWithCounts = await Promise.all(
        branchesResponse.data.map(async (branch) => {
          try {
            const { userService } = await import('@/lib/services/users');
            const branchUsers = await userService.getUsersByBranch(branch.name, { page: 1, limit: 1000 });
            const usersData = branchUsers?.data || [];
            const creditOfficers = usersData.filter(user => user.role === 'credit_officer');
            const customers = usersData.filter(user => user.role === 'customer');

            return {
              id: branch.id,
              branchId: `ID: ${branch.code}`,
              name: branch.name,
              cos: creditOfficers.length.toString(),
              customers: customers.length,
              dateCreated: branch.dateCreated.split('T')[0]
            };
          } catch (error: any) {
            // Log warning but don't fail - return record with zero counts
            const errorMsg = error?.message || 'Unknown error';
            const statusCode = error?.response?.status || error?.status;
            console.warn(`Failed to get user counts for branch "${branch.name}" (${statusCode || 'no status'}): ${errorMsg}`);

            return {
              id: branch.id,
              branchId: `ID: ${branch.code}`,
              name: branch.name,
              cos: '0',
              customers: 0,
              dateCreated: branch.dateCreated.split('T')[0]
            };
          }
        })
      );

      // Apply time period and date range filters
      let filteredBranches = branchRecordsWithCounts;
      if (selectedPeriod || dateRange) {
        const { filterByTimePeriod, filterByDateRange } = await import('@/lib/utils/dateFilters');

        if (selectedPeriod && selectedPeriod !== 'custom') {
          // Apply preset time period filter
          filteredBranches = filterByTimePeriod(branchRecordsWithCounts, 'dateCreated', selectedPeriod);
        } else if (dateRange) {
          // Apply custom date range filter
          filteredBranches = filterByDateRange(branchRecordsWithCounts, 'dateCreated', dateRange);
        }
      }

      setBranchData(filteredBranches);

      // Fetch unified dashboard statistics
      const dashboardData = await dashboardService.getKPIs();
      const stats: StatSection[] = [
        {
          label: 'All Branches',
          value: extractValue(dashboardData.branches.value, 0) as number,
          change: extractValue(dashboardData.branches.change, 0) as number,
          changeLabel: extractValue(dashboardData.branches.changeLabel, 'No change this month') as string,
          isCurrency: extractValue(dashboardData.branches.isCurrency, false) as boolean,
        },
        {
          label: "All CO's",
          value: extractValue(dashboardData.creditOfficers.value, 0) as number,
          change: extractValue(dashboardData.creditOfficers.change, 0) as number,
          changeLabel: extractValue(dashboardData.creditOfficers.changeLabel, 'No change this month') as string,
          isCurrency: extractValue(dashboardData.creditOfficers.isCurrency, false) as boolean,
        },
        {
          label: 'All Customers',
          value: extractValue(dashboardData.customers.value, 0) as number,
          change: extractValue(dashboardData.customers.change, 0) as number,
          changeLabel: extractValue(dashboardData.customers.changeLabel, 'No change this month') as string,
          isCurrency: extractValue(dashboardData.customers.isCurrency, false) as boolean,
        },
        {
          label: 'Active Loans',
          value: extractValue(dashboardData.activeLoans.value, 0) as number,
          change: extractValue(dashboardData.activeLoans.change, 0) as number,
          changeLabel: extractValue(dashboardData.activeLoans.changeLabel, 'No change this month') as string,
          isCurrency: extractValue(dashboardData.activeLoans.isCurrency, false) as boolean,
        },
      ];
      setBranchStatistics(stats);

      // Fetch performance statistics for leaderboard
      await fetchPerformanceStatistics();

    } catch (err) {
      console.error('Failed to fetch branch data:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load branch data');
      error('Failed to load branch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch performance statistics for leaderboard
  const fetchPerformanceStatistics = async () => {
    try {
      // Fetch real performance data using ratings API
      const leaderboardData = await ratingsService.getLeaderboard({
        type: leaderboardType,
        period: leaderboardPeriod,
        limit: 3 // Get top 3 for performance cards
      });

      // Transform leaderboard data to performance statistics format
      const performanceStats: PerformanceStatSection[] = [];

      // Get top performers for each metric type
      const savingsLeader = await ratingsService.getLeaderboard({
        type: 'SAVINGS',
        period: leaderboardPeriod,
        limit: 1
      });

      const disbursementLeader = await ratingsService.getLeaderboard({
        type: 'MONEY_DISBURSED',
        period: leaderboardPeriod,
        limit: 1
      });

      const repaymentLeader = await ratingsService.getLeaderboard({
        type: 'LOAN_REPAYMENT',
        period: leaderboardPeriod,
        limit: 1
      });

      // Create performance statistics from real data
      if (savingsLeader.length > 0) {
        performanceStats.push({
          label: 'Top by Savings',
          branchName: savingsLeader[0].branchName,
          value: savingsLeader[0].savingsScore || 0,
          change: 0, // Change percentage not available in current API
          isCurrency: true,
          rank: 1
        });
      }

      if (disbursementLeader.length > 0) {
        performanceStats.push({
          label: 'Top by Loan Disbursement',
          branchName: disbursementLeader[0].branchName,
          value: disbursementLeader[0].disbursementScore || 0,
          change: 0, // Change percentage not available in current API
          isCurrency: true,
          rank: 1
        });
      }

      if (repaymentLeader.length > 0) {
        performanceStats.push({
          label: 'Top by Loan Repayment',
          branchName: repaymentLeader[0].branchName,
          value: repaymentLeader[0].repaymentScore || 0,
          change: 0, // Change percentage not available in current API
          isCurrency: true,
          rank: 1
        });
      }
      
      setPerformanceStatistics(performanceStats);

      // Fetch full leaderboard data
      const fullLeaderboard = await ratingsService.getLeaderboard({
        type: leaderboardType,
        period: leaderboardPeriod,
        limit: 10
      });

      // Transform to LeaderboardEntry format
      const transformedLeaderboard: LeaderboardEntry[] = fullLeaderboard.map((rating, index) => ({
        rank: index + 1,
        branchName: rating.branchName,
        branchId: `ID: ${rating.branchId || rating.branchName.substring(0, 3).toUpperCase()}`,
        value: getValueForType(rating, leaderboardType),
        change: 0, // Change percentage not available in current API
        isCurrency: true
      }));
      
      setLeaderboardData(transformedLeaderboard);
    } catch (err) {
      console.error('Failed to fetch performance statistics:', err);
      // Graceful degradation - show empty data but keep UI functional
      setPerformanceStatistics([]);
      setLeaderboardData([]);
      
      // Only show error toast if it's a critical failure
      if (err instanceof Error && err.message.includes('Access denied')) {
        error('Access denied: You need HQ manager permissions to view performance data.');
      }
      // For other errors, fail silently to avoid disrupting the user experience
    }
  };

  // Helper function to get the appropriate value based on leaderboard type
  const getValueForType = (rating: any, type: LeaderboardType): number => {
    switch (type) {
      case 'SAVINGS':
        return rating.savingsScore || rating.totalSavings || 0;
      case 'MONEY_DISBURSED':
        return rating.disbursementScore || rating.totalDisbursed || 0;
      case 'LOAN_REPAYMENT':
        return rating.repaymentScore || rating.totalRepaid || 0;
      default:
        return rating.overallScore || 0;
    }
  };

  // Handle ratings calculation
  const handleCalculateRatings = async () => {
    try {
      setIsCalculatingRatings(true);
      
      // Determine the period and date for calculation
      const period = selectedPeriod === 'last_24_hours' ? 'DAILY' : 
                    selectedPeriod === 'last_7_days' ? 'WEEKLY' :
                    selectedPeriod === 'last_30_days' ? 'MONTHLY' : 
                    leaderboardPeriod; // Use current leaderboard period
      
      const periodDate = dateRange?.from ? 
        dateRange.from.toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
      
      // Call ratings calculation API
      const result = await ratingsService.calculateRatings({
        period: period as RatingPeriod,
        periodDate: periodDate
      });
      
      if (result.success) {
        success('Ratings calculated successfully!');
        
        // Refresh performance statistics after calculation
        await fetchPerformanceStatistics();
      } else {
        error(result.error || 'Failed to calculate ratings. Please try again.');
      }
      
    } catch (err) {
      console.error('Failed to calculate ratings:', err);
      error('Failed to calculate ratings. Please try again.');
    } finally {
      setIsCalculatingRatings(false);
    }
  };

  const handleLeaderboardRowClick = (entry: LeaderboardEntry) => {
    // Navigate to branch details - extract ID from branchId
    const id = entry.branchId.replace('ID: ', '').toLowerCase();
    router.push(`/dashboard/am/branches/${id}`);
  };

  const handleApplyLeaderboardFilters = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real leaderboard data using ratings API
      const leaderboardData = await ratingsService.getLeaderboard({
        type: leaderboardType,
        period: leaderboardPeriod,
        limit: 10
      });

      // Transform to LeaderboardEntry format
      const transformedData: LeaderboardEntry[] = leaderboardData.map((rating, index) => ({
        rank: index + 1,
        branchName: rating.branchName,
        branchId: `ID: ${rating.branchId || rating.branchName.substring(0, 3).toUpperCase()}`,
        value: getValueForType(rating, leaderboardType),
        change: 0, // Change percentage not available in current API
        isCurrency: true
      }));
      
      setLeaderboardData(transformedData);
      success(`Leaderboard updated for ${leaderboardType.replace('_', ' ').toLowerCase()} - ${leaderboardPeriod.toLowerCase()}`);
      
    } catch (err) {
      console.error('Failed to apply leaderboard filters:', err);
      
      // Graceful degradation - keep existing data if available
      if (leaderboardData.length === 0) {
        // Only show error if we have no data to fall back to
        error('Failed to update leaderboard. Please try again.');
      } else {
        // Silently fail but log the error
        console.warn('Leaderboard update failed, keeping existing data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data - only when authenticated
  useEffect(() => {
    if (session) {
      console.log('🔐 Authentication confirmed, loading branch data...');
      fetchBranchData();
    } else {
      console.log('❌ Not authenticated, redirecting to login...');
      router.push('/auth/bm/login');
    }
  }, [session, router]);

  // Background refresh for leaderboard data every 5 minutes
  useEffect(() => {
    if (activeTab === 'leaderboard' && session) {
      const refreshInterval = setInterval(() => {
        console.log('🔄 Background refresh: Updating leaderboard data...');
        fetchPerformanceStatistics();
      }, 300000); // 5 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [activeTab, session, leaderboardType, leaderboardPeriod]); // Add dependencies to refresh when filters change

  const handleRowClick = (row: any) => {
    // Extract the ID from the row object
    router.push(`/dashboard/am/branches/${row.id}`);
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    // Clear custom date range when selecting a preset period
    if (period !== 'custom') {
      setDateRange(undefined);
    }
    // Refetch data with the new period filter
    fetchBranchData();
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // When a custom date range is selected, set period to 'custom'
    if (range) {
      setSelectedPeriod('custom');
    }
    // Refetch data with the new date range
    fetchBranchData();
  };

  const handleFilterClick = () => {
    setIsAdvancedFiltersOpen(true);
  };

  const handleApplyAdvancedFilters = (filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    setCurrentPage(1); // Reset to first page

    const activeCount = Object.values(filters).filter((v) => v !== '').length;
    if (activeCount > 0) {
      success(`${activeCount} filter${activeCount > 1 ? 's' : ''} applied successfully!`);
    }
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedBranches(selectedIds);
    console.log('Selected branches:', selectedIds);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    
    // If on leaderboard tab, debounce search to avoid excessive API calls
    if (activeTab === 'leaderboard') {
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        handleLeaderboardSearch(newQuery);
      }, 500); // 500ms debounce
    }
  };

  // Add ref for search timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
    
    // If on leaderboard tab, reset search results
    if (activeTab === 'leaderboard') {
      handleLeaderboardSearch('');
    }
  };

  const handleLeaderboardSearch = async (query: string) => {
    if (!query.trim()) {
      // Reset to full leaderboard data
      await handleApplyLeaderboardFilters();
      return;
    }

    try {
      // Search for specific branch using ratings API
      const searchResults: LeaderboardEntry[] = [];
      
      try {
        // Try to get specific branch rating
        const branchRating = await ratingsService.getBranchRating(query.trim(), leaderboardPeriod, leaderboardType);
        
        if (branchRating) {
          searchResults.push({
            rank: branchRating.rank || 1,
            branchName: branchRating.branchName,
            branchId: `ID: ${branchRating.branchId || branchRating.branchName.substring(0, 3).toUpperCase()}`,
            value: getValueForType(branchRating, leaderboardType),
            change: 0, // Change percentage not available in current API
            isCurrency: true
          });
        }
      } catch (branchError) {
        // If specific branch search fails, filter existing leaderboard data
        const filteredData = leaderboardData.filter(entry =>
          entry.branchName.toLowerCase().includes(query.toLowerCase()) ||
          entry.branchId.toLowerCase().includes(query.toLowerCase())
        );
        searchResults.push(...filteredData);
      }

      // If no results found, show message
      if (searchResults.length === 0) {
        setLeaderboardData([]);
      } else {
        setLeaderboardData(searchResults);
      }
    } catch (err) {
      console.error('Failed to search leaderboard:', err);
      
      // Graceful degradation - keep existing data if search fails
      if (leaderboardData.length > 0) {
        console.warn('Search failed, keeping existing leaderboard data');
      } else {
        error('Failed to search branches. Please try again.');
      }
    }
  };

  const handleSort = (column: string) => {
    const col = column as keyof BranchRecord;
    if (sortColumn === col) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // Filter branches based on search query and advanced filters
  const filteredBranches = branchData.filter((branch) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        branch.name.toLowerCase().includes(query) ||
        branch.branchId.toLowerCase().includes(query) ||
        branch.id.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Advanced filters
    // Region filter (would need region data in branch records)
    if (advancedFilters.region) {
      // TODO: Add region field to branch data
      // For now, skip this filter
    }

    // CO Count filter
    const coCount = parseInt(branch.cos.replace('%', '')) || 0;
    if (advancedFilters.coCountMin && coCount < parseInt(advancedFilters.coCountMin)) {
      return false;
    }
    if (advancedFilters.coCountMax && coCount > parseInt(advancedFilters.coCountMax)) {
      return false;
    }

    // Customer Count filter
    if (advancedFilters.customerCountMin && branch.customers < parseInt(advancedFilters.customerCountMin)) {
      return false;
    }
    if (advancedFilters.customerCountMax && branch.customers > parseInt(advancedFilters.customerCountMax)) {
      return false;
    }

    // Date range filter
    const branchDate = new Date(branch.dateCreated).getTime();
    if (advancedFilters.dateFrom) {
      const fromDate = new Date(advancedFilters.dateFrom).getTime();
      if (branchDate < fromDate) return false;
    }
    if (advancedFilters.dateTo) {
      const toDate = new Date(advancedFilters.dateTo).getTime();
      if (branchDate > toDate) return false;
    }

    return true;
  });

  // Sort filtered branches
  const sortedBranches = [...filteredBranches].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    // Handle different data types
    if (sortColumn === 'customers') {
      // Numeric comparison
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    } else if (sortColumn === 'dateCreated') {
      // Date comparison
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    } else {
      // String comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedBranches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBranches = sortedBranches.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  // Redirect to login if not authenticated (this should be handled by middleware, but just in case)
  if (!session) {
    return null;
  }

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          <div>
            {/* Page Header */}
            <div className="mb-12 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  Branch Overview
                </h1>
                <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)', opacity: 0.5 }}>
                  Monitor and manage branch performance
                </p>
              </div>
            </div>

            {/* Filter Controls */}
            <div style={{ marginBottom: '56px' }}>
              <FilterControls
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
                onDateRangeChange={handleDateRangeChange}
                onFilter={handleFilterClick}
                additionalButtons={
                  activeTab === 'leaderboard' ? (
                    <button
                      onClick={handleCalculateRatings}
                      disabled={isCalculatingRatings}
                      className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 border rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex-1 sm:flex-initial justify-center focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                        isCalculatingRatings
                          ? 'bg-gray-50 border-[#D0D5DD] text-gray-400 cursor-not-allowed'
                          : 'bg-white border-[#D0D5DD] text-[#344054] hover:bg-gray-50 active:bg-gray-100'
                      }`}
                      style={{
                        boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                      }}
                      aria-label="Calculate performance ratings"
                    >
                      {isCalculatingRatings ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          Calculating...
                        </>
                      ) : (
                        'Calculate Ratings'
                      )}
                    </button>
                  ) : null
                }
              />
            </div>

            {/* Statistics Card */}
            <div className="w-full max-w-[1091px]" style={{ marginBottom: '48px' }}>
              {isLoading ? (
                <StatisticsCardSkeleton />
              ) : apiError ? (
                <div className="bg-white rounded-lg border border-[#EAECF0] p-6">
                  <div className="text-center">
                    <p className="text-[#E43535] mb-2">Failed to load statistics</p>
                    <button
                      onClick={() => fetchBranchData()}
                      className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : activeTab === 'branches' ? (
                <StatisticsCard sections={branchStatistics} />
              ) : (
                <PerformanceStatisticsCard sections={performanceStatistics} />
              )}
            </div>

            {/* Tab Navigation and Search */}
            <div className="pl-4 flex items-center justify-between" style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-8">
                {/* Tab Navigation */}
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setActiveTab('branches');
                      setSearchQuery(''); // Clear search when switching tabs
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'branches'
                        ? 'bg-[#7F56D9] text-white'
                        : 'text-[#475467] hover:text-[#344054] hover:bg-gray-50'
                    }`}
                  >
                    Branches
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('leaderboard');
                      setSearchQuery(''); // Clear search when switching tabs
                    }}
                    className={`ml-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'leaderboard'
                        ? 'bg-[#7F56D9] text-white'
                        : 'text-[#475467] hover:text-[#344054] hover:bg-gray-50'
                    }`}
                  >
                    Leaderboard
                  </button>
                </div>
              </div>

              {/* Search Input - Show for both tabs but with different functionality */}
              <div className="relative w-[320px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                      stroke="#667085"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={activeTab === 'branches' ? "Search by Name or ID..." : "Search branches by name..."}
                  className="w-full pl-10 pr-10 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    border: '1px solid var(--color-border-gray-300)',
                    '--tw-ring-color': 'var(--color-primary-600)'
                  } as React.CSSProperties}
                  aria-label={activeTab === 'branches' ? "Search branches" : "Search leaderboard"}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label="Clear search"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="#667085"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'branches' ? (
              /* Branches Table */
              <div className="max-w-[1041px]">
                {isLoading ? (
                  <TableSkeleton rows={itemsPerPage} />
                ) : paginatedBranches.length > 0 ? (
                  <>
                    <Table
                      data={paginatedBranches}
                      tableType="branches"
                      onSelectionChange={handleSelectionChange}
                      onRowClick={handleRowClick}
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />

                    {/* Pagination Controls */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#475467]">
                          Showing {startIndex + 1}-{Math.min(endIndex, sortedBranches.length)} of {sortedBranches.length} results
                        </span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                          className="px-3 py-1.5 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                          aria-label="Items per page"
                        >
                          <option value={10}>10 per page</option>
                          <option value={25}>25 per page</option>
                          <option value={50}>50 per page</option>
                        </select>
                      </div>

                      <Pagination
                        totalPages={totalPages}
                        page={currentPage}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-lg border border-[#EAECF0] p-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No branches found
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {searchQuery ? `No branches match your search "${searchQuery}"` : 'No branches available'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="px-4 py-2 text-sm font-medium text-[#7F56D9] hover:text-[#6941C6] transition-colors"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Leaderboard Content */
              <LeaderboardErrorBoundary>
                <div className="max-w-[1041px]">
                  {/* Leaderboard Filters */}
                  <div className="mb-6 p-4 bg-white rounded-lg border border-[#EAECF0]">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Type Filter */}
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-[#344054] mb-2">
                            Performance Type
                          </label>
                          <select
                            value={leaderboardType}
                            onChange={(e) => setLeaderboardType(e.target.value as LeaderboardType)}
                            className="px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] min-w-[180px]"
                          >
                            <option value="MONEY_DISBURSED">Money Disbursed</option>
                            <option value="LOAN_REPAYMENT">Loan Repayment</option>
                            <option value="SAVINGS">Savings</option>
                          </select>
                        </div>

                        {/* Period Filter */}
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-[#344054] mb-2">
                            Time Period
                          </label>
                          <select
                            value={leaderboardPeriod}
                            onChange={(e) => setLeaderboardPeriod(e.target.value as LeaderboardPeriod)}
                            className="px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] min-w-[120px]"
                          >
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="QUARTERLY">Quarterly</option>
                            <option value="YEARLY">Yearly</option>
                          </select>
                        </div>
                      </div>

                      {/* Apply Filters Button */}
                      <button
                        onClick={handleApplyLeaderboardFilters}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isLoading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#7F56D9] text-white hover:bg-[#6941C6]'
                        }`}
                      >
                        {isLoading ? 'Loading...' : 'Apply Filters'}
                      </button>
                    </div>
                  </div>

                  <PerformanceLeaderboard
                    entries={leaderboardData}
                    title={`Branch Performance Leaderboard - ${leaderboardType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} (${leaderboardPeriod.toLowerCase()})`}
                    isLoading={isLoading}
                    onRowClick={handleLeaderboardRowClick}
                  />
                </div>
              </LeaderboardErrorBoundary>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        onApply={handleApplyAdvancedFilters}
        currentFilters={advancedFilters}
      />
    </div>
  );
}
