'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import Pagination from '@/app/_components/ui/Pagination';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { useToast } from '@/app/hooks/useToast';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import CreditOfficerInfoCard from '@/app/_components/ui/CreditOfficerInfoCard';
import CreditOfficerTabs from '@/app/_components/ui/CreditOfficerTabs';
import CollectionsTable from '@/app/_components/ui/CollectionsTable';
import LoansDisbursedTable from '@/app/_components/ui/LoansDisbursedTable';
import DeleteConfirmationModal from '@/app/_components/ui/DeleteConfirmationModal';
import EditCollectionModal from '@/app/_components/ui/EditCollectionModal';
import EditLoanModal from '@/app/_components/ui/EditLoanModal';
import { userService } from '@/lib/services/users';
import { loanService } from '@/lib/services/loans';
import { savingsService } from '@/lib/services/savings';
import type { User, Loan, Transaction } from '@/lib/api/types';

interface CreditOfficerDetails {
  id: string;
  name: string;
  coId: string;
  dateJoined: string;
  email: string;
  phone: string;
  gender: string;
}

interface CollectionTransaction {
  id: string;
  transactionId: string;
  customerName?: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer';
}

interface DisbursedLoan {
  id: string;
  loanId: string;
  name: string;
  amount: number;
  status: 'Active' | 'Completed' | 'Defaulted';
  interest: number;
  nextRepayment: string;
  creditOfficerId: string;
}

export default function CreditOfficerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise (Next.js 15+ requirement)
  const { id } = use(params);
  
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'collections' | 'loans-disbursed'>('collections');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);
  const itemsPerPage = 10;

  // API data state
  const [creditOfficer, setCreditOfficer] = useState<CreditOfficerDetails | null>(null);
  const [collectionsData, setCollectionsData] = useState<CollectionTransaction[]>([]);
  const [loansData, setLoansData] = useState<DisbursedLoan[]>([]);
  const [creditOfficerStatistics, setCreditOfficerStatistics] = useState<StatSection[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: string } | null>(null);

  // Edit modal state
  const [editCollectionModalOpen, setEditCollectionModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionTransaction | null>(null);
  const [editLoanModalOpen, setEditLoanModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<DisbursedLoan | null>(null);

  // Transform User to CreditOfficerDetails
  const transformUserToCreditOfficerDetails = (user: User): CreditOfficerDetails => ({
    id: String(user.id), // Ensure ID is string
    name: `${user.firstName} ${user.lastName}`,
    coId: String(user.id).slice(-5), // Convert to string before slicing
    dateJoined: new Date(user.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }),
    email: user.email,
    phone: user.mobileNumber,
    gender: 'Not specified' // This field might not be available in the API
  });

  // Transform Transaction to CollectionTransaction
  const transformTransactionToCollection = (transaction: Transaction, customerName: string): CollectionTransaction => ({
    id: String(transaction.id), // Ensure ID is string
    transactionId: String(transaction.id).slice(-8).toUpperCase(),
    customerName,
    amount: transaction.amount,
    status: transaction.status === 'approved' ? 'Completed' : 
            transaction.status === 'rejected' ? 'Failed' : 'Pending',
    date: new Date(transaction.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }),
    type: transaction.type === 'deposit' ? 'Deposit' : 
          transaction.type === 'withdrawal' ? 'Withdrawal' : 'Transfer'
  });

  // Transform Loan to DisbursedLoan
  const transformLoanToDisbursed = (loan: Loan, customerName: string): DisbursedLoan => ({
    id: String(loan.id), // Ensure ID is string
    loanId: String(loan.id).slice(-8).toUpperCase(),
    name: customerName,
    amount: loan.amount,
    status: loan.status === 'active' ? 'Active' : 
            loan.status === 'completed' ? 'Completed' : 'Defaulted',
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

      // For now, we'll use placeholder data for collections and loans
      // since we don't have specific endpoints to get credit officer's managed transactions
      // In a real implementation, you would have endpoints like:
      // - GET /admin/credit-officers/{id}/collections
      // - GET /admin/credit-officers/{id}/loans

      // Placeholder statistics
      const stats: StatSection[] = [
        {
          label: 'All Customers',
          value: 0, // Would come from API
          change: 0,
          changeLabel: 'No change this month',
          isCurrency: false,
        },
        {
          label: 'Active loans',
          value: 0, // Would come from API
          change: 0,
          changeLabel: 'No change this month',
          isCurrency: false,
        },
        {
          label: 'Loans Processed',
          value: 0, // Would come from API
          change: 0,
          changeLabel: 'No change this month',
          isCurrency: false,
        },
        {
          label: 'Loan Amount',
          value: 0, // Would come from API
          change: 0,
          changeLabel: 'No change this month',
          isCurrency: true
        },
      ];
      setCreditOfficerStatistics(stats);

      // Set empty arrays for now - in real implementation these would be populated from API
      setCollectionsData([]);
      setLoansData([]);

    } catch (err) {
      console.error('Failed to fetch credit officer data:', err);
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

  const handleTabChange = (tab: 'collections' | 'loans-disbursed') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to page 1 when switching tabs
    setSelectedCollections([]); // Clear selections when switching tabs
    setSelectedLoans([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCollectionEdit = (collectionId: string) => {
    const collection = collectionsData.find(c => c.id === collectionId);
    if (collection) {
      setSelectedCollection(collection);
      setEditCollectionModalOpen(true);
    }
  };

  const handleCollectionSave = async (updatedCollection: CollectionTransaction) => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would update the transaction via API
      // For now, we'll just show success message
      console.log('Saving collection:', updatedCollection);
      
      success(`Collection ${updatedCollection.transactionId} updated successfully!`);
      setEditCollectionModalOpen(false);
      setSelectedCollection(null);
      
      // Refresh data
      await fetchCreditOfficerData();
    } catch (err) {
      console.error('Failed to update collection:', err);
      error('Failed to update collection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectionDelete = (collectionId: string) => {
    const collection = collectionsData.find(c => c.id === collectionId);
    if (collection) {
      setItemToDelete({ id: collectionId, name: collection.transactionId, type: 'Collection' });
      setDeleteModalOpen(true);
    }
  };

  const handleLoanEdit = (loanId: string) => {
    const loan = loansData.find(l => l.id === loanId);
    if (loan) {
      setSelectedLoan(loan);
      setEditLoanModalOpen(true);
    }
  };

  const handleLoanSave = async (updatedLoan: DisbursedLoan) => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would update the loan via API
      // For now, we'll just show success message
      console.log('Saving loan:', updatedLoan);
      
      success(`Loan ${updatedLoan.loanId} updated successfully!`);
      setEditLoanModalOpen(false);
      setSelectedLoan(null);
      
      // Refresh data
      await fetchCreditOfficerData();
    } catch (err) {
      console.error('Failed to update loan:', err);
      error('Failed to update loan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoanDelete = (loanId: string) => {
    const loan = loansData.find(l => l.id === loanId);
    if (loan) {
      setItemToDelete({ id: loanId, name: loan.loanId, type: 'Loan' });
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would delete via API
        console.log(`Deleting ${itemToDelete.type}:`, itemToDelete.id);
        
        success(`${itemToDelete.type} "${itemToDelete.name}" deleted successfully!`);
        setDeleteModalOpen(false);
        setItemToDelete(null);
        
        // Refresh data
        await fetchCreditOfficerData();
      } catch (err) {
        console.error(`Failed to delete ${itemToDelete.type}:`, err);
        error(`Failed to delete ${itemToDelete.type}. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCollectionSelectionChange = (selectedIds: string[]) => {
    setSelectedCollections(selectedIds);
  };

  const handleLoanSelectionChange = (selectedIds: string[]) => {
    setSelectedLoans(selectedIds);
  };

  // Pagination for collections
  const totalCollectionPages = Math.ceil(collectionsData.length / itemsPerPage);
  const collectionStartIndex = (currentPage - 1) * itemsPerPage;
  const collectionEndIndex = collectionStartIndex + itemsPerPage;
  const paginatedCollections = collectionsData.slice(collectionStartIndex, collectionEndIndex);

  // Pagination for loans
  const totalLoanPages = Math.ceil(loansData.length / itemsPerPage);
  const loanStartIndex = (currentPage - 1) * itemsPerPage;
  const loanEndIndex = loanStartIndex + itemsPerPage;
  const paginatedLoans = loansData.slice(loanStartIndex, loanEndIndex);

  const totalPages = activeTab === 'collections' ? totalCollectionPages : totalLoanPages;

  const handleBack = () => {
    router.push('/dashboard/system-admin/credit-officers');
  };

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          <div>
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-4 hover:opacity-70 transition-opacity duration-200 flex items-center gap-2"
              aria-label="Go back to credit officers list"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M15.8334 10H4.16669M4.16669 10L10 15.8333M4.16669 10L10 4.16667"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Credit Officer
              </h1>
              {/* Breadcrumb line */}
              <div className="w-[18px] h-[2px] bg-black mb-6"></div>
            </div>

            {/* Credit Officer Info Card */}
            <div className="w-full max-w-[1091px]" style={{ marginBottom: '48px' }}>
              {isLoading || !creditOfficer ? (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <CreditOfficerInfoCard
                  fields={[
                    { label: 'Name', value: creditOfficer.name },
                    { label: 'CO ID', value: creditOfficer.coId },
                    { label: 'Date Joined', value: creditOfficer.dateJoined },
                    { label: 'Email address', value: creditOfficer.email },
                    { label: 'Phone number', value: creditOfficer.phone },
                    { label: 'Gender', value: creditOfficer.gender }
                  ]}
                />
              )}
            </div>

            {/* Statistics Card */}
            <div className="w-full max-w-[1091px]" style={{ marginBottom: '48px' }}>
              {isLoading ? (
                <StatisticsCardSkeleton />
              ) : (
                <StatisticsCard sections={creditOfficerStatistics} />
              )}
            </div>

            {/* Tab Navigation */}
            <CreditOfficerTabs activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Tab Content */}
            <div 
              className="max-w-[1041px]"
              role="tabpanel"
              id={`${activeTab}-panel`}
              aria-labelledby={`${activeTab}-tab`}
            >
              {isLoading ? (
                <TableSkeleton rows={itemsPerPage} />
              ) : activeTab === 'collections' ? (
                <>
                  <CollectionsTable
                    transactions={paginatedCollections}
                    selectedTransactions={selectedCollections}
                    onSelectionChange={handleCollectionSelectionChange}
                    onEdit={handleCollectionEdit}
                    onDelete={handleCollectionDelete}
                  />
                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination
                      totalPages={totalPages}
                      page={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <LoansDisbursedTable
                    loans={paginatedLoans}
                    selectedLoans={selectedLoans}
                    onSelectionChange={handleLoanSelectionChange}
                    onEdit={handleLoanEdit}
                    onDelete={handleLoanDelete}
                  />
                  {/* Pagination */}
                  <div className="mt-4">
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
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={`Delete ${itemToDelete?.type || 'Item'}`}
        message={`Are you sure you want to delete ${itemToDelete?.type.toLowerCase() || 'this item'}`}
        itemName={itemToDelete?.name}
      />

      {/* Edit Collection Modal */}
      <EditCollectionModal
        isOpen={editCollectionModalOpen}
        onClose={() => {
          setEditCollectionModalOpen(false);
          setSelectedCollection(null);
        }}
        onSave={handleCollectionSave}
        transaction={selectedCollection}
      />

      {/* Edit Loan Modal */}
      <EditLoanModal
        isOpen={editLoanModalOpen}
        onClose={() => {
          setEditLoanModalOpen(false);
          setSelectedLoan(null);
        }}
        onSave={handleLoanSave}
        loan={selectedLoan}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
