'use client';

import { useState, useEffect, use } from 'react';
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
import { userService } from '@/lib/services/users';
import { dashboardService } from '@/lib/services/dashboard';
import { branchService } from '@/lib/services/branches';
import { reportsService } from '@/lib/services/reports';

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
  status: 'Active' | 'Inactive';
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
  
  // API data state
  const [branchData, setBranchData] = useState<any>(null);
  const [creditOfficers, setCreditOfficers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [missedReports, setMissedReports] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: string } | null>(null);
  
  // Edit modal state
  const [editCOModalOpen, setEditCOModalOpen] = useState(false);
  const [editReportModalOpen, setEditReportModalOpen] = useState(false);
  const [editMissedReportModalOpen, setEditMissedReportModalOpen] = useState(false);
  const [selectedCO, setSelectedCO] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedMissedReport, setSelectedMissedReport] = useState<any>(null);

  // Fetch branch data on component mount
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch branch details from API
        const branchDetails = await branchService.getBranchById(id);
        
        // Fetch users by branch (credit officers and customers)
        const branchUsers = await userService.getUsersByBranch(id, { page: 1, limit: 100 });
        
        // Filter credit officers and customers
        const officers = branchUsers.data.filter(user => user.role === 'credit_officer');
        const customers = branchUsers.data.filter(user => user.role === 'customer');
        
        setCreditOfficers(officers);
        
        // Fetch real reports data from API
        try {
          const reportsResponse = await reportsService.getAllReports({
            branchId: id,
            page: 1,
            limit: 100
          });
          
          // Transform API reports to component format
          const apiReports = reportsResponse.data.map(report => ({
            id: report.id,
            reportId: report.reportId,
            creditOfficer: report.creditOfficer,
            creditOfficerId: report.creditOfficerId,
            branch: report.branch,
            branchId: report.branchId,
            email: report.email,
            reportType: report.reportType,
            status: report.status,
            dateSubmitted: report.createdAt,
            dateSent: report.dateSent,
            timeSent: report.timeSent,
            loansDispursed: report.loansDispursed,
            loansValueDispursed: report.loansValueDispursed,
            savingsCollected: report.savingsCollected,
            repaymentsCollected: report.repaymentsCollected,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt
          }));
          
          // Filter submitted reports and missed reports
          const submittedReports = apiReports.filter(report => 
            report.status === 'submitted' || report.status === 'approved' || report.status === 'declined'
          );
          
          const missedReports = apiReports.filter(report => 
            report.status === 'pending'
          ).map(report => ({
            ...report,
            dueDate: report.createdAt,
            dateDue: new Date(report.createdAt).toLocaleDateString(),
            daysMissed: Math.max(1, Math.floor((Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24))),
            status: 'Overdue'
          }));
          
          setReports(submittedReports);
          setMissedReports(missedReports);
          
        } catch (reportsError) {
          console.warn('Reports API not available, using fallback data:', reportsError);
          
          // Fallback: Create minimal reports based on credit officers if API fails
          const fallbackReports = officers.slice(0, Math.min(5, officers.length)).map((officer, index) => ({
            id: `report-${officer.id}-${index}`,
            reportId: `RPT-${Date.now()}-${index}`,
            creditOfficer: `${officer.firstName} ${officer.lastName}`,
            creditOfficerId: officer.id.toString(),
            branch: branchDetails.name,
            branchId: id,
            email: officer.email,
            reportType: 'monthly' as const,
            status: 'submitted' as const,
            dateSubmitted: new Date().toISOString(),
            dateSent: new Date().toLocaleDateString(),
            timeSent: new Date().toLocaleTimeString(),
            loansDispursed: 0,
            loansValueDispursed: '₦0',
            savingsCollected: '₦0',
            repaymentsCollected: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          const fallbackMissedReports = officers.slice(0, Math.min(2, officers.length)).map((officer, index) => ({
            id: `missed-${officer.id}-${index}`,
            reportId: `MRP-${Date.now()}-${index}`,
            creditOfficer: `${officer.firstName} ${officer.lastName}`,
            creditOfficerId: officer.id.toString(),
            branch: branchDetails.name,
            branchId: id,
            email: officer.email,
            reportType: 'weekly' as const,
            dueDate: new Date().toISOString(),
            dateDue: new Date().toLocaleDateString(),
            daysMissed: 1,
            status: 'Overdue'
          }));
          
          setReports(fallbackReports);
          setMissedReports(fallbackMissedReports);
        }
        
        // Transform branch statistics to component format
        const branchStats = {
          allCOs: {
            value: branchDetails.statistics.totalCreditOfficers,
            change: branchDetails.statistics.creditOfficersGrowth,
            changeLabel: `${branchDetails.statistics.creditOfficersGrowth >= 0 ? '+' : ''}${branchDetails.statistics.creditOfficersGrowth}% this month`
          },
          allCustomers: {
            value: branchDetails.statistics.totalCustomers,
            change: branchDetails.statistics.customersGrowth,
            changeLabel: `${branchDetails.statistics.customersGrowth >= 0 ? '+' : ''}${branchDetails.statistics.customersGrowth}% this month`
          },
          activeLoans: {
            value: branchDetails.statistics.activeLoans,
            change: branchDetails.statistics.activeLoansGrowth,
            changeLabel: `${branchDetails.statistics.activeLoansGrowth >= 0 ? '+' : ''}${branchDetails.statistics.activeLoansGrowth}% this month`
          },
          totalDisbursed: {
            value: branchDetails.statistics.totalDisbursed,
            change: branchDetails.statistics.totalDisbursedGrowth,
            changeLabel: `${branchDetails.statistics.totalDisbursedGrowth >= 0 ? '+' : ''}${branchDetails.statistics.totalDisbursedGrowth}% this month`
          }
        };
        
        setStatistics(branchStats);
        
        // Set branch data (reports and missedReports are set separately above)
        setBranchData({
          id: branchDetails.id,
          name: branchDetails.name,
          code: branchDetails.code,
          address: branchDetails.address,
          region: branchDetails.region,
          state: branchDetails.state,
          status: branchDetails.status,
          dateCreated: new Date(branchDetails.dateCreated),
          statistics: branchStats,
          creditOfficers: officers
        });
        
      } catch (err) {
        console.error('Error fetching branch data:', err);
        setError('Failed to load branch data');
        showError('Failed to load branch data');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBranchData();
    }
  }, [id, showError]);
  
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
  const handleDeleteCO = (coId: string) => {
    const officer = creditOfficers.find(co => co.id === coId);
    if (officer) {
      setItemToDelete({ id: coId, name: `${officer.firstName} ${officer.lastName}`, type: 'Credit Officer' });
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setItemToDelete({ id: reportId, name: report.creditOfficer, type: 'Report' });
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteMissedReport = (reportId: string) => {
    const report = missedReports.find(r => r.id === reportId);
    if (report) {
      setItemToDelete({ id: reportId, name: report.creditOfficer, type: 'Missed Report' });
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
  const handleEditCO = (coId: string) => {
    const officer = creditOfficers.find(co => co.id === coId);
    if (officer) {
      setSelectedCO(officer);
      setEditCOModalOpen(true);
    }
  };

  const handleEditReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setEditReportModalOpen(true);
    }
  };

  const handleEditMissedReport = (reportId: string) => {
    const report = missedReports.find(r => r.id === reportId);
    if (report) {
      setSelectedMissedReport(report);
      setEditMissedReportModalOpen(true);
    }
  };

  // Save handlers
  const handleSaveCO = (officer: any) => {
    console.log('Saving Credit Officer:', officer);
    // TODO: Implement actual update API call
    // Example: await updateCreditOfficer(officer.id, officer);
    
    // Show success notification
    success(`Credit Officer "${officer.firstName} ${officer.lastName}" updated successfully!`);
  };

  const handleSaveReport = (report: any) => {
    console.log('Saving Report:', report);
    // TODO: Implement actual update API call
    // Example: await updateReport(report.id, report);
    
    // Show success notification
    success(`Report "${report.id}" updated successfully!`);
  };

  const handleSaveMissedReport = (report: any) => {
    console.log('Saving Missed Report:', report);
    // TODO: Implement actual update API call
    // Example: await updateMissedReport(report.id, report);
    
    // Show success notification
    success(`Missed Report "${report.id}" updated successfully!`);
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
    const report = reports.find((r: any) => r.id === id);
    if (report) {
      // Transform report data to LoanDetailsData format using real report data
      const loanData: LoanDetailsData = {
        reportId: report.reportId,
        creditOfficer: report.creditOfficer || 'Unknown Officer',
        branch: branchData?.name || 'Unknown Branch',
        loansDispursed: report.loansDispursed || 0, // Use real report data
        loansValueDispursed: report.loansValueDispursed || '₦0',
        savingsCollected: report.savingsCollected || '₦0',
        repaymentsCollected: report.repaymentsCollected || 0,
        dateSent: report.dateSent || new Date().toLocaleDateString(),
        timeSent: report.timeSent || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
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
    const report = missedReports.find((r: any) => r.id === id);
    if (report) {
      // Transform missed report data to LoanDetailsData format using real data
      const loanData: LoanDetailsData = {
        reportId: report.reportId,
        creditOfficer: report.creditOfficer || 'Unknown Officer',
        branch: branchData?.name || `Branch ${id}`,
        loansDispursed: report.loansDispursed || 0, // Use real report data or default to 0
        loansValueDispursed: report.loansValueDispursed || '₦0',
        savingsCollected: report.savingsCollected || '₦0',
        repaymentsCollected: report.repaymentsCollected || 0,
        dateSent: report.dateDue || new Date().toLocaleDateString(),
        timeSent: report.timeSent || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
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

  // Transform API data to component format
  const statisticsData = statistics ? [
    {
      label: "All CO's",
      value: statistics.allCOs.value,
      change: statistics.allCOs.change,
      changeLabel: statistics.allCOs.changeLabel
    },
    {
      label: 'All Customers',
      value: statistics.allCustomers.value,
      change: statistics.allCustomers.change,
      changeLabel: statistics.allCustomers.changeLabel
    },
    {
      label: 'Active Loans',
      value: statistics.activeLoans.value,
      change: statistics.activeLoans.change,
      changeLabel: statistics.activeLoans.changeLabel
    },
    {
      label: 'Total Disbursed',
      value: statistics.totalDisbursed.value,
      change: statistics.totalDisbursed.change,
      changeLabel: statistics.totalDisbursed.changeLabel,
      isCurrency: true
    }
  ] : [];

  const branchInfoFields = branchData ? [
    { label: 'Branch Name', value: branchData.name },
    { label: 'Branch Code', value: branchData.code || branchData.id },
    { label: 'Date Created', value: branchData.dateCreated.toLocaleDateString() },
    { label: 'Region', value: branchData.region },
    { label: 'State', value: branchData.state || 'N/A' },
    { label: 'Status', value: branchData.status || 'Active' },
    { label: 'Address', value: branchData.address || 'Address not available' }
  ] : [];

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
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
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
                  data={creditOfficers}
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
                  reports={reports}
                  selectedReports={[]}
                  onSelectionChange={() => {}}
                  onEdit={handleEditReport}
                  onDelete={handleDeleteReport}
                  onReportClick={(report) => handleViewLoanDetails(report.id)}
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
                  data={missedReports}
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
        confirmButtonStyle="primary"
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
        branchName={branchData?.name || 'this branch'}
        currentlyAssignedUsers={currentlyAssignedUsers}
      />
    </div>
  );
}
