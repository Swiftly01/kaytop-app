'use client';

import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { StatisticsCard } from "@/app/_components/ui/StatisticsCard";
import { PerformanceCard } from "@/app/_components/ui/PerformanceCard";
import FilterControls from "@/app/_components/ui/FilterControls";
import type { TimePeriod } from "@/app/_components/ui/FilterControls";
import TabNavigation from "@/app/_components/ui/TabNavigation";
import Table from "@/app/_components/ui/Table";
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import Pagination from '@/app/_components/ui/Pagination';
import { EmptyState } from '@/app/_components/ui/EmptyState';
import { DashboardFiltersModal, DashboardFilters } from '@/app/_components/ui/DashboardFiltersModal';
import { dashboardService } from '@/lib/services/dashboard';
import type { DashboardKPIs, DashboardParams } from '@/lib/api/types';

import {
  useDisbursementsQuery,
  useRecollectionsQuery,
  useSavingsQuery,
  useMissedPaymentsQuery
} from './queries/useSystemAdminQueries';

type TabValue = 'disbursements' | 're-collections' | 'savings' | 'missed-payments';

export default function SystemAdminDashboard() {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last_30_days');
  const [activeTab, setActiveTab] = useState<TabValue>('disbursements');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<DashboardFilters | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardKPIs | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Ensure client-side rendering for interactive elements
  useEffect(() => {
    setIsClient(true);
    setMounted(true);
  }, []);

  // Function to fetch dashboard data
  const fetchDashboardData = async (params?: DashboardParams) => {
    try {
      setIsLoading(true);
      setDashboardError(null);

      const data = await dashboardService.getKPIs(params);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      showError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handler for date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);

    const params: DashboardParams = {};

    if (range?.from && range?.to) {
      params.timeFilter = 'custom';
      params.startDate = range.from.toISOString().split('T')[0];
      params.endDate = range.to.toISOString().split('T')[0];
    }

    fetchDashboardData(params);

    if (range?.from && range?.to) {
      success('Date range filter applied successfully!');
    }
  };

  // Handler for time period changes
  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);

    const params: DashboardParams = {};

    if (period && period !== 'custom') {
      // Map period to API timeFilter values
      const timeFilterMap: Record<string, DashboardParams['timeFilter']> = {
        'last_24_hours': 'last_24_hours',
        'last_7_days': 'last_7_days',
        'last_30_days': 'last_30_days',
      };

      params.timeFilter = timeFilterMap[period];
    }

    // Clear date range when using predefined periods
    if (period !== 'custom') {
      setDateRange(undefined);
    }

    fetchDashboardData(params);
  };

  // Handler for filter button click
  const handleFilterClick = () => {
    setShowFiltersModal(true);
  };

  // Handler for applying advanced filters
  const handleApplyFilters = (filters: DashboardFilters) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page

    const filterCount =
      filters.branches.length +
      filters.creditOfficers.length +
      filters.loanStatus.length +
      (filters.amountRange.min > 0 || filters.amountRange.max < 1000000 ? 1 : 0);

    success(`${filterCount} filter${filterCount > 1 ? 's' : ''} applied successfully!`);
  };

  // Handler for clearing filters
  const handleClearFilters = () => {
    setActiveFilters(null);
    success('All filters cleared!');
  };

  // Handler for tab changes
  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
    setSearchQuery(''); // Clear search when changing tabs
    console.log('Active tab changed to:', tab);
  };

  // Handler for page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler for selection changes
  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedRows(selectedIds);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;

    console.log('Bulk deleting:', selectedRows);
    // TODO: Implement bulk delete API call

    success(`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} deleted successfully!`);
    setSelectedRows([]);
  };

  const handleBulkExport = () => {
    if (selectedRows.length === 0) return;

    console.log('Bulk exporting:', selectedRows);
    // TODO: Implement bulk export functionality

    success(`Exporting ${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}...`);
  };

  // Transform dashboard data for UI components
  const getTopCardSections = () => {
    if (!dashboardData) return [];

    // Debug: Log the dashboard data structure
    console.log('🔍 Dashboard data structure:', JSON.stringify(dashboardData, null, 2));

    // Helper function to safely extract values from the data structure
    const extractValue = (data: any) => {
      // The data structure from accurateDashboard is: { value, change, changeLabel, isCurrency }
      if (data && typeof data === 'object' && 'value' in data) {
        return {
          value: data.value || 0,
          change: data.change || 0,
          changeLabel: data.changeLabel || '',
          isCurrency: data.isCurrency || false,
        };
      }
      // Fallback
      return {
        value: 0,
        change: 0,
        changeLabel: '',
        isCurrency: false,
      };
    };

    return [
      {
        label: "All Branches",
        ...extractValue(dashboardData.branches),
      },
      {
        label: "All CO's",
        ...extractValue(dashboardData.creditOfficers),
      },
      {
        label: "All Customers",
        ...extractValue(dashboardData.customers),
      },
      {
        label: "Loans Processed",
        ...extractValue(dashboardData.loansProcessed),
      },
    ];
  };

  const getMiddleCardSections = () => {
    if (!dashboardData) return [];

    // Helper function to safely extract values from the data structure
    const extractValue = (data: any) => {
      // The data structure from accurateDashboard is: { value, change, changeLabel, isCurrency }
      if (data && typeof data === 'object' && 'value' in data) {
        return {
          value: data.value || 0,
          change: data.change || 0,
          changeLabel: data.changeLabel || '',
          isCurrency: data.isCurrency || false,
        };
      }
      // Fallback
      return {
        value: 0,
        change: 0,
        changeLabel: '',
        isCurrency: false,
      };
    };

    return [
      {
        label: "Total Loan",
        ...extractValue(dashboardData.loanAmounts),
      },
      {
        label: "Active Loans",
        ...extractValue(dashboardData.activeLoans),
      },
      {
        label: "Missed Payments",
        ...extractValue(dashboardData.missedPayments),
      },
    ];
  };

  // Real backend data queries
  const { data: disbursementsData, isLoading: disbursementsLoading, error: disbursementsError } = useDisbursementsQuery(currentPage, itemsPerPage);
  const { data: recollectionsData, isLoading: recollectionsLoading, error: recollectionsError } = useRecollectionsQuery(currentPage, itemsPerPage);
  const { data: savingsData, isLoading: savingsLoading, error: savingsError } = useSavingsQuery(currentPage, itemsPerPage);
  const { data: missedPaymentsData, isLoading: missedPaymentsLoading, error: missedPaymentsError } = useMissedPaymentsQuery(currentPage, itemsPerPage);

  // Handler for sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Get current tab data from real backend queries
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'disbursements':
        return {
          data: disbursementsData?.data || [],
          loading: disbursementsLoading,
          error: disbursementsError,
          pagination: disbursementsData?.pagination
        };
      case 're-collections':
        return {
          data: recollectionsData?.data || [],
          loading: recollectionsLoading,
          error: recollectionsError,
          pagination: recollectionsData?.pagination
        };
      case 'savings':
        return {
          data: savingsData?.data || [],
          loading: savingsLoading,
          error: savingsError,
          pagination: savingsData?.pagination
        };
      case 'missed-payments':
        return {
          data: missedPaymentsData?.data || [],
          loading: missedPaymentsLoading,
          error: missedPaymentsError,
          pagination: missedPaymentsData?.pagination
        };
      default:
        return {
          data: [],
          loading: false,
          error: null,
          pagination: null
        };
    }
  };

  const currentTabInfo = getCurrentTabData();
  const currentTabData = currentTabInfo.data;
  const tabDataLoading = currentTabInfo.loading;
  const tabDataError = currentTabInfo.error;

  // Apply search filter to current tab data
  let filteredData = searchQuery
    ? currentTabData.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        ('loanId' in item && item.loanId && item.loanId.toLowerCase().includes(searchLower)) ||
        ('accountId' in item && item.accountId && item.accountId.toLowerCase().includes(searchLower)) ||
        ('name' in item && item.name && item.name.toLowerCase().includes(searchLower)) ||
        ('status' in item && item.status && item.status.toLowerCase().includes(searchLower))
      );
    })
    : currentTabData;

  // Apply advanced filters
  if (activeFilters) {
    filteredData = filteredData.filter(item => {
      // Filter by loan status
      if (activeFilters.loanStatus.length > 0 && item.status) {
        if (!activeFilters.loanStatus.includes(item.status)) {
          return false;
        }
      }

      // Filter by amount range
      if (item.amount) {
        const amountValue = parseInt(item.amount.replace(/[^0-9]/g, ''));
        if (amountValue < activeFilters.amountRange.min || amountValue > activeFilters.amountRange.max) {
          return false;
        }
      }

      return true;
    });
  }

  // Apply sorting
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof typeof a];
      let bValue: any = b[sortColumn as keyof typeof b];

      // Handle different data types
      if (sortColumn === 'loanId' || sortColumn === 'accountId') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (sortColumn === 'amount') {
        // Extract numeric value from amount string (e.g., "NGN87,000" -> 87000)
        aValue = parseInt(aValue?.replace(/[^0-9]/g, '') || '0');
        bValue = parseInt(bValue?.replace(/[^0-9]/g, '') || '0');
      } else if (sortColumn === 'interest') {
        // Extract numeric value from percentage (e.g., "7.25%" -> 7.25)
        aValue = parseFloat(aValue?.replace('%', '') || '0');
        bValue = parseFloat(bValue?.replace('%', '') || '0');
      } else if (sortColumn === 'dateDisbursed' || sortColumn === 'dateCollected' || sortColumn === 'dateCreated' || sortColumn === 'dueDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else if (sortColumn === 'daysMissed') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      // Compare values
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    })
    : filteredData;

  // For backend pagination, we use the data as-is since pagination is handled by the API
  // The filteredData here is just for client-side search/filter, but pagination comes from backend
  const totalPages = currentTabInfo.pagination?.totalPages || Math.ceil(sortedData.length / itemsPerPage);
  const totalItems = currentTabInfo.pagination?.total || sortedData.length;

  // Use backend paginated data if available, otherwise use client-side pagination
  const paginatedData = currentTabInfo.pagination ? currentTabData : sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="drawer-content flex flex-col min-h-screen">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          {/* Page Header - Position: y:110px (Overview), y:150px (Osun State) */}
          <header>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>Overview</h1>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)', opacity: 0.5, marginBottom: '48px' }}>
              Osun State
            </p>
          </header>

          {/* Filter Controls - Position: y:198px */}
          <div style={{ marginBottom: '56px' }}>
            <FilterControls
              selectedPeriod={timePeriod}
              onDateRangeChange={handleDateRangeChange}
              onPeriodChange={handleTimePeriodChange}
              onFilter={handleFilterClick}
            />
          </div>

          {/* Statistics Section - First card at y:254px */}
          <section className="space-y-4 sm:space-y-6" aria-label="Dashboard statistics">
            {/* Top Statistics Card - 4 sections */}
            <div className="w-full max-w-[1091px]">
              {isLoading ? (
                <StatisticsCardSkeleton />
              ) : dashboardError ? (
                <div className="bg-white rounded-lg border border-[#EAECF0] p-6">
                  <div className="text-center">
                    <p className="text-[#E43535] mb-2">Failed to load statistics</p>
                    <button
                      onClick={() => fetchDashboardData()}
                      className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : (
                <StatisticsCard sections={getTopCardSections()} />
              )}
            </div>

            {/* Middle Statistics Card - 3 sections */}
            <div className="w-full max-w-[833px]">
              {isLoading ? (
                <StatisticsCardSkeleton />
              ) : dashboardError ? (
                <div className="bg-white rounded-lg border border-[#EAECF0] p-6">
                  <div className="text-center">
                    <p className="text-[#E43535] mb-2">Failed to load statistics</p>
                    <button
                      onClick={() => fetchDashboardData()}
                      className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : (
                <StatisticsCard sections={getMiddleCardSections()} />
              )}
            </div>

            {/* Performance Cards */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-6 sm:mt-8">
              {/* Card 3 - Top 3 Best performing branch */}
              {isLoading ? (
                <div className="w-full md:w-[400px] h-[312px] bg-white rounded-lg border border-[#EAECF0] p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : dashboardError ? (
                <div className="w-full md:w-[400px] h-[312px] bg-white rounded-lg border border-[#EAECF0] p-6 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[#E43535] mb-2">Failed to load performance data</p>
                    <button
                      onClick={() => fetchDashboardData()}
                      className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : (
                <PerformanceCard
                  title="Top 3 Best performing branch"
                  branches={dashboardData?.bestPerformingBranches || []}
                />
              )}

              {/* Card 4 - Top 3 worst performing branch */}
              {isLoading ? (
                <div className="w-full md:w-[400px] h-[312px] bg-white rounded-lg border border-[#EAECF0] p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : dashboardError ? (
                <div className="w-full md:w-[400px] h-[312px] bg-white rounded-lg border border-[#EAECF0] p-6 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[#E43535] mb-2">Failed to load performance data</p>
                    <button
                      onClick={() => fetchDashboardData()}
                      className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : (
                <PerformanceCard
                  title="Top 3 worst performing branch"
                  branches={dashboardData?.worstPerformingBranches || []}
                />
              )}
            </div>
          </section>

          {/* Tab Navigation */}
          <div className="mt-8">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Search Bar */}
          <div className="mt-6 mb-4">
            <div className="relative max-w-md">
              {mounted ? (
                <>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    placeholder="Search by Loan ID, Name, or Status..."
                    className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-transparent"
                    aria-label="Search loans"
                    suppressHydrationWarning
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#344054] transition-colors"
                      aria-label="Clear search"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-[#D0D5DD] rounded-lg bg-gray-50 h-10 flex items-center">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-[#98A2B3] ml-7">Loading search...</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Chips */}
          {mounted && activeFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-[#475467]">Active filters:</span>
              {activeFilters.branches.map((branch) => (
                <span
                  key={branch}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#F4F3FF] text-[#5925DC] text-sm rounded-full"
                >
                  {branch}
                  <button
                    onClick={() => {
                      setActiveFilters({
                        ...activeFilters,
                        branches: activeFilters.branches.filter(b => b !== branch),
                      });
                    }}
                    className="hover:text-[#42307D]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {activeFilters.loanStatus.map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#F4F3FF] text-[#5925DC] text-sm rounded-full"
                >
                  {status}
                  <button
                    onClick={() => {
                      setActiveFilters({
                        ...activeFilters,
                        loanStatus: activeFilters.loanStatus.filter(s => s !== status),
                      });
                    }}
                    className="hover:text-[#42307D]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearFilters}
                className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {mounted && selectedRows.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-4 bg-[#F4F3FF] border border-[#7F56D9] rounded-lg">
              <span className="text-sm font-medium text-[#5925DC]">
                {selectedRows.length} item{selectedRows.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkExport}
                  className="px-4 py-2 text-sm font-medium text-[#7F56D9] bg-white border border-[#7F56D9] rounded-lg hover:bg-[#F4F3FF] transition-colors"
                >
                  Export Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#E43535] rounded-lg hover:bg-[#C92A2A] transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Data Table - Card 5 */}
          <section
            className="mt-6"
            role="tabpanel"
            id={`${activeTab}-panel`}
            aria-labelledby={`${activeTab}-tab`}
          >
            {tabDataLoading ? (
              <TableSkeleton rows={itemsPerPage} />
            ) : tabDataError ? (
              <div className="bg-white rounded-lg border border-[#EAECF0] p-8">
                <div className="text-center">
                  <p className="text-[#E43535] mb-2">Failed to load {activeTab.replace('-', ' ')} data</p>
                  <p className="text-sm text-[#667085] mb-4">
                    {tabDataError instanceof Error ? tabDataError.message : 'An error occurred while fetching data'}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#EAECF0] p-8">
                <EmptyState
                  title="No results found"
                  message={
                    searchQuery
                      ? `No ${activeTab.replace('-', ' ')} match your search "${searchQuery}". Try adjusting your search terms.`
                      : `No ${activeTab.replace('-', ' ')} data available at this time.`
                  }
                  action={
                    mounted && searchQuery
                      ? {
                        label: 'Clear search',
                        onClick: () => setSearchQuery(''),
                      }
                      : undefined
                  }
                />
              </div>
            ) : (
              <>
                <Table
                  data={paginatedData}
                  tableType={activeTab}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onSelectionChange={handleSelectionChange}
                />

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#475467]">
                      Showing {totalItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                      {searchQuery && <span className="text-[#7F56D9]"> (filtered)</span>}
                    </span>
                  </div>

                  {totalPages > 1 && (
                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Advanced Filters Modal */}
      <DashboardFiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        onApply={handleApplyFilters}
      />


    </div>
  );
}
