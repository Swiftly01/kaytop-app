'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { DateRange } from 'react-day-picker';
import { Checkbox } from '@/app/_components/ui/Checkbox';
import EditCreditOfficerModal from '@/app/_components/ui/EditCreditOfficerModal';
import DeleteConfirmationModal from '@/app/_components/ui/DeleteConfirmationModal';
import { useToast } from '@/app/hooks/useToast';
import { useStrictModeEffect } from '@/app/hooks/useStrictModeEffect';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { unifiedUserService } from '@/lib/services/unifiedUser';
import { userService } from '@/lib/services/users';
import { dashboardService } from '@/lib/services/dashboard';
import { accurateDashboardService } from '@/lib/services/accurateDashboard';
import { extractValue } from '@/lib/utils/dataExtraction';
import { formatDate } from '@/lib/utils';
import type { User } from '@/lib/api/types';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';
import { debugCreditOfficersDiscrepancy } from '@/lib/utils/debugCreditOfficers';

interface CreditOfficer {
  id: string;
  name: string;
  idNumber: string;
  status: 'Active' | 'Inactive';
  phone: string;
  email: string;
  dateJoined: string;
}

// Transform User to CreditOfficer format
const transformUserToCreditOfficer = (user: User): CreditOfficer => ({
  id: String(user.id), // Ensure ID is string
  name: `${user.firstName} ${user.lastName}`,
  idNumber: String(user.id).slice(-5), // Convert to string before slicing
  status: user.verificationStatus === 'verified' ? 'Active' : 'Inactive',
  phone: user.mobileNumber,
  email: user.email,
  dateJoined: formatDate(user.createdAt) || 'N/A'
});

export default function CreditOfficersPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof CreditOfficer | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // API data state
  const [creditOfficersData, setCreditOfficersData] = useState<CreditOfficer[]>([]);
  const [creditOfficersStatistics, setCreditOfficersStatistics] = useState<StatSection[]>([]);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<CreditOfficer | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [officerToDelete, setOfficerToDelete] = useState<{ id: string; name: string } | null>(null);

  // Fetch credit officers data from API with caching and deduplication
  const fetchCreditOfficersData = useCallback(async (searchTerm?: string) => {
    try {
      setIsLoading(true);

      // Create cache key based on search term and filters
      const cacheKey = JSON.stringify({
        searchTerm: searchTerm || '',
        selectedPeriod,
        dateRange: dateRange ? { from: dateRange.from, to: dateRange.to } : null
      });

      // Only clear cache on explicit refresh, not on every fetch
      // This prevents race conditions and data loss

      // Create new request
      console.log('Fetching fresh credit officers data...');
      const fetchPromise = (async () => {
        // Fetch staff members (credit officers) with multiple strategies to handle backend limitations
        // NOTE: Backend /admin/users endpoint doesn't support role filtering via query params
        console.log('Attempting to fetch credit officers with multiple strategies...');

        let creditOfficers: CreditOfficer[] = [];

        try {
          // Strategy 1: Use the same approach as the dashboard stats - fetch all users and filter client-side
          // This ensures consistency between stats card and table data
          console.log('Strategy 1: Fetching all users and filtering by role on frontend (same as stats card)');
          const allUsersData = await unifiedUserService.getUsers({
            limit: 1000  // Same as dashboard stats - no role filter, we'll filter client-side
          });

          // Filter for credit officers client-side (same logic as accurate dashboard service)
          creditOfficers = allUsersData.data
            .filter((user: User) => {
              const role = user.role?.toLowerCase() || '';
              return role === 'credit_officer' ||
                role === 'creditofficer' ||
                role === 'credit officer' ||
                role === 'co' ||
                role.includes('credit');
            })
            .map(transformUserToCreditOfficer);

          console.log(`Strategy 1 result: ${creditOfficers.length} credit officers found`);
          console.log(`🔄 [CreditOfficersPage] Using same data source as stats card (limit=1000, client-side filtering)`);

          // Strategy 2: If no results, try fetching from /admin/staff/my-staff
          if (creditOfficers.length === 0) {
            console.log('Strategy 2: Fetching from /admin/staff/my-staff endpoint');
            try {
              // Use the user service to get staff members
              const staffData = await userService.getMyStaff();

              const staffCreditOfficers = staffData
                .filter((user: User) => {
                  const role = user.role?.toLowerCase() || '';
                  return role === 'credit_officer' ||
                    role === 'creditofficer' ||
                    role === 'credit officer' ||
                    role === 'co' ||
                    role.includes('credit');
                })
                .map(transformUserToCreditOfficer);

              creditOfficers = [...creditOfficers, ...staffCreditOfficers];
              console.log(`Strategy 2 result: ${staffCreditOfficers.length} additional credit officers found`);
            } catch (staffError) {
              console.warn('Strategy 2 failed:', staffError);
            }
          }

          // Strategy 3: If still no results, try different role variations
          if (creditOfficers.length === 0) {
            console.log('Strategy 3: Trying different role variations');
            const roleVariations = ['creditofficer', 'credit officer', 'co', 'loan_officer'];

            for (const roleVariation of roleVariations) {
              try {
                const variantData = await unifiedUserService.getUsers({
                  role: roleVariation,
                  limit: 100
                });

                const variantCreditOfficers = variantData.data
                  .filter((user: User) => {
                    const role = user.role?.toLowerCase() || '';
                    return role === roleVariation.toLowerCase();
                  })
                  .map(transformUserToCreditOfficer);

                creditOfficers = [...creditOfficers, ...variantCreditOfficers];
                console.log(`Strategy 3 (${roleVariation}): ${variantCreditOfficers.length} credit officers found`);

                if (variantCreditOfficers.length > 0) break; // Stop if we found some
              } catch (variantError) {
                console.warn(`Strategy 3 (${roleVariation}) failed:`, variantError);
              }
            }
          }

          // Remove duplicates based on ID
          creditOfficers = creditOfficers.filter((officer, index, self) =>
            index === self.findIndex(o => o.id === officer.id)
          );

          console.log(`Final result: ${creditOfficers.length} unique credit officers`);

        } catch (error) {
          console.error('Error fetching credit officers:', error);
          // Fallback: return empty array but don't throw
          creditOfficers = [];
        }

        // Log final result
        if (creditOfficers.length === 0) {
          console.log('🔧 [CreditOfficersPage] No credit officers found in backend');
        }

        // Apply search filter if provided
        if (searchTerm && searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          creditOfficers = creditOfficers.filter(officer =>
            officer.name.toLowerCase().includes(query) ||
            officer.idNumber.includes(query) ||
            officer.email.toLowerCase().includes(query) ||
            officer.phone.includes(query)
          );
        }

        // Apply time period and date range filters
        if (selectedPeriod || dateRange) {
          const { filterByTimePeriod, filterByDateRange } = await import('@/lib/utils/dateFilters');

          if (selectedPeriod && selectedPeriod !== 'custom') {
            // Apply preset time period filter - using dateJoined field
            creditOfficers = filterByTimePeriod(
              creditOfficers.map(co => ({ ...co, createdAt: co.dateJoined })),
              'createdAt',
              selectedPeriod
            );
          } else if (dateRange) {
            // Apply custom date range filter
            creditOfficers = filterByDateRange(
              creditOfficers.map(co => ({ ...co, createdAt: co.dateJoined })),
              'createdAt',
              dateRange
            );
          }
        }

        // Fetch dashboard statistics (use cached data to avoid clearing)
        const dashboardData = await dashboardService.getKPIs();

        // Ensure we have valid data before creating stats
        let statistics: StatSection[] = [];

        // Use actual credit officers count from the table data instead of dashboard data
        // This ensures the stats card and table always show the same numbers
        const actualCreditOfficersCount = creditOfficers.length;

        console.log(`🔄 [CreditOfficersPage] Synchronizing stats with table data:`);
        console.log(`   - Table shows: ${actualCreditOfficersCount} credit officers`);
        console.log(`   - Stats will show: ${actualCreditOfficersCount} credit officers`);

        if (dashboardData && dashboardData.creditOfficers) {
          const creditOfficerData = dashboardData.creditOfficers;
          statistics = [
            {
              label: 'Total Credit Officers',
              value: actualCreditOfficersCount, // Use actual count from table data
              change: extractValue(creditOfficerData.change, 0),
              changeLabel: extractValue(creditOfficerData.changeLabel, 'No change this month'),
              isCurrency: extractValue(creditOfficerData.isCurrency, false),
            },
          ];
        } else {
          // Fallback to actual count if dashboard data is not available
          statistics = [
            {
              label: 'Total Credit Officers',
              value: actualCreditOfficersCount,
              change: 0,
              changeLabel: 'No change this month',
              isCurrency: false,
            },
          ];
        }

        return { creditOfficers, statistics };
      })();

      const result = await fetchPromise;
      setCreditOfficersData(result.creditOfficers);
      setCreditOfficersStatistics(result.statistics);

    } catch (err) {
      console.error('Failed to fetch credit officers data:', err);
      error('Failed to load credit officers data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, dateRange, error]);

  // Handle search with debouncing and memoization
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (searchTerm: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchCreditOfficersData(searchTerm);
      }, 300);
    };
  }, [fetchCreditOfficersData]);

  // Load initial data with proper effect handling
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  useEffect(() => {
    if (!hasInitiallyLoaded) {
      console.log('Initial credit officers data fetch');
      fetchCreditOfficersData();
      setHasInitiallyLoaded(true);
    }
  }, [fetchCreditOfficersData, hasInitiallyLoaded]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  // Refresh data when filters change
  useEffect(() => {
    if (hasInitiallyLoaded) { // Only run after initial load
      fetchCreditOfficersData();
    }
  }, [selectedPeriod, dateRange, fetchCreditOfficersData, hasInitiallyLoaded]);

  // Add window focus listener to refresh data when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused - refreshing credit officers data');
      fetchCreditOfficersData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchCreditOfficersData]);

  const handlePeriodChange = useCallback((period: TimePeriod) => {
    setSelectedPeriod(period);
    // Clear custom date range when selecting a preset period
    if (period !== 'custom') {
      setDateRange(undefined);
    }
    // Data will be refetched automatically due to useEffect dependency
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    // When a custom date range is selected, set period to 'custom'
    if (range) {
      setSelectedPeriod('custom');
    }
    // Data will be refetched automatically due to useEffect dependency
  }, []);

  const handleFilterClick = () => {
    console.log('Filter clicked');
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedOfficers(selectedIds);
    console.log('Selected officers:', selectedIds);
  };

  const handleRowClick = (officerId: string) => {
    router.push(`/dashboard/hq/credit-officers/${officerId}`);
  };

  const handleSort = (column: string) => {
    const col = column as keyof CreditOfficer;
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (officer: CreditOfficer) => {
    setSelectedOfficer(officer);
    setEditModalOpen(true);
  };

  const handleSave = async (updatedOfficer: CreditOfficer) => {
    try {
      setIsLoading(true);

      // Transform CreditOfficer back to User format for API
      const nameParts = updatedOfficer.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const updateData = {
        firstName,
        lastName,
        email: updatedOfficer.email,
        mobileNumber: updatedOfficer.phone, // Map phone to mobileNumber
        // Note: Status is handled via verificationStatus, but the API might not support updating it
        // We'll focus on the core fields that are definitely supported
      };

      console.log('Updating credit officer with data:', updateData);

      await unifiedUserService.updateUser(updatedOfficer.id, updateData);

      // Refresh the data
      await fetchCreditOfficersData();

      success(`Credit Officer "${updatedOfficer.name}" updated successfully!`);
      setEditModalOpen(false);
      setSelectedOfficer(null);
    } catch (err) {
      console.error('Failed to update credit officer:', err);

      // Provide more helpful error messages based on the error type
      let errorMessage = 'Failed to update credit officer. Please try again.';

      if (err instanceof Error) {
        console.error('Error details:', err.message);

        if (err.message.includes('500')) {
          errorMessage = 'Server error: The update failed due to a backend issue. This might be a temporary problem - please try again in a few moments, or contact support if the issue persists.';
        } else if (err.message.includes('400')) {
          errorMessage = 'Validation error: Please check that all required fields are filled correctly and try again.';
        } else if (err.message.includes('401')) {
          errorMessage = 'Authentication error: Please log out and log back in, then try again.';
        } else if (err.message.includes('403')) {
          errorMessage = 'Permission error: You may not have permission to update this user. Please contact your administrator.';
        } else if (err.message.includes('404')) {
          errorMessage = 'User not found: This credit officer may have been deleted. Please refresh the page and try again.';
        }
      }

      error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (officer: CreditOfficer) => {
    setOfficerToDelete({ id: officer.id, name: officer.name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (officerToDelete) {
      try {
        setIsLoading(true);

        await unifiedUserService.deleteUser(officerToDelete.id);

        // Refresh the data
        await fetchCreditOfficersData();

        success(`Credit Officer "${officerToDelete.name}" deleted successfully!`);
        setDeleteModalOpen(false);
        setOfficerToDelete(null);
      } catch (err) {
        console.error('Failed to delete credit officer:', err);
        error('Failed to delete credit officer. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Sort data (filtering is now done server-side)
  const sortedOfficers = [...creditOfficersData].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (sortColumn === 'dateJoined') {
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedOfficers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOfficers = sortedOfficers.slice(startIndex, endIndex);

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          <div>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Credit Officers
              </h1>
              {/* Breadcrumb line */}
              <div className="w-[18px] h-[2px] bg-black mb-6"></div>
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
              ) : creditOfficersStatistics && creditOfficersStatistics.length > 0 ? (
                <StatisticsCard sections={creditOfficersStatistics} />
              ) : (
                <div className="bg-white p-6 rounded-lg border">
                  <p className="text-gray-500">No statistics available</p>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="max-w-[1041px] mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search credit officers by name, ID, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                    stroke="currentColor"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Credit Officers Table */}
            <div className="max-w-[1041px]">
              {isLoading ? (
                <TableSkeleton rows={itemsPerPage} />
              ) : (
                <>
                  <div
                    className="bg-white rounded-lg overflow-hidden"
                    style={{
                      border: '1px solid var(--color-border-gray-200)',
                      boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
                    }}
                  >
                    {paginatedOfficers.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="mb-4">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Officers Found</h3>
                        <p className="text-gray-500 mb-4">
                          {searchQuery
                            ? `No credit officers match your search "${searchQuery}".`
                            : "No credit officers were found in the system. This may be because:"
                          }
                        </p>
                        {!searchQuery && (
                          <div className="text-sm text-gray-600 mb-4 space-y-1">
                            <p>• The backend doesn't have users with credit officer roles</p>
                            <p>• Role information is not being returned by the API</p>
                            <p>• Credit officers use different role names than expected</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Clear all caches to ensure fresh data
                              unifiedUserService.clearCache();
                              accurateDashboardService.clearCache();
                              fetchCreditOfficersData();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Refresh Data
                          </button>
                          <button
                            onClick={() => {
                              debugCreditOfficersDiscrepancy().then(result => {
                                console.log('Debug completed:', result);
                                alert(`Debug completed! Check console for details.\nTable: ${result.tableCount}, Card: ${result.cardCount}`);
                              }).catch(error => {
                                console.error('Debug failed:', error);
                                alert('Debug failed - check console for details');
                              });
                            }}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                          >
                            Debug Discrepancy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: 'var(--bg-gray-50)', borderBottom: '1px solid var(--color-border-gray-200)' }}>
                            <th className="px-6 py-3 text-left">
                              <Checkbox
                                checked={selectedOfficers.length === paginatedOfficers.length && paginatedOfficers.length > 0}
                                onCheckedChange={(checked) => {
                                  if (checked === true) {
                                    setSelectedOfficers(paginatedOfficers.map(o => o.id));
                                  } else {
                                    setSelectedOfficers([]);
                                  }
                                }}
                                aria-label="Select all credit officers"
                              />
                            </th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium cursor-pointer"
                              style={{ color: 'var(--color-text-secondary)' }}
                              onClick={() => handleSort('name')}
                            >
                              Name
                            </th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              <button
                                onClick={() => handleSort('status')}
                                className="flex items-center gap-1 hover:text-[#101828] transition-colors"
                              >
                                Status
                                {sortColumn === 'status' && (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                                  >
                                    <path
                                      d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                                      stroke="currentColor"
                                      strokeWidth="1.33333"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>
                            </th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              Phone Number
                            </th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              Email
                            </th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              Date Joined
                            </th>
                            <th className="px-6 py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedOfficers.map((officer, index) => (
                            <tr
                              key={officer.id}
                              className="hover:bg-gray-50 cursor-pointer"
                              style={{
                                borderBottom: index < paginatedOfficers.length - 1 ? '1px solid var(--color-border-gray-200)' : 'none'
                              }}
                              onClick={() => handleRowClick(officer.id)}
                            >
                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedOfficers.includes(officer.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked === true) {
                                      setSelectedOfficers([...selectedOfficers, officer.id]);
                                    } else {
                                      setSelectedOfficers(selectedOfficers.filter(id => id !== officer.id));
                                    }
                                  }}
                                  aria-label={`Select ${officer.name}`}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                    {officer.name}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    ID: {officer.idNumber}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: officer.status === 'Active' ? '#ECFDF3' : '#FEF3F2',
                                    color: officer.status === 'Active' ? '#027A48' : '#B42318',
                                  }}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                                    style={{
                                      backgroundColor: officer.status === 'Active' ? '#12B76A' : '#F04438',
                                    }}
                                  />
                                  {officer.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {officer.phone}
                              </td>
                              <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {officer.email}
                              </td>
                              <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {officer.dateJoined}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  <button
                                    className="p-2 hover:bg-gray-100 rounded transition-colors duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(officer);
                                    }}
                                    aria-label={`Edit ${officer.name}`}
                                    title="Edit"
                                  >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                      <path
                                        d="M2.5 17.5H17.5M11.6667 4.16667L14.1667 1.66667C14.3877 1.44565 14.6848 1.32031 14.9948 1.32031C15.3047 1.32031 15.6019 1.44565 15.8229 1.66667L18.3333 4.17708C18.5543 4.39811 18.6797 4.69524 18.6797 5.00521C18.6797 5.31518 18.5543 5.61231 18.3333 5.83333L6.66667 17.5H2.5V13.3333L11.6667 4.16667Z"
                                        stroke="#475467"
                                        strokeWidth="1.66667"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    className="p-2 hover:bg-gray-100 rounded transition-colors duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(officer);
                                    }}
                                    aria-label={`Delete ${officer.name}`}
                                    title="Delete"
                                  >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                      <path
                                        d="M7.5 2.5H12.5M2.5 5H17.5M15.8333 5L15.2489 13.7661C15.1612 15.0813 15.1174 15.7389 14.8333 16.2375C14.5833 16.6765 14.206 17.0294 13.7514 17.2497C13.235 17.5 12.5759 17.5 11.2578 17.5H8.74221C7.42409 17.5 6.76503 17.5 6.24861 17.2497C5.79396 17.0294 5.41674 16.6765 5.16665 16.2375C4.88259 15.7389 4.83875 15.0813 4.75107 13.7661L4.16667 5"
                                        stroke="#475467"
                                        strokeWidth="1.66667"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination
                      totalPages={totalPages}
                      page={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Credit Officer Modal */}
      <EditCreditOfficerModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedOfficer(null);
        }}
        onSave={handleSave}
        officer={selectedOfficer}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setOfficerToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Credit Officer"
        message="Are you sure you want to delete credit officer"
        itemName={officerToDelete?.name}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
