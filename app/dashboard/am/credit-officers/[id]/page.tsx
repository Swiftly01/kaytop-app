'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/hooks/useToast';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import CreditOfficerInfoCard from '@/app/_components/ui/CreditOfficerInfoCard';
import CreditOfficerTabs from '@/app/_components/ui/CreditOfficerTabs';
import CollectionsTable from '@/app/_components/ui/CollectionsTable';
import LoansDisbursedTable from '@/app/_components/ui/LoansDisbursedTable';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import { PageSkeleton } from '@/app/_components/ui/Skeleton';

// TypeScript Interfaces
interface CreditOfficerDetails {
  id: string;
  name: string;
  coId: string;
  dateJoined: string;
  branch: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
}

interface CollectionTransaction {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  loanId: string;
}

interface DisbursedLoan {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  status: 'Active' | 'Completed' | 'Defaulted';
  term: string;
  interest: number;
  nextRepayment: string;
  creditOfficerId: string;
}

export default function AMCreditOfficerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise (Next.js 15+ requirement)
  const { id } = use(params);
  
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'collections' | 'loans-disbursed'>('collections');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // API data state
  const [creditOfficer, setCreditOfficer] = useState<CreditOfficerDetails | null>(null);
  const [collectionsData, setCollectionsData] = useState<CollectionTransaction[]>([]);
  const [loansData, setLoansData] = useState<DisbursedLoan[]>([]);
  const [creditOfficerStatistics, setCreditOfficerStatistics] = useState<StatSection[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch credit officer data
  const fetchCreditOfficerData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Mock credit officer details - in real implementation, this would call AM API
      const mockOfficerDetails: CreditOfficerDetails = {
        id: id,
        name: 'John Doe',
        coId: `CO${id.padStart(3, '0')}`,
        dateJoined: 'Jan 15, 2024',
        branch: 'Ikeja Branch',
        phone: '+234 801 234 5678',
        email: 'john.doe@example.com',
        status: 'Active'
      };
      setCreditOfficer(mockOfficerDetails);

      // Mock collections data
      const mockCollections: CollectionTransaction[] = [
        {
          id: '1',
          customerName: 'Alice Johnson',
          amount: 50000,
          date: '2024-12-20',
          status: 'Completed',
          loanId: 'LN001'
        },
        {
          id: '2',
          customerName: 'Bob Smith',
          amount: 25000,
          date: '2024-12-19',
          status: 'Pending',
          loanId: 'LN002'
        },
        {
          id: '3',
          customerName: 'Carol Williams',
          amount: 75000,
          date: '2024-12-18',
          status: 'Completed',
          loanId: 'LN003'
        }
      ];
      setCollectionsData(mockCollections);

      // Mock loans disbursed data
      const mockLoans: DisbursedLoan[] = [
        {
          id: '1',
          customerName: 'David Brown',
          amount: 200000,
          date: '2024-12-15',
          status: 'Active',
          term: '12 months',
          interest: 15,
          nextRepayment: '2024-12-25',
          creditOfficerId: id
        },
        {
          id: '2',
          customerName: 'Eva Davis',
          amount: 150000,
          date: '2024-12-10',
          status: 'Active',
          term: '6 months',
          interest: 12,
          nextRepayment: '2024-12-28',
          creditOfficerId: id
        }
      ];
      setLoansData(mockLoans);

      // Mock statistics
      const stats: StatSection[] = [
        {
          label: 'Total Collections',
          value: mockCollections.reduce((sum, col) => sum + col.amount, 0),
          change: 12.5,
          changeLabel: '+12.5% this month',
          isCurrency: true,
        },
        {
          label: 'Loans Disbursed',
          value: mockLoans.length,
          change: 8.3,
          changeLabel: '+8.3% this month',
          isCurrency: false,
        },
        {
          label: 'Active Customers',
          value: new Set([...mockCollections.map(c => c.customerName), ...mockLoans.map(l => l.customerName)]).size,
          change: 5.7,
          changeLabel: '+5.7% this month',
          isCurrency: false,
        },
        {
          label: 'Collection Rate',
          value: 95.2,
          change: 2.1,
          changeLabel: '+2.1% this month',
          isCurrency: false,
        },
      ];
      setCreditOfficerStatistics(stats);

    } catch (err) {
      console.error('Failed to fetch AM credit officer data:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load credit officer data');
      error('Failed to load credit officer data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCreditOfficerData();
  }, [id]);

  const handleBack = () => {
    router.push('/dashboard/am/credit-officers');
  };

  const handleTabChange = (tab: 'collections' | 'loans-disbursed') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset pagination when switching tabs
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get current page data based on active tab
  const getCurrentPageData = () => {
    let data: any[] = [];
    switch (activeTab) {
      case 'collections':
        data = collectionsData;
        break;
      case 'loans-disbursed':
        data = loansData;
        break;
    }
    
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return { data: paginatedData, totalPages, totalItems: data.length };
  };

  const { data: currentPageData, totalPages, totalItems } = getCurrentPageData();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (apiError || !creditOfficer) {
    return (
      <div className="drawer-content flex flex-col">
        <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
          <div className="max-w-[1150px]">
            <div className="bg-white rounded-lg border border-[#EAECF0] p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {apiError ? 'Error Loading Credit Officer' : 'Credit Officer Not Found'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {apiError || 'The requested credit officer could not be found.'}
              </p>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-[#7F56D9] hover:text-[#6941C6] transition-colors"
              >
                Back to Credit Officers
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-4 hover:opacity-70 transition-opacity duration-200 flex items-center gap-2"
            aria-label="Go back to credit officers list"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="#667085"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium text-[#667085]">Back to Credit Officers</span>
          </button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Credit Officer Details
            </h1>
            <p className="text-base text-[#667085]">
              {creditOfficer.name} • {creditOfficer.branch}
            </p>
          </div>

          {/* Statistics Section */}
          <div className="w-full max-w-[1091px]" style={{ marginBottom: '48px' }}>
            <StatisticsCard sections={creditOfficerStatistics} />
          </div>

          {/* Credit Officer Info Card */}
          <div className="w-full max-w-[1091px]" style={{ marginBottom: '48px' }}>
            <CreditOfficerInfoCard
              fields={[
                { label: 'Name', value: creditOfficer.name },
                { label: 'CO ID', value: creditOfficer.coId },
                { label: 'Date Joined', value: creditOfficer.dateJoined },
                { label: 'Branch', value: creditOfficer.branch },
                { label: 'Phone', value: creditOfficer.phone },
                { label: 'Email', value: creditOfficer.email },
                { label: 'Status', value: creditOfficer.status },
              ]}
            />
          </div>

          {/* Tabs Section */}
          <div className="mb-6">
            <CreditOfficerTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              collectionsCount={collectionsData.length}
              loansCount={loansData.length}
            />
          </div>

          {/* Content based on active tab */}
          <div className="mb-6">
            {activeTab === 'collections' && (
              <CollectionsTable
                data={currentPageData}
                onEdit={() => {}} // AM users can't edit collections
                onDelete={() => {}} // AM users can't delete collections
                readOnly={true} // Make table read-only for AM users
              />
            )}

            {activeTab === 'loans-disbursed' && (
              <LoansDisbursedTable
                data={currentPageData}
                onEdit={() => {}} // AM users can't edit loans
                onDelete={() => {}} // AM users can't delete loans
                readOnly={true} // Make table read-only for AM users
              />
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Empty State */}
          {currentPageData.length === 0 && (
            <div className="bg-white rounded-lg border border-[#EAECF0] p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab.replace('-', ' ')} found
              </h3>
              <p className="text-sm text-gray-500">
                This credit officer has no {activeTab.replace('-', ' ')} yet.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}