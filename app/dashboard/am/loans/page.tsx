'use client';

/**
 * AM Loans Page
 * Displays comprehensive loan pipeline management for Account Managers
 */

import { useState, useEffect } from 'react';
import SimpleStatisticsCard from '@/app/_components/ui/SimpleStatisticsCard';
import LoansTabNavigation from '@/app/_components/ui/LoansTabNavigation';
import LoansTable from '@/app/_components/ui/LoansTable';
import Pagination from '@/app/_components/ui/Pagination';
import FilterControls from '@/app/_components/ui/FilterControls';
import { DashboardFiltersModal, DashboardFilters } from '@/app/_components/ui/DashboardFiltersModal';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import { TableSkeleton } from '@/app/_components/ui/Skeleton';
import { EmptyState } from '@/app/_components/ui/EmptyState';
import { DateRange } from 'react-day-picker';
import LoansPageLoanDetailsModal, { LoanDetailsData } from '@/app/_components/ui/LoansPageLoanDetailsModal';
import { amLoansService } from '@/lib/services/amLoans';

type TabId = 'all' | 'active' | 'completed' | 'missed';
type TimePeriod = '12months' | '30days' | '7days' | '24hours' | null;

const ITEMS_PER_PAGE = 10;

interface LoanData {
  id: string;
  loanId: string;
  customerId: string;
  customerName: string;
  amount: number;
  interestRate: number;
  status: 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted' | 'overdue';
  nextRepaymentDate: string;
  disbursementDate: Date;
  term: number;
  branchId: string;
  creditOfficer: string;
  stage: 'inquiry' | 'documentation' | 'review' | 'approval' | 'disbursement';
  purpose: string;
  missedPayments?: number;
}

interface AMLoanStatistics {
  totalApplications: { count: number; growth: number };
  pendingReview: { count: number; growth: number };
  awaitingApproval: { count: number; growth: number };
  readyForDisbursement: { count: number; growth: number };
}

// Transform API Loan to LoanData format
const transformAMLoanToLoanData = (loan: any): LoanData => {
  let status: 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted' | 'overdue' = 'pending';
  if (loan.status) {
    const lowerStatus = loan.status.toLowerCase();
    if (lowerStatus.includes('completed') || lowerStatus.includes('paid')) {
      status = 'completed';
    } else if (lowerStatus.includes('overdue') || lowerStatus.includes('missed')) {
      status = 'overdue';
    } else if (lowerStatus.includes('defaulted') || lowerStatus.includes('default')) {
      status = 'defaulted';
    } else if (lowerStatus.includes('approved')) {
      status = 'approved';
    } else if (lowerStatus.includes('disbursed')) {
      status = 'disbursed';
    } else if (lowerStatus.includes('active')) {
      status = 'active';
    } else {
      status = 'pending';
    }
  }

  return {
    id: String(loan.id),
    loanId: loan.loanId || `LN-${String(loan.id).slice(-5)}`,
    customerId: loan.customerId || String(loan.customer_id || ''),
    customerName: loan.customerName || 'Unknown Customer',
    status,
    amount: loan.amount,
    interestRate: loan.interestRate || 15,
    nextRepaymentDate: loan.nextRepaymentDate || loan.dueDate || new Date().toISOString(),
    disbursementDate: loan.disbursementDate ? new Date(loan.disbursementDate) : new Date(loan.createdAt || Date.now()),
    term: loan.term || loan.tenure || 12,
    branchId: loan.branch || 'Unknown',
    creditOfficer: loan.creditOfficer || 'Unassigned',
    stage: loan.stage || 'inquiry',
    purpose: loan.purpose || 'Business',
    missedPayments: loan.missedPayments || 0
  };
};

export default function AMLoansPage() {
  // State management
  const { toasts, removeToast, success, error: showError } = useToast();
  
  // Filter and pagination state
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('12months');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>({
    branches: [],
    creditOfficers: [],
    loanStatus: [],
    amountRange: { min: 0, max: 1000000 }
  });

  // API data state
  const [allLoans, setAllLoans] = useState<LoanData[]>([]);
  const [loanStatistics, setLoanStatistics] = useState<AMLoanStatistics | null>(null);
  const [totalLoans, setTotalLoans] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('all');

  // Modal states
  const [selectedLoan, setSelectedLoan] = useState<LoanDetailsData | null>(null);
  const [isLoanDetailsModalOpen, setIsLoanDetailsModalOpen] = useState(false);

  // Fetch loans data from AM API
  const fetchLoansData = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Build query parameters
      const queryParams: any = {
        page,
        limit: ITEMS_PER_PAGE,
      };

      // Apply tab filter
      if (activeTab !== 'all') {
        const statusMap = {
          'active': 'active',
          'completed': 'completed',
          'missed': 'overdue'
        };
        queryParams.status = statusMap[activeTab];
      }

      // Apply search filter
      if (searchQuery) {
        queryParams.search = searchQuery;
      }

      // Apply stage filter if needed
      if (appliedFilters.loanStatus.length > 0) {
        queryParams.status = appliedFilters.loanStatus[0].toLowerCase();
      }

      // Fetch AM loans
      const loansResponse = await amLoansService.getLoans(queryParams);
      
      // Handle response structure
      const loansData = loansResponse.data?.loans || loansResponse.data || [];
      const paginationData = loansResponse.data?.pagination || {
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: Array.isArray(loansData) ? loansData.length : 0,
        totalPages: 1
      };
      
      // Transform loans data
      const transformedLoans = Array.isArray(loansData) 
        ? loansData.map(transformAMLoanToLoanData)
        : [];
      
      setAllLoans(transformedLoans);
      setTotalLoans(paginationData.total);
      setTotalPages(paginationData.totalPages);

      // Calculate statistics from the data
      const stats: AMLoanStatistics = {
        totalApplications: { 
          count: paginationData.total, 
          growth: 12.5 
        },
        pendingReview: { 
          count: transformedLoans.filter(loan => loan.stage === 'review').length, 
          growth: 8.3 
        },
        awaitingApproval: { 
          count: transformedLoans.filter(loan => loan.stage === 'approval').length, 
          growth: 15.2 
        },
        readyForDisbursement: { 
          count: transformedLoans.filter(loan => loan.stage === 'disbursement').length, 
          growth: 5.7 
        }
      };
      setLoanStatistics(stats);

    } catch (err) {
      console.error('Failed to fetch AM loans data:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load loans data');
      showError('Failed to load loans data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchLoansData(1);
  }, [activeTab, searchQuery]);

  // Refetch when page changes
  useEffect(() => {
    if (!isLoading) {
      fetchLoansData(currentPage);
    }
  }, [currentPage]);

  // Event handlers
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setCurrentPage(1);
    fetchLoansData(1);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
    fetchLoansData(1);
  };

  const handleFilterClick = () => {
    setShowFiltersModal(true);
  };

  const handleApplyFilters = (filters: DashboardFilters) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    fetchLoansData(1);
    
    const filterCount = 
      filters.branches.length + 
      filters.creditOfficers.length + 
      filters.loanStatus.length + 
      (filters.amountRange.min > 0 || filters.amountRange.max < 1000000 ? 1 : 0);
    
    success(`${filterCount} filter${filterCount > 1 ? 's' : ''} applied successfully!`);
  };

  const handleClearFilters = () => {
    setAppliedFilters({
      branches: [],
      creditOfficers: [],
      loanStatus: [],
      amountRange: { min: 0, max: 1000000 }
    });
    setCurrentPage(1);
    fetchLoansData(1);
    success('All filters cleared!');
  };

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedRows(selectedIds);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoanClick = (loanId: string) => {
    const loan = allLoans.find(l => l.id === loanId);
    if (loan) {
      const loanDetails: LoanDetailsData = {
        id: loan.id,
        loanId: loan.loanId,
        customerName: loan.customerName,
        amount: loan.amount,
        interestRate: loan.interestRate,
        status: loan.status,
        disbursementDate: loan.disbursementDate.toISOString(),
        nextRepaymentDate: loan.nextRepaymentDate,
        term: loan.term,
        purpose: loan.purpose,
        creditOfficer: loan.creditOfficer,
        branch: loan.branchId,
        stage: loan.stage
      };
      setSelectedLoan(loanDetails);
      setIsLoanDetailsModalOpen(true);
    }
  };

  // Apply search and sorting to displayed data
  let filteredLoans = allLoans;

  // Apply sorting
  const sortedLoans = sortColumn
    ? [...filteredLoans].sort((a, b) => {
        let aValue: any = a[sortColumn as keyof LoanData];
        let bValue: any = b[sortColumn as keyof LoanData];

        // Handle different data types
        if (sortColumn === 'amount') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        } else if (sortColumn === 'interestRate') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        } else if (sortColumn === 'disbursementDate' || sortColumn === 'nextRepaymentDate') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredLoans;

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          {/* Page Header */}
          <div style={{ marginBottom: '48px' }}>
            <h1
              className="font-bold"
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#021C3E',
                marginBottom: '8px'
              }}
            >
              Loan Pipeline
            </h1>
            <p
              className="font-medium"
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#021C3E',
                opacity: 0.5
              }}
            >
              Portfolio Management
            </p>
            {/* Breadcrumb line */}
            <div
              style={{
                width: '18px',
                height: '2px',
                background: '#000000',
                marginTop: '8px'
              }}
            />
          </div>

          {/* Filter Controls */}
          <div style={{ marginBottom: '56px' }}>
            <FilterControls
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              onDateRangeChange={handleDateRangeChange}
              onFilter={handleFilterClick}
            />
            
            {/* Active Filters Display */}
            {(appliedFilters.branches.length > 0 || 
              appliedFilters.creditOfficers.length > 0 || 
              appliedFilters.loanStatus.length > 0 ||
              appliedFilters.amountRange.min > 0 || 
              appliedFilters.amountRange.max < 1000000) && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-[#475467]">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {appliedFilters.loanStatus.map((status) => (
                    <span
                      key={status}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#F4F3FF] text-[#5925DC] text-sm rounded-full"
                    >
                      {status}
                    </span>
                  ))}
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loanStatistics && (
              <>
                <SimpleStatisticsCard
                  title="Total Applications"
                  value={loanStatistics.totalApplications.count}
                  growth={loanStatistics.totalApplications.growth}
                />
                <SimpleStatisticsCard
                  title="Pending Review"
                  value={loanStatistics.pendingReview.count}
                  growth={loanStatistics.pendingReview.growth}
                />
                <SimpleStatisticsCard
                  title="Awaiting Approval"
                  value={loanStatistics.awaitingApproval.count}
                  growth={loanStatistics.awaitingApproval.growth}
                />
                <SimpleStatisticsCard
                  title="Ready for Disbursement"
                  value={loanStatistics.readyForDisbursement.count}
                  growth={loanStatistics.readyForDisbursement.growth}
                />
              </>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <LoansTabNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Loan ID, Customer, or Purpose..."
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

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <div className="mb-4 flex items-center justify-between p-4 bg-[#F4F3FF] border border-[#7F56D9] rounded-lg">
              <span className="text-sm font-medium text-[#5925DC]">
                {selectedRows.length} loan{selectedRows.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => success('Bulk export feature coming soon!')}
                  className="px-4 py-2 text-sm font-medium text-[#7F56D9] bg-white border border-[#7F56D9] rounded-lg hover:bg-[#F4F3FF] transition-colors"
                >
                  Export Selected
                </button>
                <button
                  onClick={() => success('Bulk approval feature coming soon!')}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#039855] rounded-lg hover:bg-[#027A48] transition-colors"
                >
                  Approve Selected
                </button>
              </div>
            </div>
          )}

          {/* Loans Table */}
          <div className="max-w-[1075px]">
            {isLoading ? (
              <TableSkeleton rows={ITEMS_PER_PAGE} />
            ) : apiError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-800 font-medium mb-2">Error Loading Loans</div>
                <div className="text-red-700 text-sm mb-4">{apiError}</div>
                <button
                  onClick={() => fetchLoansData(currentPage)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : sortedLoans.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#EAECF0] p-8">
                <EmptyState
                  title="No loans found"
                  message={
                    searchQuery
                      ? `No loans match your search "${searchQuery}". Try adjusting your search terms.`
                      : "No loans available for the selected criteria."
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
                <LoansTable
                  loans={sortedLoans}
                  selectedLoans={selectedRows}
                  onSelectionChange={handleSelectionChange}
                  onSort={handleSort}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onLoanClick={handleLoanClick}
                />

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#475467]">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalLoans)} of {totalLoans} results
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
          </div>
        </div>
      </main>

      {/* Loan Details Modal */}
      <LoansPageLoanDetailsModal
        isOpen={isLoanDetailsModalOpen}
        onClose={() => setIsLoanDetailsModalOpen(false)}
        loan={selectedLoan}
      />

      {/* Advanced Filters Modal */}
      <DashboardFiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        onApply={handleApplyFilters}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}