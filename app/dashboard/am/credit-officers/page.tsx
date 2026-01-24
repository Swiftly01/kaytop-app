'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { DateRange } from 'react-day-picker';
import { Checkbox } from '@/app/_components/ui/Checkbox';
import { useToast } from '@/app/hooks/useToast';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { dashboardService } from '@/lib/services/dashboard';
import { extractValue } from '@/lib/utils/dataExtraction';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';

interface CreditOfficer {
  id: string;
  name: string;
  idNumber: string;
  status: 'Active' | 'Inactive';
  phone: string;
  email: string;
  branch: string;
  dateJoined: string;
}

export default function AMCreditOfficersPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('last_30_days');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof CreditOfficer | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // API data state
  const [creditOfficersData, setCreditOfficersData] = useState<CreditOfficer[]>([]);
  const [creditOfficersStatistics, setCreditOfficersStatistics] = useState<StatSection[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch credit officers data from AM API
  const fetchCreditOfficersData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      // For now, create mock data since we don't have a specific AM credit officers endpoint
      // In a real implementation, this would call amBranchService.getAllCreditOfficers() or similar
      const mockCreditOfficers: CreditOfficer[] = [
        {
          id: '1',
          name: 'John Doe',
          idNumber: 'CO001',
          status: 'Active',
          phone: '+234 801 234 5678',
          email: 'john.doe@example.com',
          branch: 'Ikeja Branch',
          dateJoined: 'Jan 15, 2024'
        },
        {
          id: '2',
          name: 'Jane Smith',
          idNumber: 'CO002',
          status: 'Active',
          phone: '+234 802 345 6789',
          email: 'jane.smith@example.com',
          branch: 'Victoria Island Branch',
          dateJoined: 'Feb 20, 2024'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          idNumber: 'CO003',
          status: 'Inactive',
          phone: '+234 803 456 7890',
          email: 'mike.johnson@example.com',
          branch: 'Surulere Branch',
          dateJoined: 'Mar 10, 2024'
        }
      ];

      setCreditOfficersData(mockCreditOfficers);

      // Fetch unified dashboard statistics for credit officers count
      const dashboardData = await dashboardService.getKPIs();
      const stats: StatSection[] = [
        {
          label: 'Total Credit Officers',
          value: extractValue(dashboardData.creditOfficers.value, 0),
          change: extractValue(dashboardData.creditOfficers.change, 0),
          changeLabel: extractValue(dashboardData.creditOfficers.changeLabel, 'No change this month'),
          isCurrency: extractValue(dashboardData.creditOfficers.isCurrency, false),
        },
        {
          label: 'Active Credit Officers',
          value: mockCreditOfficers.filter(co => co.status === 'Active').length,
          change: 5.2,
          changeLabel: '+5.2% this month',
          isCurrency: false,
        },
        {
          label: 'Branches Covered',
          value: new Set(mockCreditOfficers.map(co => co.branch)).size,
          change: 0,
          changeLabel: 'No change this month',
          isCurrency: false,
        },
      ];
      setCreditOfficersStatistics(stats);

    } catch (err) {
      console.error('Failed to fetch AM credit officers data:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load credit officers data');
      error('Failed to load credit officers data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCreditOfficersData();
  }, []);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    console.log('Time period changed:', period);
    // Refresh data with time filter
    fetchCreditOfficersData();
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log('Date range changed:', range);
    // Refresh data with date range filter
    fetchCreditOfficersData();
  };

  const handleFilterClick = () => {
    console.log('Filter clicked');
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedOfficers(selectedIds);
    console.log('Selected officers:', selectedIds);
  };

  const handleRowClick = (officerId: string) => {
    router.push(`/dashboard/am/credit-officers/${officerId}`);
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

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  // Filter and sort data
  const filteredOfficers = creditOfficersData.filter((officer) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        officer.name.toLowerCase().includes(query) ||
        officer.idNumber.toLowerCase().includes(query) ||
        officer.email.toLowerCase().includes(query) ||
        officer.phone.includes(query) ||
        officer.branch.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sortedOfficers = [...filteredOfficers].sort((a, b) => {
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
              <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)', opacity: 0.5 }}>
                Monitor credit officer performance and activities
              </p>
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
                      onClick={() => fetchCreditOfficersData()}
                      className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : (
                <StatisticsCard sections={creditOfficersStatistics} />
              )}
            </div>

            {/* Search Input */}
            <div className="max-w-[1041px] mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search credit officers by name, ID, email, phone, or branch..."
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
              ) : paginatedOfficers.length > 0 ? (
                <>
                  <div
                    className="bg-white rounded-lg overflow-hidden"
                    style={{
                      border: '1px solid var(--color-border-gray-200)',
                      boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
                    }}
                  >
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
                            <button className="flex items-center gap-1 hover:text-[#101828] transition-colors">
                              Name
                              {sortColumn === 'name' && (
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
                            className="px-6 py-3 text-left text-xs font-medium cursor-pointer"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onClick={() => handleSort('status')}
                          >
                            <button className="flex items-center gap-1 hover:text-[#101828] transition-colors">
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
                            Branch
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
                            className="px-6 py-3 text-left text-xs font-medium cursor-pointer"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onClick={() => handleSort('dateJoined')}
                          >
                            <button className="flex items-center gap-1 hover:text-[#101828] transition-colors">
                              Date Joined
                              {sortColumn === 'dateJoined' && (
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
                              {officer.branch}
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#475467]">
                        Showing {startIndex + 1}-{Math.min(endIndex, sortedOfficers.length)} of {sortedOfficers.length} results
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
                    No credit officers found
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchQuery ? `No credit officers match your search "${searchQuery}"` : 'No credit officers available'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 text-sm font-medium text-[#7F56D9] hover:text-[#6941C6] transition-colors"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
