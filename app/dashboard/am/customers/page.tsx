'use client';

import { useState, useEffect } from 'react';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import CustomersTable from '@/app/_components/ui/CustomersTable';
import EditCustomerModal from '@/app/_components/ui/EditCustomerModal';
import CustomersAdvancedFiltersModal, { CustomerAdvancedFilters } from '@/app/_components/ui/CustomersAdvancedFiltersModal';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { unifiedUserService } from '@/lib/services/unifiedUser';
import type { User } from '@/lib/api/types';
import { DateRange } from 'react-day-picker';
import { useAuth } from '@/app/context/AuthContext';

type TimePeriod = 'last_24_hours' | 'last_7_days' | 'last_30_days' | 'custom' | null;

interface Customer {
  id: string;
  customerId: string;
  name: string;
  status: 'Active' | 'Scheduled';
  phoneNumber: string;
  email: string;
  dateJoined: string;
  branch?: string;
  creditOfficer?: string;
  portfolioValue?: number;
  riskScore?: string;
}

// Transform API response to Customer format (matching CustomersTable interface)
const transformToCustomer = (customer: any): Customer => ({
  id: customer.id,
  customerId: customer.customerId,
  name: `${customer.firstName} ${customer.lastName}`,
  email: customer.email,
  phoneNumber: customer.phone,
  status: customer.status === 'active' ? 'Active' : 'Scheduled',
  dateJoined: new Date(customer.joinDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  }),
  branch: customer.branch,
  creditOfficer: customer.creditOfficer,
  portfolioValue: customer.loanBalance + customer.savingsBalance,
  riskScore: customer.riskScore
});

export default function AMCustomersPage() {
  const { session } = useAuth();
  const { toasts, removeToast, success, error } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('last_30_days');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<CustomerAdvancedFilters>({
    status: '',
    loanStatus: '',
    branch: '',
    creditOfficer: '',
    registrationDateFrom: '',
    registrationDateTo: '',
    loanAmountMin: '',
    loanAmountMax: '',
    region: '',
  });

  // API data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerStatistics, setCustomerStatistics] = useState<StatSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [portfolioSummary, setPortfolioSummary] = useState<any>(null);

  const itemsPerPage = 10;

  // Fetch AM customers data
  const fetchCustomersData = async (page: number = 1, filters?: CustomerAdvancedFilters) => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Debug authentication state
      console.log('🔍 Authentication Debug:', {
        isAuthenticated: !!session,
        hasUser: !!session,
        hasToken: !!session?.token,
        userRole: session?.role,
        tokenInStorage: typeof window !== 'undefined' ? !!localStorage.getItem('auth-token') : 'N/A'
      });

      if (!session || !session.token) {
        throw new Error('User not authenticated');
      }

      // Build query parameters
      const queryParams: any = {
        page,
        limit: itemsPerPage,
        ...(filters?.status && { status: filters.status.toLowerCase() }),
        ...(filters?.branch && { branch: filters.branch }),
        ...(filters?.creditOfficer && { creditOfficer: filters.creditOfficer }),
      };

      console.log('🔄 Fetching customers with params:', queryParams);

      // Fetch customers data using unified service
      const response = await unifiedUserService.getUsers(queryParams);
      
      // Handle the response structure - it should match the API endpoint we created
      const customersData = response.data || response;
      const paginationData = response.pagination || {
        page: 1,
        limit: itemsPerPage,
        total: Array.isArray(customersData) ? customersData.length : 0,
        totalPages: 1
      };
      
      // Transform customers data
      const transformedCustomers = Array.isArray(customersData) 
        ? customersData.map(transformToCustomer)
        : [];
      
      setCustomers(transformedCustomers);
      setTotalCustomers(paginationData.total);
      setTotalPages(paginationData.totalPages);
      
      // Set portfolio summary (mock data for now)
      const mockPortfolioSummary = {
        totalCustomers: paginationData.total,
        activeCustomers: Math.floor(paginationData.total * 0.8),
        totalPortfolioValue: 2450000,
        totalLoanBalance: 1850000,
        totalSavingsBalance: 600000,
        averageRiskScore: 'Low'
      };
      setPortfolioSummary(mockPortfolioSummary);

      // Create statistics from portfolio summary
      const stats: StatSection[] = [
        {
          label: 'Total Customers',
          value: mockPortfolioSummary.totalCustomers,
          change: 12.5, // Mock change percentage
          changeLabel: '+12.5% this month',
          isCurrency: false,
        },
        {
          label: 'Active Customers',
          value: mockPortfolioSummary.activeCustomers,
          change: 8.3, // Mock change percentage
          changeLabel: '+8.3% this month',
          isCurrency: false,
        },
        {
          label: 'Portfolio Value',
          value: mockPortfolioSummary.totalPortfolioValue,
          change: 15.2, // Mock change percentage
          changeLabel: '+15.2% this month',
          isCurrency: true,
        },
      ];
      setCustomerStatistics(stats);

    } catch (err) {
      console.error('Failed to fetch AM customers data:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load customers data');
      error('Failed to load customers data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (session) {
      fetchCustomersData(1, advancedFilters);
    }
  }, [session]);

  // Refetch when page changes
  useEffect(() => {
    if (!isLoading && session) {
      fetchCustomersData(currentPage, advancedFilters);
    }
  }, [currentPage, session]);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    // TODO: Filter data based on period
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // TODO: Filter data based on date range
  };

  const handleFilterClick = () => {
    setShowAdvancedFilters(true);
  };

  const handleAdvancedFiltersApply = async (filters: CustomerAdvancedFilters) => {
    setAdvancedFilters(filters);
    setCurrentPage(1); // Reset to first page when applying filters
    await fetchCustomersData(1, filters);
    success('Advanced filters applied successfully!');
  };

  const handleAdvancedFiltersClose = () => {
    setShowAdvancedFilters(false);
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedCustomers(selectedIds);
  };

  const handleEdit = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setEditModalOpen(true);
    }
  };

  const handleSaveCustomer = async (updatedCustomer: Customer) => {
    try {
      setIsLoading(true);
      
      // Transform Customer back to API format
      const updateData = {
        firstName: updatedCustomer.name.split(' ')[0],
        lastName: updatedCustomer.name.split(' ').slice(1).join(' '),
        email: updatedCustomer.email,
        mobileNumber: updatedCustomer.phoneNumber,
      };

      await unifiedUserService.updateUser(updatedCustomer.id, updateData);
      
      // Refresh the data
      await fetchCustomersData(currentPage, advancedFilters);
      
      success(`Customer "${updatedCustomer.name}" updated successfully!`);
      setEditModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Failed to update customer:', err);
      error('Failed to update customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination info
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCustomers);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Redirect if not authenticated
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Authentication required</p>
          <p className="text-sm text-muted-foreground">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          <div>
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
                Customer Portfolio
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
              
              {/* Active Filters Indicator */}
              {Object.values(advancedFilters).some(value => value !== '') && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-[#475467]">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(advancedFilters).map(([key, value]) => {
                      if (!value) return null;
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#F9F5FF] text-[#7F56D9] border border-[#E9D7FE]"
                        >
                          {label}: {value}
                          <button
                            onClick={async () => {
                              const updatedFilters = { ...advancedFilters, [key]: '' };
                              setAdvancedFilters(updatedFilters);
                              setCurrentPage(1);
                              await fetchCustomersData(1, updatedFilters);
                            }}
                            className="ml-1 text-[#7F56D9] hover:text-[#6941C6]"
                            aria-label={`Remove ${label} filter`}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                    <button
                      onClick={async () => {
                        const clearedFilters = {
                          status: '',
                          loanStatus: '',
                          branch: '',
                          creditOfficer: '',
                          registrationDateFrom: '',
                          registrationDateTo: '',
                          loanAmountMin: '',
                          loanAmountMax: '',
                          region: '',
                        };
                        setAdvancedFilters(clearedFilters);
                        setCurrentPage(1);
                        await fetchCustomersData(1, clearedFilters);
                      }}
                      className="text-xs text-[#667085] hover:text-[#344054] underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Statistics Card */}
            <div
              className="w-full"
              style={{
                maxWidth: '833px',
                marginBottom: '48px'
              }}
            >
              {isLoading ? (
                <StatisticsCardSkeleton />
              ) : (
                <StatisticsCard sections={customerStatistics} />
              )}
            </div>

            {/* Portfolio Summary Card */}
            {portfolioSummary && !isLoading && (
              <div className="bg-white rounded-lg border border-[#EAECF0] p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#101828] mb-4">Portfolio Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-[#667085]">Total Loan Balance</p>
                    <p className="text-xl font-semibold text-[#101828]">
                      ₦{portfolioSummary.totalLoanBalance?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Total Savings Balance</p>
                    <p className="text-xl font-semibold text-[#101828]">
                      ₦{portfolioSummary.totalSavingsBalance?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Average Risk Score</p>
                    <p className="text-xl font-semibold text-[#101828]">
                      {portfolioSummary.averageRiskScore || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Active Customers</p>
                    <p className="text-xl font-semibold text-[#101828]">
                      {portfolioSummary.activeCustomers || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customers Section Title */}
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
                Customers
              </h2>
            </div>

            {/* Customers Table */}
            <div className="max-w-[1075px]">
              {isLoading ? (
                <TableSkeleton rows={itemsPerPage} />
              ) : apiError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-red-800 font-medium mb-2">Error Loading Customers</div>
                  <div className="text-red-700 text-sm mb-4">{apiError}</div>
                  <button
                    onClick={() => fetchCustomersData(currentPage, advancedFilters)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : customers.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-gray-800 font-medium mb-2">No Customers Found</div>
                  <div className="text-gray-600 text-sm">
                    No customers match the current filters or there are no customers in your portfolio.
                  </div>
                </div>
              ) : (
                <>
                  <CustomersTable
                    customers={customers}
                    selectedCustomers={selectedCustomers}
                    onSelectionChange={handleSelectionChange}
                    onEdit={handleEdit}
                  />

                  {/* Pagination Controls */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#475467]">
                        Showing {startIndex + 1}-{endIndex} of {totalCustomers} results
                      </span>
                    </div>

                    {totalPages > 1 && (
                      <Pagination
                        totalPages={totalPages}
                        page={currentPage}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />

      {/* Advanced Filters Modal */}
      <CustomersAdvancedFiltersModal
        isOpen={showAdvancedFilters}
        onClose={handleAdvancedFiltersClose}
        onApply={handleAdvancedFiltersApply}
        currentFilters={advancedFilters}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
