'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import BranchDetailsStatistics from '@/app/_components/ui/BranchDetailsStatistics';
import BranchInfoCard from '@/app/_components/ui/BranchInfoCard';
import BranchDetailsTabs from '@/app/_components/ui/BranchDetailsTabs';
import CreditOfficersTable from '@/app/_components/ui/CreditOfficersTable';
import ReportsTable from '@/app/_components/ui/ReportsTable';
import MissedReportsTable from '@/app/_components/ui/MissedReportsTable';
import Pagination from '@/app/_components/ui/Pagination';
import DeleteConfirmationModal from '@/app/_components/ui/DeleteConfirmationModal';
import EditCreditOfficerModal from '@/app/_components/ui/EditCreditOfficerModal';
import EditReportModal from '@/app/_components/ui/EditReportModal';
import EditMissedReportModal from '@/app/_components/ui/EditMissedReportModal';
import { LoanDetailsModal, LoanDetailsData } from '@/app/_components/ui/LoanDetailsModal';
import { ConfirmationDialog } from '@/app/_components/ui/ConfirmationDialog';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import { PageSkeleton } from '@/app/_components/ui/Skeleton';
import AssignUsersModal from '@/app/_components/ui/AssignUsersModal';
import { generateBranchData } from '@/lib/branchDataGenerator';

// TypeScript Interfaces
interface BranchDetails {
  id: string;
  branchId: string;
  name: string;
  dateCreated: Date;
  region: string;
  statistics: {
    allCOs: {
      value: number;
      change: number;
      changeLabel: string;
    };
    allCustomers: {
      value: number;
      change: number;
      changeLabel: string;
    };
    activeLoans: {
      value: number;
      change: number;
      changeLabel: string;
    };
    loansProcessed: {
      amount: number;
      change: number;
      changeLabel: string;
    };
  };
  creditOfficers: CreditOfficer[];
}

interface CreditOfficer {
  id: string;
  name: string;
  idNumber: string;
  status: 'Active' | 'In active';
  phone: string;
  email: string;
  dateJoined: string;
}

export default function BranchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise (Next.js 15+ requirement)
  const { id } = use(params);
  
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'credit-officers' | 'reports' | 'missed-reports'>('credit-officers');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Generate unique data for this branch based on ID
  const branchData = generateBranchData(id);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: string } | null>(null);
  
  // Edit modal state
  const [editCOModalOpen, setEditCOModalOpen] = useState(false);
  const [editReportModalOpen, setEditReportModalOpen] = useState(false);
  const [editMissedReportModalOpen, setEditMissedReportModalOpen] = useState(false);
  const [selectedCO, setSelectedCO] = useState<typeof branchData.creditOfficers[0] | null>(null);
  const [selectedReport, setSelectedReport] = useState<typeof branchData.reports[0] | null>(null);
  const [selectedMissedReport, setSelectedMissedReport] = useState<typeof branchData.missedReports[0] | null>(null);
  
  // Loan Details Modal state
  const [loanDetailsModalOpen, setLoanDetailsModalOpen] = useState(false);
  const [selectedLoanData, setSelectedLoanData] = useState<LoanDetailsData | null>(null);

  const handleBack = () => {
    router.push('/dashboard/system-admin/branches');
  };

  const handleTabChange = (tab: 'credit-officers' | 'reports' | 'missed-reports') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to page 1 when switching tabs
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log(`${activeTab} - Page changed to:`, page);
    // TODO: Fetch data for the new page
  };

  // Delete handlers
  const handleDeleteCO = (id: string) => {
    const officer = branchData.creditOfficers.find(co => co.id === id);
    if (officer) {
      setItemToDelete({ id, name: officer.name, type: 'Credit Officer' });
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteReport = (id: string) => {
    const report = branchData.reports.find(r => r.id === id);
    if (report) {
      setItemToDelete({ id, name: report.branchName, type: 'Report' });
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteMissedReport = (id: string) => {
    const report = branchData.missedReports.find(r => r.id === id);
    if (report) {
      setItemToDelete({ id, name: report.branchName, type: 'Missed Report' });
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      console.log(`Deleting ${itemToDelete.type}:`, itemToDelete.id);
      // TODO: Implement actual delete API call
      // Example: await deleteItem(itemToDelete.id, itemToDelete.type);
      
      // Show success notification
      success(`${itemToDelete.type} "${itemToDelete.name}" deleted successfully!`);
      setItemToDelete(null);
    }
  };

  // Edit handlers
  const handleEditCO = (id: string) => {
    const officer = branchData.creditOfficers.find(co => co.id === id);
    if (officer) {
      setSelectedCO(officer);
      setEditCOModalOpen(true);
    }
  };

  const handleEditReport = (id: string) => {
    const report = branchData.reports.find(r => r.id === id);
    if (report) {
      setSelectedReport(report);
      setEditReportModalOpen(true);
    }
  };

  const handleEditMissedReport = (id: string) => {
    const report = branchData.missedReports.find(r => r.id === id);
    if (report) {
      setSelectedMissedReport(report);
      setEditMissedReportModalOpen(true);
    }
  };

  // Save handlers
  const handleSaveCO = (officer: typeof branchData.creditOfficers[0]) => {
    console.log('Saving Credit Officer:', officer);
    // TODO: Implement actual update API call
    // Example: await updateCreditOfficer(officer.id, officer);
    
    // Show success notification
    success(`Credit Officer "${officer.name}" updated successfully!`);
  };

  const handleSaveReport = (report: typeof branchData.reports[0]) => {
    console.log('Saving Report:', report);
    // TODO: Implement actual update API call
    // Example: await updateReport(report.id, report);
    
    // Show success notification
    success(`Report "${report.reportId}" updated successfully!`);
  };

  const handleSaveMissedReport = (report: typeof branchData.missedReports[0]) => {
    console.log('Saving Missed Report:', report);
    // TODO: Implement actual update API call
    // Example: await updateMissedReport(report.id, report);
    
    // Show success notification
    success(`Missed Report "${report.reportId}" updated successfully!`);
  };

  // Confirmation dialog state
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Assign Users Modal state
  const [showAssignUsersModal, setShowAssignUsersModal] = useState(false);
  const [currentlyAssignedUsers, setCurrentlyAssignedUsers] = useState<string[]>([]);

  // Loan Details Modal handlers
  const handleViewLoanDetails = (id: string) => {
    const report = branchData.reports.find(r => r.id === id);
    if (report) {
      // Transform report data to LoanDetailsData format
      const loanData: LoanDetailsData = {
        reportId: report.reportId,
        creditOfficer: report.branchName, // Using branchName as credit officer for demo
        branch: branchData.branchInfo.name, // Using actual branch name
        loansDispursed: Math.floor(Math.random() * 50) + 10, // Sample data
        loansValueDispursed: `₦${(Math.random() * 5000000 + 1000000).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`,
        savingsCollected: `₦${(Math.random() * 1000000 + 100000).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`,
        repaymentsCollected: Math.floor(Math.random() * 30) + 5,
        dateSent: report.date,
        timeSent: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
      
      setSelectedLoanData(loanData);
      setLoanDetailsModalOpen(true);
    }
  };

  const handleApproveLoan = () => {
    setShowApproveConfirm(true);
  };

  const handleDeclineLoan = () => {
    setShowDeclineConfirm(true);
  };

  const confirmApproveLoan = async () => {
    if (!selectedLoanData) return;
    
    setIsProcessing(true);
    try {
      console.log('Approving loan report:', selectedLoanData.reportId);
      // TODO: Implement actual approve API call
      // Example: await approveLoanReport(selectedLoanData.reportId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success(`Loan report "${selectedLoanData.reportId}" approved successfully!`);
      setShowApproveConfirm(false);
      setLoanDetailsModalOpen(false);
      setSelectedLoanData(null);
    } catch (error) {
      showError('Failed to approve loan report. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeclineLoan = async () => {
    if (!selectedLoanData) return;
    
    setIsProcessing(true);
    try {
      console.log('Declining loan report:', selectedLoanData.reportId);
      // TODO: Implement actual decline API call
      // Example: await declineLoanReport(selectedLoanData.reportId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success(`Loan report "${selectedLoanData.reportId}" declined.`);
      setShowDeclineConfirm(false);
      setLoanDetailsModalOpen(false);
      setSelectedLoanData(null);
    } catch (error) {
      showError('Failed to decline loan report. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Assign Users Handler
  const handleAssignUsers = (selectedUserIds: string[]) => {
    console.log('Assigning users to branch:', selectedUserIds);
    // TODO: Implement actual API call to assign users
    // Example: await assignUsersToBranch(params.id, selectedUserIds);
    
    setCurrentlyAssignedUsers(selectedUserIds);
    
    const userCount = selectedUserIds.length;
    if (userCount === 0) {
      success('All users unassigned from branch');
    } else {
      success(`${userCount} user${userCount > 1 ? 's' : ''} assigned to branch successfully!`);
    }
  };

  // Missed Reports - View Details Handler
  const handleViewMissedLoanDetails = (id: string) => {
    const report = branchData.missedReports.find(r => r.id === id);
    if (report) {
      // Transform missed report data to LoanDetailsData format
      const loanData: LoanDetailsData = {
        reportId: report.reportId,
        creditOfficer: report.branchName,
        branch: branchData.branchInfo.name,
        loansDispursed: Math.floor(Math.random() * 50) + 10,
        loansValueDispursed: `₦${(Math.random() * 5000000 + 1000000).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`,
        savingsCollected: `₦${(Math.random() * 1000000 + 100000).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`,
        repaymentsCollected: Math.floor(Math.random() * 30) + 5,
        dateSent: report.dateDue,
        timeSent: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
      
      setSelectedLoanData(loanData);
      setLoanDetailsModalOpen(true);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // TODO: Implement actual data fetching
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Transform generated data to component format
  const statisticsData = [
    {
      label: "All CO's",
      value: branchData.statistics.allCOs.value,
      change: branchData.statistics.allCOs.change,
      changeLabel: branchData.statistics.allCOs.changeLabel
    },
    {
      label: 'All Customers',
      value: branchData.statistics.allCustomers.value,
      change: branchData.statistics.allCustomers.change,
      changeLabel: branchData.statistics.allCustomers.changeLabel
    },
    {
      label: 'Active Loans',
      value: branchData.statistics.activeLoans.value,
      change: branchData.statistics.activeLoans.change,
      changeLabel: branchData.statistics.activeLoans.changeLabel
    },
    {
      label: 'Loans Processed',
      value: branchData.statistics.loansProcessed.amount,
      change: branchData.statistics.loansProcessed.change,
      changeLabel: branchData.statistics.loansProcessed.changeLabel,
      isCurrency: true
    }
  ];

  const branchInfoFields = [
    { label: 'Branch Name', value: branchData.branchInfo.name },
    { label: 'Branch ID', value: branchData.branchInfo.branchId },
    { label: 'Date Created', value: branchData.branchInfo.dateCreated },
    { label: 'Region', value: branchData.branchInfo.region }
  ];

  // Loading skeleton
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="drawer-content flex flex-col min-h-screen">
        <main className="flex-1 pl-[58px] pr-6 pt-6">
          <div className="max-w-[1200px]">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center max-w-md">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {id ? 'Branch Not Found' : 'Error Loading Branch'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {error || 'The branch you are looking for does not exist or has been removed.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Branches
                  </button>
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="drawer-content flex flex-col min-h-screen">
      <main className="flex-1 pl-[58px] pr-6" style={{ paddingTop: '40px' }}>
        {/* Container with proper max width */}
        <div className="w-full" style={{ maxWidth: '1200px' }}>
          {/* Header Section with Back and Title + Button */}
          <div className="mb-6">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-4 hover:opacity-70 transition-opacity flex items-center gap-2"
              aria-label="Go back to branches list"
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

            {/* Title and Button Row */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Branch Details
              </h1>

              <button
                className="px-[18px] py-[10px] text-white font-semibold rounded-lg transition-colors duration-200"
                style={{ backgroundColor: 'var(--color-primary-600)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6941C6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-600)')}
                onClick={() => setShowAssignUsersModal(true)}
              >
                Assign Users To Branch
              </button>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="mb-6">
            <BranchDetailsStatistics sections={statisticsData} />
          </div>

          {/* Branch Info Card */}
          <div className="mb-8">
            <BranchInfoCard fields={branchInfoFields} />
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <BranchDetailsTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'credit-officers' && (
              <div
                role="tabpanel"
                id="credit-officers-panel"
                aria-labelledby="credit-officers-tab"
              >
                <CreditOfficersTable 
                  data={branchData.creditOfficers}
                  onEdit={handleEditCO}
                  onDelete={handleDeleteCO}
                />
                
                <Pagination 
                  totalPages={10}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
            {activeTab === 'reports' && (
              <div
                role="tabpanel"
                id="reports-panel"
                aria-labelledby="reports-tab"
              >
                <ReportsTable 
                  data={branchData.reports}
                  onEdit={handleEditReport}
                  onDelete={handleDeleteReport}
                  onViewDetails={handleViewLoanDetails}
                />
                
                <Pagination 
                  totalPages={10}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
            {activeTab === 'missed-reports' && (
              <div
                role="tabpanel"
                id="missed-reports-panel"
                aria-labelledby="missed-reports-tab"
              >
                <MissedReportsTable 
                  data={branchData.missedReports}
                  onEdit={handleEditMissedReport}
                  onDelete={handleDeleteMissedReport}
                  onViewDetails={handleViewMissedLoanDetails}
                />
                
                <Pagination 
                  totalPages={10}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
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

      {/* Edit Credit Officer Modal */}
      <EditCreditOfficerModal
        isOpen={editCOModalOpen}
        onClose={() => {
          setEditCOModalOpen(false);
          setSelectedCO(null);
        }}
        onSave={handleSaveCO}
        officer={selectedCO}
      />

      {/* Edit Report Modal */}
      <EditReportModal
        isOpen={editReportModalOpen}
        onClose={() => {
          setEditReportModalOpen(false);
          setSelectedReport(null);
        }}
        onSave={handleSaveReport}
        report={selectedReport}
      />

      {/* Edit Missed Report Modal */}
      <EditMissedReportModal
        isOpen={editMissedReportModalOpen}
        onClose={() => {
          setEditMissedReportModalOpen(false);
          setSelectedMissedReport(null);
        }}
        onSave={handleSaveMissedReport}
        report={selectedMissedReport}
      />

      {/* Loan Details Modal */}
      {selectedLoanData && (
        <LoanDetailsModal
          isOpen={loanDetailsModalOpen}
          onClose={() => {
            setLoanDetailsModalOpen(false);
            setSelectedLoanData(null);
          }}
          loanData={selectedLoanData}
          onApprove={handleApproveLoan}
          onDecline={handleDeclineLoan}
        />
      )}

      {/* Approve Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={confirmApproveLoan}
        title="Approve Loan Report"
        message={`Are you sure you want to approve loan report "${selectedLoanData?.reportId}"? This action cannot be undone.`}
        confirmText="Approve"
        cancelText="Cancel"
        confirmButtonStyle="success"
        isLoading={isProcessing}
      />

      {/* Decline Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeclineConfirm}
        onClose={() => setShowDeclineConfirm(false)}
        onConfirm={confirmDeclineLoan}
        title="Decline Loan Report"
        message={`Are you sure you want to decline loan report "${selectedLoanData?.reportId}"? This action cannot be undone.`}
        confirmText="Decline"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        isLoading={isProcessing}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Assign Users Modal */}
      <AssignUsersModal
        isOpen={showAssignUsersModal}
        onClose={() => setShowAssignUsersModal(false)}
        onSubmit={handleAssignUsers}
        branchName={branchData.branchInfo.name}
        currentlyAssignedUsers={currentlyAssignedUsers}
      />
    </div>
  );
}
