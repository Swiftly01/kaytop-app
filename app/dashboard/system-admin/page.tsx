'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { StatisticsCard } from "@/app/_components/ui/StatisticsCard";
import { PerformanceCard } from "@/app/_components/ui/PerformanceCard";
import FilterControls from "@/app/_components/ui/FilterControls";
import TabNavigation from "@/app/_components/ui/TabNavigation";
import Table from "@/app/_components/ui/Table";
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import Pagination from '@/app/_components/ui/Pagination';
import { EmptyState } from '@/app/_components/ui/EmptyState';
import { DashboardFiltersModal, DashboardFilters } from '@/app/_components/ui/DashboardFiltersModal';

type TabValue = 'disbursements' | 're-collections' | 'savings' | 'missed-payments';

export default function SystemAdminDashboard() {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timePeriod, setTimePeriod] = useState<string | null>('12months');
  const [activeTab, setActiveTab] = useState<TabValue>('disbursements');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<DashboardFilters | null>(null);

  // Handler for date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log('Dashboard filtering by date range:', range);
    // TODO: Fetch filtered data from backend API based on date range
    // Example: fetchDashboardData(range?.from, range?.to)
    
    if (range?.from && range?.to) {
      success('Date range filter applied successfully!');
    }
  };

  // Handler for time period changes
  const handleTimePeriodChange = (period: string | null) => {
    setTimePeriod(period);
    console.log('Dashboard filtering by time period:', period);
    // TODO: Fetch filtered data from backend API based on time period
    // Example: fetchDashboardData(period)
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

  /* 
   * BACKEND INTEGRATION GUIDE:
   * ===========================
   * 
   * This dashboard is now set up for dynamic data filtering based on date ranges.
   * When a user selects a date range or time period and clicks "Apply", the 
   * handleDateRangeChange or handleTimePeriodChange functions are called.
   * 
   * TO COMPLETE THE INTEGRATION:
   * 
   * 1. Convert the static data arrays below to useState hooks:
   *    const [topCardSections, setTopCardSections] = useState([...]);
   *    const [middleCardSections, setMiddleCardSections] = useState([...]);
   *    const [bestPerformingBranches, setBestPerformingBranches] = useState([...]);
   *    const [worstPerformingBranches, setWorstPerformingBranches] = useState([...]);
   * 
   * 2. Create an API endpoint that accepts date range parameters:
   *    GET /api/dashboard/overview?startDate=2024-01-01&endDate=2024-01-31
   * 
   * 3. In handleDateRangeChange, call your API:
   *    const response = await fetch(`/api/dashboard/overview?startDate=${range?.from}&endDate=${range?.to}`);
   *    const data = await response.json();
   *    setTopCardSections(data.statistics.top);
   *    setMiddleCardSections(data.statistics.middle);
   *    setBestPerformingBranches(data.performance.best);
   *    setWorstPerformingBranches(data.performance.worst);
   * 
   * 4. The Table component should also be updated to accept filtered data as props
   * 
   * 5. Add loading states while fetching data
   */

  // Top statistics card data (4 sections)
  const topCardSections = [
    {
      label: "All Branches",
      value: 42094,
      change: 8,
    },
    {
      label: "All CO's",
      value: 15350,
      change: -8,
    },
    {
      label: "All Customers",
      value: 28350,
      change: -26,
    },
    {
      label: "Loans Processed",
      value: 50350.0,
      change: -10,
      isCurrency: true,
    },
  ];

  // Middle statistics card data (3 sections)
  const middleCardSections = [
    {
      label: "Loan Amounts",
      value: 42094,
      change: 8,
    },
    {
      label: "Active Loans",
      value: 15350,
      change: -6,
    },
    {
      label: "Missed Payments",
      value: 15350,
      change: 6,
    },
  ];

  // Best performing branches data
  const bestPerformingBranches = [
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
  ];

  // Worst performing branches data
  const worstPerformingBranches = [
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
  ];

  // Tab data structures
  // TODO: Replace with actual API data fetching based on activeTab
  const tabData = {
    disbursements: [
      { id: '1', loanId: '43756', name: 'Ademola Jumoke', status: 'Active' as const, interest: '7.25%', amount: 'NGN87,000', dateDisbursed: '2024-06-03' },
      { id: '2', loanId: '45173', name: 'Adegboyoga Precious', status: 'Active' as const, interest: '6.50%', amount: 'NGN55,000', dateDisbursed: '2023-12-24' },
      { id: '3', loanId: '70668', name: 'Nneka Chukwu', status: 'Scheduled' as const, interest: '8.00%', amount: 'NGN92,000', dateDisbursed: '2024-11-11' },
      { id: '4', loanId: '87174', name: 'Damilare Usman', status: 'Active' as const, interest: '7.75%', amount: 'NGN68,000', dateDisbursed: '2024-02-02' },
      { id: '5', loanId: '89636', name: 'Jide Kosoko', status: 'Active' as const, interest: '7.00%', amount: 'NGN79,000', dateDisbursed: '2023-08-18' },
      { id: '6', loanId: '97174', name: 'Oladejo israel', status: 'Active' as const, interest: '6.75%', amount: 'NGN46,000', dateDisbursed: '2024-09-09' },
      { id: '7', loanId: '22739', name: 'Eze Chinedu', status: 'Active' as const, interest: '8.25%', amount: 'NGN61,000', dateDisbursed: '2023-07-27' },
      { id: '8', loanId: '22739', name: 'Adebanji Bolaji', status: 'Active' as const, interest: '7.50%', amount: 'NGN73,000', dateDisbursed: '2024-04-05' },
      { id: '9', loanId: '48755', name: 'Baba Kaothat', status: 'Active' as const, interest: '6.25%', amount: 'NGN62,000', dateDisbursed: '2023-10-14' },
      { id: '10', loanId: '30635', name: 'Adebayo Salami', status: 'Active' as const, interest: '7.10%', amount: 'NGN84,000', dateDisbursed: '2024-03-22' },
    ],
    're-collections': [
      { id: '11', loanId: '43756', name: 'Ademola Jumoke', status: 'Active' as const, amount: 'NGN87,000', dateDisbursed: '2024-06-03' },
      { id: '12', loanId: '43178', name: 'Adegboyoga Precious', status: 'Active' as const, amount: 'NGN55,000', dateDisbursed: '2023-12-24' },
      { id: '13', loanId: '70668', name: 'Nneka Chukwu', status: 'Scheduled' as const, amount: 'NGN92,000', dateDisbursed: '2024-11-11' },
      { id: '14', loanId: '97174', name: 'Damilare Usman', status: 'Active' as const, amount: 'NGN68,000', dateDisbursed: '2024-02-02' },
      { id: '15', loanId: '39635', name: 'Jide Kosoko', status: 'Active' as const, amount: 'NGN79,000', dateDisbursed: '2023-08-18' },
      { id: '16', loanId: '97174', name: 'Oladejo israel', status: 'Active' as const, amount: 'NGN46,000', dateDisbursed: '2024-09-09' },
      { id: '17', loanId: '22739', name: 'Eze Chinedu', status: 'Active' as const, amount: 'NGN61,000', dateDisbursed: '2023-07-27' },
      { id: '18', loanId: '22739', name: 'Adebanji Bolaji', status: 'Active' as const, amount: 'NGN73,000', dateDisbursed: '2024-04-05' },
      { id: '19', loanId: '43756', name: 'Baba Kaothat', status: 'Active' as const, amount: 'NGN52,000', dateDisbursed: '2023-10-14' },
      { id: '20', loanId: '39635', name: 'Adebayo Salami', status: 'Active' as const, amount: 'NGN84,000', dateDisbursed: '2024-03-22' },
    ],
    savings: [
      { id: '21', loanId: '43756', name: 'Ademola Jumoke', type: 'Savings' as const, amount: 'NGN87,000', dateDisbursed: '2024-06-03' },
      { id: '22', loanId: '43178', name: 'Adegboyoga Precious', type: 'Savings' as const, amount: 'NGN55,000', dateDisbursed: '2023-12-24' },
      { id: '23', loanId: '70668', name: 'Nneka Chukwu', type: 'Savings' as const, amount: 'NGN92,000', dateDisbursed: '2024-11-11' },
      { id: '24', loanId: '97174', name: 'Damilare Usman', type: 'Savings' as const, amount: 'NGN68,000', dateDisbursed: '2024-02-02' },
      { id: '25', loanId: '39635', name: 'Jide Kosoko', type: 'Savings' as const, amount: 'NGN79,000', dateDisbursed: '2023-08-18' },
      { id: '26', loanId: '97174', name: 'Oladejo israel', type: 'Savings' as const, amount: 'NGN46,000', dateDisbursed: '2024-09-09' },
      { id: '27', loanId: '22739', name: 'Eze Chinedu', type: 'Savings' as const, amount: 'NGN61,000', dateDisbursed: '2023-07-27' },
      { id: '28', loanId: '22739', name: 'Adebanji Bolaji', type: 'Savings' as const, amount: 'NGN73,000', dateDisbursed: '2024-04-05' },
      { id: '29', loanId: '43756', name: 'Baba Kaothat', type: 'Savings' as const, amount: 'NGN52,000', dateDisbursed: '2023-10-14' },
      { id: '30', loanId: '39635', name: 'Adebayo Salami', type: 'Savings' as const, amount: 'NGN84,000', dateDisbursed: '2024-03-22' },
    ],
    'missed-payments': [
      { id: '31', loanId: '43756', name: 'Ademola Jumoke', status: 'Active' as const, interest: '7.25%', amount: 'NGN87,000', dateDisbursed: '2024-06-03' },
      { id: '32', loanId: '43178', name: 'Adegboyoga Precious', status: 'Active' as const, interest: '6.50%', amount: 'NGN55,000', dateDisbursed: '2023-12-24' },
      { id: '33', loanId: '70668', name: 'Nneka Chukwu', status: 'Scheduled' as const, interest: '8.00%', amount: 'NGN92,000', dateDisbursed: '2024-11-11' },
      { id: '34', loanId: '97174', name: 'Damilare Usman', status: 'Active' as const, interest: '7.75%', amount: 'NGN68,000', dateDisbursed: '2024-02-02' },
      { id: '35', loanId: '39635', name: 'Jide Kosoko', status: 'Active' as const, interest: '7.00%', amount: 'NGN79,000', dateDisbursed: '2023-08-18' },
      { id: '36', loanId: '97174', name: 'Oladejo israel', status: 'Active' as const, interest: '6.75%', amount: 'NGN46,000', dateDisbursed: '2024-09-09' },
      { id: '37', loanId: '22739', name: 'Eze Chinedu', status: 'Active' as const, interest: '8.25%', amount: 'NGN61,000', dateDisbursed: '2023-07-27' },
      { id: '38', loanId: '22739', name: 'Adebanji Bolaji', status: 'Active' as const, interest: '7.50%', amount: 'NGN73,000', dateDisbursed: '2024-04-05' },
      { id: '39', loanId: '43756', name: 'Baba Kaothat', status: 'Active' as const, interest: '6.25%', amount: 'NGN52,000', dateDisbursed: '2023-10-14' },
      { id: '40', loanId: '39635', name: 'Adebayo Salami', status: 'Active' as const, interest: '7.10%', amount: 'NGN84,000', dateDisbursed: '2024-03-22' },
    ],
  };

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
      <main className="flex-1 pl-[58px] pr-6" style={{ paddingTop: '40px' }}>
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
              selectedPeriod={timePeriod as '12months' | '30days' | '7days' | '24hours' | null}
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
              ) : (
                <StatisticsCard sections={topCardSections} />
              )}
            </div>

            {/* Middle Statistics Card - 3 sections */}
            <div className="w-full max-w-[833px]">
              {isLoading ? (
                <StatisticsCardSkeleton />
              ) : (
                <StatisticsCard sections={middleCardSections} />
              )}
            </div>

            {/* Performance Cards */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 mt-6 sm:mt-8">
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
              ) : (
                <PerformanceCard
                  title="Top 3 Best performing branch"
                  branches={bestPerformingBranches}
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
              ) : (
                <PerformanceCard
                  title="Top 3 worst performing branch"
                  branches={worstPerformingBranches}
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
