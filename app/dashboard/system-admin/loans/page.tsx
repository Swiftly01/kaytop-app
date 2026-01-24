'use client';

/**
 * Loans Page
 * Displays comprehensive loan management dashboard for system administrators
 */

import { useState, useMemo, useEffect } from 'react';
import SimpleStatisticsCard from '@/app/_components/ui/SimpleStatisticsCard';
import LoansTabNavigation from '@/app/_components/ui/LoansTabNavigation';
import LoansTable from '@/app/_components/ui/LoansTable';
import Pagination from '@/app/_components/ui/Pagination';
import FilterControls from '@/app/_components/ui/FilterControls';
import { DashboardFiltersModal, DashboardFilters } from '@/app/_components/ui/DashboardFiltersModal';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { DateRange } from 'react-day-picker';
import LoansPageLoanDetailsModal, { LoanDetailsData } from '@/app/_components/ui/LoansPageLoanDetailsModal';
import PaymentScheduleModal from '@/app/_components/ui/PaymentScheduleModal';
import EditLoanModal from '@/app/_components/ui/EditLoanModal';
import DeleteConfirmationModal from '@/app/_components/ui/DeleteConfirmationModal';
import { bulkLoansService } from '@/lib/services/bulkLoans';
import { dashboardService } from '@/lib/services/dashboard';
import type { BulkLoansFilters, LoanStatistics } from '@/lib/api/types';

// Mock branch context - in production, this would come from route params or session
const BRANCH_ID = 'igando-branch';
const BRANCH_NAME = 'Igando Branch';

type TabId = 'all' | 'active' | 'completed' | 'missed';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';

const ITEMS_PER_PAGE = 10;

interface LoanData {
  id: string; // Unique identifier
  loanId: string; // Display ID (5 digits)
  customerId: string; // Customer ID
  customerName: string; // Customer name (renamed from borrowerName)
  amount: number; // In Naira
  interestRate: number; // Percentage (e.g., 7.25)
  status: 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted' | 'overdue'; // Updated status options
  nextRepaymentDate: string; // Changed to string for consistency
  disbursementDate: Date;
  term: number; // Loan term in days/months
  branchId: string;
  missedPayments?: number; // Number of missed payments
}

interface LocalLoanStatistics {
  totalLoans: { count: number; growth: number };
  activeLoans: { count: number; growth: number };
  completedLoans: { count: number; growth: number };
}

// Transform API Loan to LoanData format (now handled by bulk API)
const transformBulkLoanToLoanData = (loan: any): LoanData => {
  // Map status to expected values
  let status: 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted' | 'overdue' = 'active';
  if (loan.status) {
    const lowerStatus = loan.status.toLowerCase();
    if (lowerStatus.includes('completed') || lowerStatus.includes('paid')) {
      status = 'completed';
    } else if (lowerStatus.includes('overdue') || lowerStatus.includes('missed')) {
      status = 'overdue';
    } else if (lowerStatus.includes('defaulted') || lowerStatus.includes('default')) {
      status = 'defaulted';
    } else if (lowerStatus.includes('pending')) {
      status = 'pending';
    } else if (lowerStatus.includes('approved')) {
      status = 'approved';
    } else if (lowerStatus.includes('disbursed')) {
      status = 'disbursed';
    } else {
      status = 'active';
    }
  }

  return {
    id: String(loan.id), // Ensure ID is string
    loanId: String(loan.id).slice(-5).toUpperCase(), // Convert to string before slicing
    customerId: String(loan.customerId || loan.customer_id || ''),
    customerName: loan.customerName || 'Unknown Customer',
    status,
    amount: loan.amount,
    interestRate: loan.interestRate,
    nextRepaymentDate: loan.nextRepaymentDate || loan.dueDate || new Date().toISOString(),
    disbursementDate: loan.disbursementDate ? new Date(loan.disbursementDate) : new Date(loan.createdAt),
    term: loan.term || loan.repaymentPeriod || loan.duration || 30,
    branchId: BRANCH_ID,
    missedPayments: loan.missedPayments || 0
  };
};

export default function LoansPage() {
  // State management
  const { toasts, removeToast, success, error: showError } = useToast();
  
  // API data state
  const [allLoans, setAllLoans] = useState<LoanData[]>([]);
  const [loanStatistics, setLoanStatistics] = useState<LoanStatistics | null>(null);
  const [totalLoans, setTotalLoans] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('all');

  // Fetch loans data from API using bulk operations
  const fetchLoansData = async (filters?: BulkLoansFilters) => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Build API filters from current state
      const apiFilters: BulkLoansFilters = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...filters,
      };

      // Apply tab filter
      if (activeTab !== 'all') {
        const statusMap = {
          'active': ['active'],
          'completed': ['completed', 'disbursed'],
          'missed': ['overdue', 'defaulted']
        };
        apiFilters.status = statusMap[activeTab] || [];
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

        apiFilters.dateFrom = startDate.toISOString().split('T')[0];
      }

      // Apply custom date range filter
      if (dateRange?.from) {
        apiFilters.dateFrom = dateRange.from.toISOString().split('T')[0];
        if (dateRange.to) {
          apiFilters.dateTo = dateRange.to.toISOString().split('T')[0];
        }
      }

      // Apply advanced filters
      if (appliedFilters.loanStatus.length > 0) {
        apiFilters.status = appliedFilters.loanStatus.map(status => status.toLowerCase());
      }

      if (appliedFilters.amountRange.min > 0 || appliedFilters.amountRange.max < 1000000) {
        apiFilters.amountMin = appliedFilters.amountRange.min;
        apiFilters.amountMax = appliedFilters.amountRange.max;
      }

      // Fetch bulk loans and statistics
      const [loansResponse, statisticsResponse] = await Promise.all([
        bulkLoansService.getBulkLoans(apiFilters),
        bulkLoansService.getLoanStatistics({
          branchId: apiFilters.branchId,
          creditOfficerId: apiFilters.creditOfficerId,
          dateFrom: apiFilters.dateFrom,
          dateTo: apiFilters.dateTo,
        }),
      ]);

      // Transform loans data
      const transformedLoans = loansResponse.loans.map(transformBulkLoanToLoanData);
      
      setAllLoans(transformedLoans);
      setTotalLoans(loansResponse.pagination.total);
      setLoanStatistics(statisticsResponse);

    } catch (err) {
      console.error('Failed to fetch loans data:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load loans data');
      showError('Failed to load loans data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Additional state variables (moved from below)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('last_30_days');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>({
    branches: [],
    creditOfficers: [],
    loanStatus: [],
    amountRange: { min: 0, max: 1000000 },
  });

  // Modal state
  const [selectedLoanForDetails, setSelectedLoanForDetails] = useState<LoanDetailsData | null>(null);
  const [selectedLoanForEdit, setSelectedLoanForEdit] = useState<any | null>(null);
  const [selectedLoanForDelete, setSelectedLoanForDelete] = useState<string | null>(null);
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    fetchLoansData();
  }, [currentPage]);

  // Reload data when filters change
  useEffect(() => {
    if (currentPage === 1) {
      fetchLoansData();
    } else {
      setCurrentPage(1);
    }
  }, [activeTab, selectedPeriod, dateRange, appliedFilters]);

  // Tab configuration
  const tabs = [
    { id: 'all', label: 'All Loans' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'missed', label: 'Missed Payments' }
  ];

  // Pagination (now handled by API)
  const totalPages = Math.ceil(totalLoans / ITEMS_PER_PAGE);

  // Convert API statistics to display format
  const statistics = useMemo((): LocalLoanStatistics => {
    if (!loanStatistics) return { totalLoans: { count: 0, growth: 0 }, activeLoans: { count: 0, growth: 0 }, completedLoans: { count: 0, growth: 0 } };
    
    return {
      totalLoans: { count: loanStatistics.totalLoans.count, growth: loanStatistics.totalLoans.growth },
      activeLoans: { count: loanStatistics.activeLoans.count, growth: loanStatistics.activeLoans.growth },
      completedLoans: { count: loanStatistics.completedLoans.count, growth: loanStatistics.completedLoans.growth }
    };
  }, [loanStatistics]);

  // Selection handlers
  const handleSelectLoan = (loanId: string) => {
    setSelectedLoans(prev =>
      prev.includes(loanId)
        ? prev.filter(id => id !== loanId)
        : [...prev, loanId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLoans.length === allLoans.length) {
      setSelectedLoans([]);
    } else {
      setSelectedLoans(allLoans.map(loan => loan.id));
    }
  };

  const allSelected = allLoans.length > 0 && selectedLoans.length === allLoans.length;

  // Reset to page 1 when filters change
  const handleTabChange = (tabId: string) => {
    try {
      // Validate tab ID
      const validTabs: TabId[] = ['all', 'active', 'completed', 'missed'];
      if (!validTabs.includes(tabId as TabId)) {
        console.warn('Invalid tab ID, defaulting to "all":', tabId);
        setActiveTab('all');
        return;
      }
      setActiveTab(tabId as TabId);
      setCurrentPage(1);
      setSelectedLoans([]);
      setError(null);
    } catch (error) {
      console.error('Error changing tab:', error);
      setError('Failed to change tab. Please try again.');
    }
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setCurrentPage(1);
    setSelectedLoans([]);
    setError(null);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
    setSelectedLoans([]);
    setError(null);
  };

  const handleFilterClick = () => {
    setIsFiltersOpen(true);
  };

  const handleApplyFilters = (filters: DashboardFilters) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    
    const activeCount = 
      filters.loanStatus.length + 
      (filters.amountRange.min > 0 || filters.amountRange.max < 1000000 ? 1 : 0);
    
    if (activeCount > 0) {
      success(`${activeCount} filter${activeCount > 1 ? 's' : ''} applied successfully!`);
    }
  };

  // Handle pagination out of bounds
  const handlePageChange = (page: number) => {
    try {
      if (page < 1 || page > totalPages) {
        console.warn('Page out of bounds, resetting to page 1');
        setCurrentPage(1);
        return;
      }
      setCurrentPage(page);
      setError(null);
    } catch (error) {
      console.error('Error changing page:', error);
      setError('Failed to change page. Please try again.');
    }
  };

  // Modal handlers
  const handleLoanClick = (loan: any) => {
    setSelectedLoanForDetails(loan);
  };

  const handleCloseDetailsModal = () => {
    setSelectedLoanForDetails(null);
  };

  const handleEditLoan = (loanData: LoanDetailsData) => {
    setSelectedLoanForDetails(null);
    setSelectedLoanForEdit(loanData);
  };

  const handleDeleteLoan = (loanId: string) => {
    setSelectedLoanForDetails(null);
    setSelectedLoanForDelete(loanId);
  };

  const handleViewSchedule = (loanId: string) => {
    setSelectedLoanForDetails(null);
    setSelectedLoanForSchedule(loanId);
  };

  const handleConfirmDelete = async () => {
    if (selectedLoanForDelete) {
      try {
        // In a real implementation, you would call a delete API
        // await loanService.deleteLoan(selectedLoanForDelete);
        
        // For now, just remove from local state
        setAllLoans(prev => prev.filter(loan => loan.id !== selectedLoanForDelete));
        
        success('Loan deleted successfully!');
        setSelectedLoanForDelete(null);
      } catch (err) {
        console.error('Failed to delete loan:', err);
        showError('Failed to delete loan. Please try again.');
      }
    }
  };

  const handleSaveEdit = async (updatedLoan: any) => {
    try {
      // In a real implementation, you would call an update API
      // await loanService.updateLoan(updatedLoan.id, updatedLoan);
      
      // For now, just update local state
      setAllLoans(prev => prev.map(loan => 
        loan.id === updatedLoan.id ? { ...loan, ...updatedLoan } : loan
      ));
      
      success('Loan updated successfully!');
      setSelectedLoanForEdit(null);
    } catch (err) {
      console.error('Failed to update loan:', err);
      showError('Failed to update loan. Please try again.');
    }
  };

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          <div>
            {/* Error Message */}
            {error && (
              <div 
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm text-red-800" style={{ fontFamily: "'Open Sauce Sans', sans-serif" }}>
                  {error}
                </p>
              </div>
            )}

            {/* Page Header */}
            <div style={{ marginBottom: '48px' }}>
              <h1 
                className="font-bold"
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#021C3E',
                  marginBottom: '8px',
                  fontFamily: "'Open Sauce Sans', sans-serif"
                }}
              >
                Overview
              </h1>
              <p 
                className="font-medium"
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#021C3E',
                  opacity: 0.5,
                  fontFamily: "'Open Sauce Sans', sans-serif"
                }}
              >
                {BRANCH_NAME || 'No branch selected'}
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

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-[1091px]" style={{ marginBottom: '48px' }}>
              {isLoading ? (
                <>
                  <div className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
                  <div className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
                  <div className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
                </>
              ) : (
                <>
                  <SimpleStatisticsCard
                    label="Total Loans"
                    value={statistics.totalLoans.count.toLocaleString()}
                    growth={statistics.totalLoans.growth}
                    showGrowth={true}
                  />
                  <SimpleStatisticsCard
                    label="Active Loans"
                    value={statistics.activeLoans.count.toLocaleString()}
                    growth={statistics.activeLoans.growth}
                    showGrowth={true}
                  />
                  <SimpleStatisticsCard
                    label="Completed Loans"
                    value={statistics.completedLoans.count.toLocaleString()}
                    growth={statistics.completedLoans.growth}
                    showGrowth={true}
                  />
                </>
              )}
            </div>

            {/* Tab Navigation */}
            <div style={{ marginBottom: '24px' }}>
              <LoansTabNavigation
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </div>

            {/* Loans Table */}
            <div className="max-w-[1075px]">
              {isLoading ? (
                <TableSkeleton rows={ITEMS_PER_PAGE} />
              ) : allLoans.length === 0 ? (
                <div 
                  className="bg-white rounded-[12px] border border-[#EAECF0] p-12 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <p 
                    className="text-base text-[#475467]"
                    style={{ fontFamily: "'Open Sauce Sans', sans-serif" }}
                  >
                    {apiError ? 'Failed to load loan data. Please try again.' : 'No loans found matching the selected filters.'}
                  </p>
                </div>
              ) : (
                <>
                  <LoansTable
                    loans={allLoans}
                    selectedLoans={selectedLoans}
                    onSelectLoan={handleSelectLoan}
                    onSelectAll={handleSelectAll}
                    allSelected={allSelected}
                    onLoanClick={handleLoanClick}
                  />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-sm text-[#475467]"
                          style={{ fontFamily: "'Open Sauce Sans', sans-serif" }}
                        >
                          Showing <span style={{ fontWeight: 600 }}>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalLoans)}</span> of <span style={{ fontWeight: 600 }}>{totalLoans}</span> results
                        </span>
                      </div>

                      <Pagination
                        page={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Dashboard Filters Modal */}
      <DashboardFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={handleApplyFilters}
      />

      {/* Loan Details Modal */}
      {selectedLoanForDetails && (
        <LoansPageLoanDetailsModal
          isOpen={true}
          onClose={handleCloseDetailsModal}
          loanData={selectedLoanForDetails}
          onEdit={handleEditLoan}
          onDelete={handleDeleteLoan}
          onViewSchedule={handleViewSchedule}
        />
      )}

      {/* Payment Schedule Modal */}
      {selectedLoanForSchedule && (
        <PaymentScheduleModal
          isOpen={true}
          onClose={() => setSelectedLoanForSchedule(null)}
          loanId={selectedLoanForSchedule}
          payments={[]}
        />
      )}

      {/* Edit Loan Modal */}
      {selectedLoanForEdit && (
        <EditLoanModal
          isOpen={true}
          onClose={() => setSelectedLoanForEdit(null)}
          onSave={handleSaveEdit}
          loan={selectedLoanForEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedLoanForDelete && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setSelectedLoanForDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Loan"
          message="Are you sure you want to delete this loan? This action cannot be undone."
        />
      )}
    </div>
  );
}
