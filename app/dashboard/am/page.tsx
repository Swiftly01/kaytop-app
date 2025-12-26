'use client';

import { useState, useEffect } from 'react';
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
import { amDashboardService } from '@/lib/services/amDashboard';

type TabValue = 'disbursements' | 're-collections' | 'savings' | 'missed-payments';

interface AMDashboardKPIs {
  portfolioValue: number;
  totalCustomers: number;
  activeLoans: number;
  monthlyDisbursements: number;
  monthlyRecollections: number;
  savingsCollected: number;
  missedPayments: number;
  performanceMetrics: {
    customerSatisfactionScore: number;
    loanConversionRate: number;
    portfolioGrowthRate: number;
  };
  targets: {
    monthlyCustomerAcquisition: number;
    quarterlyPortfolioGrowth: number;
    loanApprovalTarget: number;
  };
  recentActivity: {
    newCustomersThisMonth: number;
    loansProcessedThisWeek: number;
    reportsApprovedToday: number;
  };
  bestPerformingBranches?: Array<{
    name: string;
    activeLoans: number;
    amount: number;
  }>;
  worstPerformingBranches?: Array<{
    name: string;
    activeLoans: number;
    amount: number;
  }>;
}

export default function AccountManagerDashboard() {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timePeriod, setTimePeriod] = useState<string | null>('12months');
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
  const [dashboardData, setDashboardData] = useState<AMDashboardKPIs | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setDashboardError(null);
      
      // For now, use mock data since AM-specific API endpoints return different structure
      // TODO: Replace with actual AM dashboard API call when backend is ready
      const mockData: AMDashboardKPIs = {
        portfolioValue: 2450000,
        totalCustomers: 156,
        activeLoans: 89,
        monthlyDisbursements: 450000,
        monthlyRecollections: 380000,
        savingsCollected: 125000,
        missedPayments: 12,
        performanceMetrics: {
          customerSatisfactionScore: 4.2,
          loanConversionRate: 0.78,
          portfolioGrowthRate: 0.15
        },
        targets: {
          monthlyCustomerAcquisition: 25,
          quarterlyPortfolioGrowth: 0.20,
          loanApprovalTarget: 85
        },
        recentActivity: {
          newCustomersThisMonth: 18,
          loansProcessedThisWeek: 12,
          reportsApprovedToday: 5
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to fetch AM dashboard data:', error);
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
    
    if (range?.from && range?.to) {
      success('Date range filter applied successfully!');
    }
  };

  // Handler for time period changes
  const handleTimePeriodChange = (period: string | null) => {
    setTimePeriod(period);
    
    // Clear date range when using predefined periods
    if (period !== 'custom') {
      setDateRange(undefined);
    }
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
    success(`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} deleted successfully!`);
    setSelectedRows([]);
  };

  const handleBulkExport = () => {
    if (selectedRows.length === 0) return;
    
    console.log('Bulk exporting:', selectedRows);
    success(`Exporting ${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}...`);
  };

  // Transform dashboard data for UI components
  const getTopCardSections = () => {
    if (!dashboardData) return [];
    
    return [
      {
        label: "Portfolio Value",
        value: dashboardData.portfolioValue,
        change: dashboardData.performanceMetrics.portfolioGrowthRate * 100,
        changeLabel: "vs last month",
        isCurrency: true,
      },
      {
        label: "Total Customers",
        value: dashboardData.totalCustomers,
        change: dashboardData.recentActivity.newCustomersThisMonth,
        changeLabel: "new this month",
      },
      {
        label: "Active Loans",
        value: dashboardData.activeLoans,
        change: dashboardData.performanceMetrics.loanConversionRate * 100,
        changeLabel: "conversion rate",
      },
      {
        label: "Monthly Disbursements",
        value: dashboardData.monthlyDisbursements,
        change: 12.5,
        changeLabel: "vs last month",
        isCurrency: true,
      },
    ];
  };

  const getMiddleCardSections = () => {
    if (!dashboardData) return [];
    
    return [
      {
        label: "Monthly Recollections",
        value: dashboardData.monthlyRecollections,
        change: 8.3,
        changeLabel: "vs last month",
        isCurrency: true,
      },
      {
        label: "Savings Collected",
        value: dashboardData.savingsCollected,
        change: 15.2,
        changeLabel: "vs last month",
        isCurrency: true,
      },
      {
        label: "Missed Payments",
        value: dashboardData.missedPayments,
        change: -5.1,
        changeLabel: "vs last month",
      },
    ];
  };

  // Mock tab data for AM dashboard
  const [tabData] = useState<Record<string, any[]>>({
    disbursements: [
      {
        loanId: 'LN-2024-001',
        name: 'Adebayo Johnson',
        amount: 'NGN150,000',
        status: 'disbursed',
        dateDisbursed: '2024-01-15',
        branch: 'Lagos Central',
        creditOfficer: 'Funmi Adebayo'
      },
      {
        loanId: 'LN-2024-002',
        name: 'Kemi Okafor',
        amount: 'NGN200,000',
        status: 'pending',
        dateDisbursed: '2024-01-16',
        branch: 'Abuja Main',
        creditOfficer: 'Tunde Bakare'
      }
    ],
    're-collections': [
      {
        loanId: 'LN-2023-089',
        name: 'Chioma Nwankwo',
        amount: 'NGN75,000',
        status: 'collected',
        dateCollected: '2024-01-15',
        branch: 'Port Harcourt',
        creditOfficer: 'Emeka Obi'
      }
    ],
    savings: [
      {
        customerId: 'KT-001234',
        name: 'Adebayo Johnson',
        amount: 'NGN45,000',
        type: 'deposit',
        date: '2024-01-15',
        branch: 'Lagos Central'
      }
    ],
    'missed-payments': [
      {
        loanId: 'LN-2023-078',
        name: 'Ibrahim Musa',
        amount: 'NGN25,000',
        daysMissed: 5,
        dueDate: '2024-01-10',
        branch: 'Kano Branch',
        creditOfficer: 'Aisha Bello'
      }
    ],
  });

  // Get current tab data with search filtering
  const currentTabData = tabData[activeTab];
  
  // Apply search filter
  let filteredData = searchQuery
    ? currentTabData.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        return (
          (item.loanId && item.loanId.toLowerCase().includes(searchLower)) ||
          (item.customerId && item.customerId.toLowerCase().includes(searchLower)) ||
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

      return true;
    });
  }

  // Apply sorting
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        let aValue: any = a[sortColumn as keyof typeof a];
        let bValue: any = b[sortColumn as keyof typeof b];

        // Handle different data types
        if (sortColumn === 'loanId' || sortColumn === 'customerId') {
          aValue = parseInt(aValue?.split('-')[2] || '0');
          bValue = parseInt(bValue?.split('-')[2] || '0');
        } else if (sortColumn === 'amount') {
          aValue = parseInt(aValue.replace(/[^0-9]/g, ''));
          bValue = parseInt(bValue.replace(/[^0-9]/g, ''));
        } else if (sortColumn === 'dateDisbursed' || sortColumn === 'dateCollected' || sortColumn === 'date' || sortColumn === 'dueDate') {
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

  // Handler for sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="drawer-content flex flex-col min-h-screen">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          {/* Page Header - Position: y:110px (Overview), y:150px (Portfolio Management) */}
          <header>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>Overview</h1>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)', opacity: 0.5, marginBottom: '48px' }}>
              Portfolio Management
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
                  branches={dashboardData?.bestPerformingBranches || [
                    { name: 'Lagos Central', activeLoans: 156, amount: 1250000 },
                    { name: 'Abuja Main', activeLoans: 234, amount: 1890000 },
                    { name: 'Port Harcourt', activeLoans: 98, amount: 890000 }
                  ]}
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
                  branches={dashboardData?.worstPerformingBranches || [
                    { name: 'Kano Branch', activeLoans: 45, amount: 320000 },
                    { name: 'Enugu Branch', activeLoans: 67, amount: 480000 },
                    { name: 'Ibadan Branch', activeLoans: 78, amount: 560000 }
                  ]}
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
                  setCurrentPage(1);
                }}
                placeholder="Search by ID, Name, or Status..."
                className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-transparent"
                aria-label="Search transactions"
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

          {/* Data Table */}
          <section 
            className="mt-6"
            role="tabpanel"
            id={`${activeTab}-panel`}
            aria-labelledby={`${activeTab}-tab`}
          >
            {filteredData.length === 0 ? (
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