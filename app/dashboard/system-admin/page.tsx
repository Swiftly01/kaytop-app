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
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardKPIs | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

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
    console.log('Active tab changed to:', tab);
    // TODO: Fetch data for the selected tab from backend API
    // Example: fetchTabData(tab)
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
    
    // Helper function to safely extract values from nested structure
    const extractValue = (data: any) => {
      // Handle nested structure: data.value.value or direct structure: data.value
      if (data && typeof data === 'object') {
        if (data.value && typeof data.value === 'object' && 'value' in data.value) {
          // Nested structure
          return {
            value: data.value.value || 0,
            change: data.value.change || 0,
            changeLabel: data.value.changeLabel || '',
            isCurrency: data.value.isCurrency || false,
          };
        } else if ('value' in data) {
          // Direct structure
          return {
            value: data.value || 0,
            change: data.change || 0,
            changeLabel: data.changeLabel || '',
            isCurrency: data.isCurrency || false,
          };
        }
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
    
    // Helper function to safely extract values from nested structure
    const extractValue = (data: any) => {
      // Handle nested structure: data.value.value or direct structure: data.value
      if (data && typeof data === 'object') {
        if (data.value && typeof data.value === 'object' && 'value' in data.value) {
          // Nested structure
          return {
            value: data.value.value || 0,
            change: data.value.change || 0,
            changeLabel: data.value.changeLabel || '',
            isCurrency: data.value.isCurrency || false,
          };
        } else if ('value' in data) {
          // Direct structure
          return {
            value: data.value || 0,
            change: data.change || 0,
            changeLabel: data.changeLabel || '',
            isCurrency: data.isCurrency || false,
          };
        }
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
        label: "Loan Amounts",
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

  // State for API-fetched tab data
  const [tabData, setTabData] = useState<Record<string, any[]>>({
    disbursements: [],
    're-collections': [],
    savings: [],
    'missed-payments': [],
  });
  const [tabDataLoading, setTabDataLoading] = useState<Record<string, boolean>>({
    disbursements: false,
    're-collections': false,
    savings: false,
    'missed-payments': false,
  });

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

  // Get current tab data with search filtering
  const currentTabData = tabData[activeTab];
  
  // Apply search filter
  let filteredData = searchQuery
    ? currentTabData.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        return (
          item.loanId.toLowerCase().includes(searchLower) ||
          item.name.toLowerCase().includes(searchLower) ||
          ('status' in item && item.status.toLowerCase().includes(searchLower))
        );
      })
    : currentTabData;

  // Apply advanced filters
  if (activeFilters) {
    filteredData = filteredData.filter(item => {
      // Filter by loan status
      if (activeFilters.loanStatus.length > 0 && 'status' in item) {
        if (!activeFilters.loanStatus.includes(item.status)) {
          return false;
        }
      }

      // Filter by amount range
      const amountValue = parseInt(item.amount.replace(/[^0-9]/g, ''));
      if (amountValue < activeFilters.amountRange.min || amountValue > activeFilters.amountRange.max) {
        return false;
      }

      // Note: Branch and Credit Officer filters would require additional data
      // For now, we're just filtering by status and amount
      return true;
    });
  }

  // Apply sorting
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        let aValue: any = a[sortColumn as keyof typeof a];
        let bValue: any = b[sortColumn as keyof typeof b];

        // Handle different data types
        if (sortColumn === 'loanId') {
          aValue = parseInt(aValue);
          bValue = parseInt(bValue);
        } else if (sortColumn === 'amount') {
          // Extract numeric value from amount string (e.g., "NGN87,000" -> 87000)
          aValue = parseInt(aValue.replace(/[^0-9]/g, ''));
          bValue = parseInt(bValue.replace(/[^0-9]/g, ''));
        } else if (sortColumn === 'interest') {
          // Extract numeric value from percentage (e.g., "7.25%" -> 7.25)
          aValue = parseFloat(aValue?.replace('%', '') || '0');
          bValue = parseFloat(bValue?.replace('%', '') || '0');
        } else if (sortColumn === 'dateDisbursed') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Compare values
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;

  // Apply pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

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
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
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
            </div>
          </div>

          {/* Active Filters Chips */}
          {activeFilters && (
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
          {selectedRows.length > 0 && (
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
            {isLoading ? (
              <TableSkeleton rows={itemsPerPage} />
            ) : filteredData.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#EAECF0] p-8">
                <EmptyState
                  title="No results found"
                  message={
                    searchQuery
                      ? `No ${activeTab.replace('-', ' ')} match your search "${searchQuery}". Try adjusting your search terms.`
                      : `No ${activeTab.replace('-', ' ')} data available at this time.`
                  }
                  action={
                    searchQuery
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
                      Showing {sortedData.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} results
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
