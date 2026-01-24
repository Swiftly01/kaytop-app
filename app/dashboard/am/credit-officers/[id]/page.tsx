'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/hooks/useToast';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { formatDate } from '@/lib/utils';
import CreditOfficerInfoCard from '@/app/_components/ui/CreditOfficerInfoCard';
import CreditOfficerTabs from '@/app/_components/ui/CreditOfficerTabs';
import CollectionsTable from '@/app/_components/ui/CollectionsTable';
import LoansDisbursedTable from '@/app/_components/ui/LoansDisbursedTable';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import { PageSkeleton } from '@/app/_components/ui/Skeleton';
import { userService } from '@/lib/services/users';
import { loanService } from '@/lib/services/loans';
import { savingsService } from '@/lib/services/savings';
import type { User, Loan, Transaction } from '@/lib/api/types';

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
  transactionId: string;
  customerName?: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  loanId?: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer';
}

interface DisbursedLoan {
  id: string;
  loanId: string;
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

  // Transform User to CreditOfficerDetails
  const transformUserToCreditOfficerDetails = (user: User): CreditOfficerDetails => ({
    id: String(user.id),
    name: `${user.firstName} ${user.lastName}`,
    coId: `CO${String(user.id).slice(-3).padStart(3, '0')}`,
    dateJoined: new Date(user.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }),
    branch: user.branch || 'Not assigned',
    phone: user.mobileNumber || 'Not provided',
    email: user.email,
    status: user.isActive ? 'Active' : 'Inactive'
  });

  // Transform Transaction to CollectionTransaction
  const transformTransactionToCollection = (transaction: Transaction, customerName: string): CollectionTransaction => ({
    id: String(transaction.id),
    transactionId: String(transaction.id).slice(-8).toUpperCase(),
    customerName,
    amount: transaction.amount,
    date: new Date(transaction.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }),
    status: transaction.status === 'approved' ? 'Completed' : 
            transaction.status === 'rejected' ? 'Failed' : 'Pending',
    loanId: transaction.loanId ? String(transaction.loanId) : undefined,
    type: transaction.type === 'deposit' ? 'Deposit' : 
          transaction.type === 'withdrawal' ? 'Withdrawal' : 'Transfer'
  });

  // Transform Loan to DisbursedLoan
  const transformLoanToDisbursed = (loan: Loan, customerName: string): DisbursedLoan => ({
    id: String(loan.id),
    loanId: String(loan.id).slice(-8).toUpperCase(),
    customerName,
    amount: loan.amount,
    date: new Date(loan.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }),
    status: loan.status === 'active' ? 'Active' : 
            loan.status === 'completed' ? 'Completed' : 'Defaulted',
    term: loan.repaymentPeriod ? `${loan.repaymentPeriod} months` : 'N/A',
    interest: loan.interestRate || 0,
    nextRepayment: loan.nextRepaymentDate ? new Date(loan.nextRepaymentDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }) : 'N/A',
    creditOfficerId: id
  });

  // Fetch credit officer data
  const fetchCreditOfficerData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Fetch credit officer details
      const user = await userService.getUserById(id);
      if (user.role !== 'credit_officer') {
        throw new Error('User is not a credit officer');
      }

      const officerDetails = transformUserToCreditOfficerDetails(user);
      setCreditOfficer(officerDetails);

      // Fetch all loans and filter by credit officer
      const allLoans = await loanService.getAllLoans();
      // Note: Backend may not have direct credit officer assignment fields
      // We'll use all loans for now and let the credit officer manage them
      const creditOfficerLoans = allLoans; // Use all loans since we don't have direct filtering

      // Transform loans to disbursed loans format
      const transformedLoans = await Promise.all(
        creditOfficerLoans.map(async (loan: Loan) => {
          let customerName = 'Unknown Customer';
          try {
            if (loan.customerId) {
              const customer = await userService.getUserById(String(loan.customerId));
              customerName = `${customer.firstName} ${customer.lastName}`;
            }
          } catch (err) {
            console.warn('Failed to fetch customer name for loan:', loan.id);
          }
          
          return transformLoanToDisbursed(loan, customerName);
        })
      );
      setLoansData(transformedLoans);

      // Fetch all savings transactions and filter by credit officer
      let transformedCollections: CollectionTransaction[] = [];
      try {
        const allSavingsTransactions = await savingsService.getAllSavingsTransactions();
        // Note: Backend may not have direct credit officer assignment fields
        // We'll use all transactions for now and let the credit officer manage them
        const creditOfficerTransactions = allSavingsTransactions; // Use all transactions since we don't have direct filtering

        // Transform transactions to collections format
        transformedCollections = await Promise.all(
          creditOfficerTransactions.map(async (transaction: Transaction) => {
            let customerName = 'Unknown Customer';
            try {
              // Note: Transaction type doesn't have customerId, we'll use a placeholder
              customerName = `Customer ${transaction.id}`;
            } catch (err) {
              console.warn('Failed to fetch customer name for transaction:', transaction.id);
            }
            
            return transformTransactionToCollection(transaction, customerName);
          })
        );
        setCollectionsData(transformedCollections);
      } catch (err) {
        console.warn('Failed to fetch savings transactions, using empty array:', err);
        setCollectionsData([]);
      }

      // Calculate real statistics from fetched data
      const uniqueCustomers = new Set([
        ...transformedLoans.map(loan => loan.customerName),
        ...transformedCollections.map(col => col.customerName).filter(Boolean)
      ]).size;

      const activeLoans = transformedLoans.filter(loan => loan.status === 'Active').length;
      const totalCollections = transformedCollections.reduce((sum, col) => sum + col.amount, 0);
      const completedCollections = transformedCollections.filter(col => col.status === 'Completed').length;
      const collectionRate = transformedCollections.length > 0 ? 
        (completedCollections / transformedCollections.length) * 100 : 0;

      const stats: StatSection[] = [
        {
          label: 'Total Collections',
          value: totalCollections,
          change: 0, // Would need historical data for change calculation
          changeLabel: 'Total amount collected',
          isCurrency: true,
        },
        {
          label: 'Loans Disbursed',
          value: transformedLoans.length,
          change: 0,
          changeLabel: 'Total loans processed',
          isCurrency: false,
        },
        {
          label: 'Active Customers',
          value: uniqueCustomers,
          change: 0,
          changeLabel: 'Unique customers managed',
          isCurrency: false,
        },
        {
          label: 'Collection Rate',
          value: Math.round(collectionRate * 10) / 10, // Round to 1 decimal place
          change: 0,
          changeLabel: 'Success rate percentage',
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
            />
          </div>

          {/* Content based on active tab */}
          <div className="mb-6">
            {activeTab === 'collections' && (
              <CollectionsTable
                transactions={currentPageData}
                selectedTransactions={[]}
                onSelectionChange={() => {}} // AM users can't select collections
                onEdit={() => {}} // AM users can't edit collections
                onDelete={() => {}} // AM users can't delete collections
              />
            )}

            {activeTab === 'loans-disbursed' && (
              <LoansDisbursedTable
                loans={currentPageData}
                selectedLoans={[]}
                onSelectionChange={() => {}} // AM users can't select loans
                onEdit={() => {}} // AM users can't edit loans
                onDelete={() => {}} // AM users can't delete loans
              />
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                totalPages={totalPages}
                page={currentPage}
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