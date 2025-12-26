/**
 * AM Customer Loans Page
 * Display all loans for a specific customer with AM oversight capabilities
 */

'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import Table from '@/app/_components/ui/Table';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { EmptyState } from '@/app/_components/ui/EmptyState';
import { amCustomerService } from '@/lib/services/amCustomers';
import { DateRange } from 'react-day-picker';

interface PageProps {
  params: Promise<{ id: string }>;
}

type TimePeriod = '12months' | '30days' | '7days' | '24hours' | null;

interface CustomerLoan {
  id: string;
  loanId: string;
  amount: string;
  status: 'active' | 'completed' | 'overdue' | 'pending';
  disbursementDate: string;
  dueDate: string;
  interestRate: string;
  monthlyPayment: string;
  outstanding: string;
  purpose: string;
}

export default function AMCustomerLoansPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();

  // State management
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('12months');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // API data state
  const [customerName, setCustomerName] = useState<string>('');
  const [loans, setLoans] = useState<CustomerLoan[]>([]);
  const [loanStatistics, setLoanStatistics] = useState<StatSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [totalLoans, setTotalLoans] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 10;

  // Transform API loan data to table format
  const transformLoanData = (loanData: any): CustomerLoan => ({
    id: loanData.id,
    loanId: loanData.loanId || `LN-${String(loanData.id).slice(-6)}`,
    amount: `NGN${loanData.amount?.toLocaleString() || '0'}`,
    status: loanData.status || 'pending',
    disbursementDate: loanData.disbursementDate ? 
      new Date(loanData.disbursementDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }) : 'N/A',
    dueDate: loanData.nextRepaymentDate ? 
      new Date(loanData.nextRepaymentDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }) : 'N/A',
    interestRate: `${loanData.interestRate || 15}%`,
    monthlyPayment: `NGN${(loanData.amount * 0.1)?.toLocaleString() || '0'}`, // Assuming 10% monthly
    outstanding: `NGN${(loanData.amount * 0.7)?.toLocaleString() || '0'}`, // Assuming 70% outstanding
    purpose: loanData.purpose || 'Business'
  });

  // Fetch customer loans data
  const fetchCustomerLoans = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Fetch customer details first
      const customer = await amCustomerService.getCustomerById(id);
      setCustomerName(`${customer.firstName} ${customer.lastName}`);

      // Fetch customer loans
      const loansResponse = await amCustomerService.getCustomerLoans(id, {
        page,
        limit: itemsPerPage
      });

      const loansData = loansResponse.data || [];
      const transformedLoans = loansData.map(transformLoanData);
      
      setLoans(transformedLoans);
      setTotalLoans(loansResponse.pagination?.total || loansData.length);
      setTotalPages(loansResponse.pagination?.totalPages || Math.ceil(loansData.length / itemsPerPage));

      // Calculate loan statistics
      const activeLoans = loansData.filter(loan => loan.status === 'active').length;
      const completedLoans = loansData.filter(loan => loan.status === 'completed').length;
      const overdueLoans = loansData.filter(loan => loan.status === 'overdue').length;
      const totalLoanValue = loansData.reduce((sum, loan) => sum + (loan.amount || 0), 0);

      const stats: StatSection[] = [
        {
          label: 'Total Loans',
          value: loansData.length,
          change: 0, // Mock change
        },
        {
          label: 'Active Loans',
          value: activeLoans,
          change: 0, // Mock change
        },
        {
          label: 'Total Value',
          value: totalLoanValue,
          change: 0, // Mock change
          isCurrency: true,
        },
        {
          label: 'Overdue Loans',
          value: overdueLoans,
          change: 0, // Mock change
        },
      ];
      setLoanStatistics(stats);

    } catch (err) {
      console.error('Failed to fetch customer loans:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load customer loans');
      error('Failed to load customer loans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCustomerLoans(1);
  }, [id]);

  // Refetch when page changes
  useEffect(() => {
    if (!isLoading) {
      fetchCustomerLoans(currentPage);
    }
  }, [currentPage]);

  // Event handlers
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    // TODO: Filter data based on period
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // TODO: Filter data based on date range
  };

  const handleFilterClick = () => {
    success('Advanced filters feature coming soon!');
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

  // Apply search filter
  let filteredLoans = searchQuery
    ? loans.filter(loan => {
        const searchLower = searchQuery.toLowerCase();
        return (
          loan.loanId.toLowerCase().includes(searchLower) ||
          loan.purpose.toLowerCase().includes(searchLower) ||
          loan.status.toLowerCase().includes(searchLower)
        );
      })
    : loans;

  // Apply sorting
  const sortedLoans = sortColumn
    ? [...filteredLoans].sort((a, b) => {
        let aValue: any = a[sortColumn as keyof CustomerLoan];
        let bValue: any = b[sortColumn as keyof CustomerLoan];

        // Handle different data types
        if (sortColumn === 'amount' || sortColumn === 'monthlyPayment' || sortColumn === 'outstanding') {
          aValue = parseInt(aValue.replace(/[^0-9]/g, ''));
          bValue = parseInt(bValue.replace(/[^0-9]/g, ''));
        } else if (sortColumn === 'interestRate') {
          aValue = parseFloat(aValue.replace('%', ''));
          bValue = parseFloat(bValue.replace('%', ''));
        } else if (sortColumn === 'disbursementDate' || sortColumn === 'dueDate') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredLoans;

  // Pagination info
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalLoans);

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          {/* Back Button and Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push(`/dashboard/am/customers/${id}`)}
              className="mb-4 hover:opacity-70 transition-opacity flex items-center gap-2"
              aria-label="Go back to customer details"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15.8334 10H4.16669M4.16669 10L10 15.8333M4.16669 10L10 4.16667"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h1
              className="font-bold"
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#021C3E',
                marginBottom: '8px'
              }}
            >
              Customer Loans
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
              {customerName || 'Loading...'}
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
          </div>

          {/* Statistics Card */}
          <div
            className="w-full"
            style={{
              maxWidth: '1091px',
              marginBottom: '48px'
            }}
          >
            {isLoading ? (
              <StatisticsCardSkeleton />
            ) : (
              <StatisticsCard sections={loanStatistics} />
            )}
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
                placeholder="Search by Loan ID, Purpose, or Status..."
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

          {/* Loans Section Title */}
          <div
            className="pl-4"
            style={{ marginBottom: '24px' }}
          >
            <h2
              className="font-semibold"
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#101828'
              }}
            >
              Loan History
            </h2>
          </div>

          {/* Loans Table */}
          <div className="max-w-[1075px]">
            {isLoading ? (
              <TableSkeleton rows={itemsPerPage} />
            ) : apiError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-800 font-medium mb-2">Error Loading Loans</div>
                <div className="text-red-700 text-sm mb-4">{apiError}</div>
                <button
                  onClick={() => fetchCustomerLoans(currentPage)}
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
                      : "This customer doesn't have any loans yet."
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
                  data={sortedLoans} 
                  tableType="loans"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onSelectionChange={handleSelectionChange}
                />

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#475467]">
                      Showing {startIndex + 1}-{endIndex} of {totalLoans} results
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

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}