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
import { dashboardService } from '@/lib/services/dashboard';
import { extractValue } from '@/lib/utils/dataExtraction';
import type { User } from '@/lib/api/types';
import { DateRange } from 'react-day-picker';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';

interface Customer {
  id: string;
  customerId: string;
  name: string;
  status: 'Active' | 'Scheduled';
  phoneNumber: string;
  email: string;
  dateJoined: string;
}

// Transform User to Customer format (matching CustomersTable interface)
const transformUserToCustomer = (user: User): Customer => ({
  id: user.id.toString(),
  customerId: user.id.toString(),
  name: `${user.firstName} ${user.lastName}`,
  email: user.email,
  phoneNumber: user.mobileNumber,
  status: user.verificationStatus === 'verified' ? 'Active' : 'Scheduled',
  dateJoined: new Date(user.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  })
});

export default function CustomersPage() {
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

  const itemsPerPage = 10;

  // Fetch all users and filter customers on frontend
  const fetchCustomersData = async (page: number = 1, filters?: CustomerAdvancedFilters) => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Fetch all users and filter customers on frontend
      const allUsersResponse = await unifiedUserService.getUsers({
        page: 1,
        limit: 1000, // Get all users to filter on frontend
        ...(filters?.branch && { branch: filters.branch }),
        ...(filters?.region && { state: filters.region }),
      });
      
      console.log('🔍 System Admin - Fetched users response:', allUsersResponse);
      console.log(`📊 Total users fetched: ${allUsersResponse.data.length}`);
      
      // Debug: Log role distribution
      const roleDistribution: Record<string, number> = {};
      allUsersResponse.data.forEach(user => {
        const role = user.role || 'undefined';
        roleDistribution[role] = (roleDistribution[role] || 0) + 1;
      });
      console.log('👥 Role distribution:', roleDistribution);
      
      // Frontend filtering: Only show users with role 'customer'
      const customerUsers = allUsersResponse.data.filter(user => {
        const isCustomer = user.role === 'customer';
        if (isCustomer) {
          console.log('✅ Found customer user:', user);
        }
        return isCustomer;
      });
      
      console.log(`🎯 Filtered customers: ${customerUsers.length}`);
      
      // Apply additional frontend filters if needed
      let filteredCustomers = customerUsers;
      
      if (filters?.status) {
        filteredCustomers = filteredCustomers.filter(user => {
          const status = user.verificationStatus === 'verified' ? 'Active' : 'Scheduled';
          return status.toLowerCase() === filters.status.toLowerCase();
        });
      }

      // Transform to customer format
      const transformedCustomers = filteredCustomers.map(transformUserToCustomer);
      
      // Frontend pagination
      const totalCustomers = transformedCustomers.length;
      const totalPages = Math.ceil(totalCustomers / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedCustomers = transformedCustomers.slice(startIndex, startIndex + itemsPerPage);
      
      setCustomers(paginatedCustomers);
      setTotalCustomers(totalCustomers);
      setTotalPages(totalPages);

      // Fetch dashboard statistics for active loans (keep this from dashboard)
      const dashboardData = await dashboardService.getKPIs();
      
      // Use actual filtered customer count instead of dashboard proxy
      const stats: StatSection[] = [
        {
          label: 'Total Customers',
          value: totalCustomers, // Use actual filtered customer count
          change: 0, // TODO: Calculate actual change when we have historical data
          changeLabel: 'No change data available',
          isCurrency: false,
        },
        {
          label: 'Active Loans',
          value: extractValue(dashboardData.activeLoans.value, 0),
          change: extractValue(dashboardData.activeLoans.change, 0),
          changeLabel: extractValue(dashboardData.activeLoans.changeLabel, 'No change this month'),
          isCurrency: extractValue(dashboardData.activeLoans.isCurrency, false),
        },
      ];
      setCustomerStatistics(stats);

    } catch (err) {
      console.error('Failed to fetch customers data:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load customers data');
      error('Failed to load customers data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCustomersData(1, advancedFilters);
  }, []);

  // Refetch when page changes
  useEffect(() => {
    if (!isLoading) {
      fetchCustomersData(currentPage, advancedFilters);
    }
  }, [currentPage]);

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
      
      // Transform Customer back to User format for API
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

  // Pagination info (server-side pagination)
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCustomers);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                Overview
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
                Igando Branch
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
                maxWidth: '564px',
                marginBottom: '48px'
              }}
            >
              {isLoading ? (
                <StatisticsCardSkeleton />
              ) : (
                <StatisticsCard sections={customerStatistics} />
              )}
            </div>

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
                    No customers match the current filters or there are no customers in the system.
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
