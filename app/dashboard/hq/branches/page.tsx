'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import Table, { BranchRecord } from '@/app/_components/ui/Table';
import CreateBranchModal from '@/app/_components/ui/CreateBranchModal';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import AdvancedFiltersModal, { AdvancedFilters } from '@/app/_components/ui/AdvancedFiltersModal';
import { DateRange } from 'react-day-picker';
import { userService } from '@/lib/services/users';
import { dashboardService } from '@/lib/services/dashboard';
import type { User, PaginatedResponse } from '@/lib/api/types';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';

interface BranchFormData {
  branchName: string;
  stateRegion: string;
  assignUsers: string[];
}

import { branchService } from '@/lib/services/branches';

export default function BranchesPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch branch data from API
  const fetchBranchData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Fetch branches directly from branch service (no more user transformation)
      const branchesResponse = await branchService.getAllBranches({ limit: 1000 });
      const branchRecords = branchesResponse.data.map(branch => ({
        id: branch.id,
        branchId: `ID: ${branch.code}`,
        name: branch.name,
        cos: '0', // Will be populated from user data
        customers: 0, // Will be populated from user data
        dateCreated: branch.dateCreated.split('T')[0]
      }));

      // Get user counts for each branch
      const branchRecordsWithCounts = await Promise.all(
        branchRecords.map(async (record) => {
          try {
            const branchUsers = await userService.getUsersByBranch(record.name, { page: 1, limit: 1000 });
            const usersData = branchUsers?.data || [];
            const creditOfficers = usersData.filter(user => user.role === 'credit_officer');
            const customers = usersData.filter(user => user.role === 'customer');

            return {
              ...record,
              cos: creditOfficers.length.toString(),
              customers: customers.length,
            };
          } catch (error: any) {
            // Log warning but don't fail - return record with zero counts
            const errorMsg = error?.message || 'Unknown error';
            const statusCode = error?.response?.status || error?.status;
            console.warn(`Failed to get user counts for branch "${record.name}" (${statusCode || 'no status'}): ${errorMsg}`);

            return {
              ...record,
              cos: '0',
              customers: 0,
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

      // Fetch dashboard statistics
      const dashboardData = await dashboardService.getKPIs();

      // Helper function to safely extract values
      const extractValue = (obj: any, fallback: any = 0) => {
        if (obj === null || obj === undefined) return fallback;
        if (typeof obj === 'object' && obj.value !== undefined) return obj.value;
        return obj;
      };

      const stats: StatSection[] = [
        {
          label: 'All Branches',
          value: extractValue(dashboardData.branches?.value, branchRecordsWithCounts.length),
          change: extractValue(dashboardData.branches?.change, 0),
          changeLabel: extractValue(dashboardData.branches?.changeLabel, 'No change'),
          isCurrency: extractValue(dashboardData.branches?.isCurrency, false),
        },
        {
          label: "All CO's",
          value: extractValue(dashboardData.creditOfficers?.value, 0),
          change: extractValue(dashboardData.creditOfficers?.change, 0),
          changeLabel: extractValue(dashboardData.creditOfficers?.changeLabel, 'No change'),
          isCurrency: extractValue(dashboardData.creditOfficers?.isCurrency, false),
        },
        {
          label: 'All Customers',
          value: extractValue(dashboardData.customers?.value, 0),
          change: extractValue(dashboardData.customers?.change, 0),
          changeLabel: extractValue(dashboardData.customers?.changeLabel, 'No change'),
          isCurrency: extractValue(dashboardData.customers?.isCurrency, false),
        },
        {
          label: 'Active Loans',
          value: extractValue(dashboardData.activeLoans?.value, 0),
          change: extractValue(dashboardData.activeLoans?.change, 0),
          changeLabel: extractValue(dashboardData.activeLoans?.changeLabel, 'No change'),
          isCurrency: extractValue(dashboardData.activeLoans?.isCurrency, false),
        },
      ];

      setBranchStatistics(stats);

    } catch (err) {
      console.error('Failed to fetch branch data:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load branch data');
      error('Failed to load branch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchBranchData();
  }, []);

  const handleCreateBranch = () => {
    setIsModalOpen(true);
  };

  const handleRowClick = (row: BranchRecord) => {
    // Extract the ID from the row object
    router.push(`/dashboard/hq/branches/${row.id}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = async (data: BranchFormData) => {
    try {
      console.log('Branch created:', data);
      console.log('Assigned users:', data.assignUsers);

      // TODO: Add API call to create branch when endpoint is available
      // For now, just refresh the data to show updated branch list
      await fetchBranchData();

      // Show success notification
      const userCount = data.assignUsers.length;
      const message = userCount > 0
        ? `Branch "${data.branchName}" created with ${userCount} user${userCount > 1 ? 's' : ''} assigned!`
        : `Branch "${data.branchName}" created successfully!`;
      success(message);
    } catch (err) {
      console.error('Failed to create branch:', err);
      error('Failed to create branch. Please try again.');
    }
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
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
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

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          <div>
            {/* Page Header with Create Button */}
            <div className="mb-12 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  Overview
                </h1>
                <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)', opacity: 0.5 }}>
                  All Branches
                </p>
              </div>

              {/* Create New Branch Button */}
              <button
                onClick={handleCreateBranch}
                className="w-[265px] h-[44px] px-[18px] py-[10px] text-white text-base font-semibold leading-[24px] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] transition-colors duration-200"
                style={{ backgroundColor: 'var(--color-primary-600)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6941C6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'}
                aria-label="Create new branch"
              >
                Create New Branch
              </button>
            </div>

            {/* Filter Controls */}
            <div style={{ marginBottom: '56px' }}>
              <FilterControls
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
                onDateRangeChange={handleDateRangeChange}
                onFilter={handleFilterClick}
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
              ) : (
                <>
                  {console.log('🎯 Rendering StatisticsCard with:', branchStatistics)}
                  <StatisticsCard sections={branchStatistics} />
                </>
              )}
            </div>

            {/* Branches Section Title and Search */}
            <div className="pl-4 flex items-center justify-between" style={{ marginBottom: '24px' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-dark)' }}>
                Branches
              </h2>

              {/* Search Input */}
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
                  placeholder="Search by Name or ID..."
                  className="w-full pl-10 pr-10 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    border: '1px solid var(--color-border-gray-300)',
                    '--tw-ring-color': 'var(--color-primary-600)'
                  } as React.CSSProperties}
                  aria-label="Search branches"
                  suppressHydrationWarning
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

            {/* Branches Table */}
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
                    No branches match your search "{searchQuery}"
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="px-4 py-2 text-sm font-medium text-[#7F56D9] hover:text-[#6941C6] transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Branch Modal */}
      <CreateBranchModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />

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
