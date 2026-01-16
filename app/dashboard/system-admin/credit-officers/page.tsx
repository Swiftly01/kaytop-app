'use client';

import { useState, useEffect } from 'react';
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
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { unifiedUserService } from '@/lib/services/unifiedUser';
import { dashboardService } from '@/lib/services/dashboard';
import { extractValue } from '@/lib/utils/dataExtraction';
import type { User } from '@/lib/api/types';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';

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
  dateJoined: new Date(user.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  })
});

export default function CreditOfficersPage() {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('last_30_days');
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

  // Fetch credit officers data from API
  const fetchCreditOfficersData = async (searchTerm?: string) => {
    try {
      setIsLoading(true);

      // Fetch staff members (credit officers)
      const staffData = await unifiedUserService.getUsers({ role: 'credit_officer' });
      let creditOfficers = staffData.data
        .filter((user: User) => user.role === 'credit_officer')
        .map(transformUserToCreditOfficer);

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

      setCreditOfficersData(creditOfficers);

      // Fetch dashboard statistics for credit officers count
      const dashboardData = await dashboardService.getKPIs();
      
      // Ensure we have valid data before creating stats
      if (!dashboardData || !dashboardData.creditOfficers) {
        console.error('Invalid dashboard data:', dashboardData);
        setCreditOfficersStatistics([]);
        return;
      }
      
      const creditOfficerData = dashboardData.creditOfficers;
      const stats: StatSection[] = [
        {
          label: 'Total Credit Officers',
          value: extractValue(creditOfficerData.value, 0),
          change: extractValue(creditOfficerData.change, 0),
          changeLabel: extractValue(creditOfficerData.changeLabel, 'No change this month'),
          isCurrency: extractValue(creditOfficerData.isCurrency, false),
        },
      ];
      setCreditOfficersStatistics(stats);

    } catch (err) {
      console.error('Failed to fetch credit officers data:', err);
      error('Failed to load credit officers data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCreditOfficersData();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCreditOfficersData(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    console.log('Time period changed:', period);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log('Date range changed:', range);
  };

  const handleFilterClick = () => {
    console.log('Filter clicked');
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedOfficers(selectedIds);
    console.log('Selected officers:', selectedIds);
  };

  const handleRowClick = (officerId: string) => {
    router.push(`/dashboard/system-admin/credit-officers/${officerId}`);
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
      const updateData = {
        firstName: updatedOfficer.name.split(' ')[0],
        lastName: updatedOfficer.name.split(' ').slice(1).join(' '),
        email: updatedOfficer.email,
        mobileNumber: updatedOfficer.phone,
      };

      await unifiedUserService.updateUser(updatedOfficer.id, updateData);
      
      // Refresh the data
      await fetchCreditOfficersData();
      
      success(`Credit Officer "${updatedOfficer.name}" updated successfully!`);
      setEditModalOpen(false);
      setSelectedOfficer(null);
    } catch (err) {
      console.error('Failed to update credit officer:', err);
      error('Failed to update credit officer. Please try again.');
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
                  </div>

                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
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
