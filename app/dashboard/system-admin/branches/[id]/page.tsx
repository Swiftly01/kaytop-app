'use client';

import { useState } from 'react';
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
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import { PageSkeleton } from '@/app/_components/ui/Skeleton';

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

export default function BranchDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'credit-officers' | 'reports' | 'missed-reports'>('credit-officers');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: string } | null>(null);
  
  // Edit modal state
  const [editCOModalOpen, setEditCOModalOpen] = useState(false);
  const [editReportModalOpen, setEditReportModalOpen] = useState(false);
  const [editMissedReportModalOpen, setEditMissedReportModalOpen] = useState(false);
  const [selectedCO, setSelectedCO] = useState<typeof creditOfficersData[0] | null>(null);
  const [selectedReport, setSelectedReport] = useState<typeof reportsData[0] | null>(null);
  const [selectedMissedReport, setSelectedMissedReport] = useState<typeof missedReportsData[0] | null>(null);

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
    const officer = creditOfficersData.find(co => co.id === id);
    if (officer) {
      setItemToDelete({ id, name: officer.name, type: 'Credit Officer' });
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteReport = (id: string) => {
    const report = reportsData.find(r => r.id === id);
    if (report) {
      setItemToDelete({ id, name: report.branchName, type: 'Report' });
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteMissedReport = (id: string) => {
    const report = missedReportsData.find(r => r.id === id);
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
    const officer = creditOfficersData.find(co => co.id === id);
    if (officer) {
      setSelectedCO(officer);
      setEditCOModalOpen(true);
    }
  };

  const handleEditReport = (id: string) => {
    const report = reportsData.find(r => r.id === id);
    if (report) {
      setSelectedReport(report);
      setEditReportModalOpen(true);
    }
  };

  const handleEditMissedReport = (id: string) => {
    const report = missedReportsData.find(r => r.id === id);
    if (report) {
      setSelectedMissedReport(report);
      setEditMissedReportModalOpen(true);
    }
  };

  // Save handlers
  const handleSaveCO = (officer: typeof creditOfficersData[0]) => {
    console.log('Saving Credit Officer:', officer);
    // TODO: Implement actual update API call
    // Example: await updateCreditOfficer(officer.id, officer);
    
    // Show success notification
    success(`Credit Officer "${officer.name}" updated successfully!`);
  };

  const handleSaveReport = (report: typeof reportsData[0]) => {
    console.log('Saving Report:', report);
    // TODO: Implement actual update API call
    // Example: await updateReport(report.id, report);
    
    // Show success notification
    success(`Report "${report.reportId}" updated successfully!`);
  };

  const handleSaveMissedReport = (report: typeof missedReportsData[0]) => {
    console.log('Saving Missed Report:', report);
    // TODO: Implement actual update API call
    // Example: await updateMissedReport(report.id, report);
    
    // Show success notification
    success(`Missed Report "${report.reportId}" updated successfully!`);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // TODO: Implement actual data fetching
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Sample statistics data
  const statisticsData = [
    {
      label: "All CO's",
      value: 42094,
      change: 6,
      changeLabel: '+6% this month'
    },
    {
      label: 'All Customers',
      value: 15350,
      change: 6,
      changeLabel: '+6% this month'
    },
    {
      label: 'Active Loans',
      value: 28350,
      change: -26,
      changeLabel: '-26% this month'
    },
    {
      label: 'Loans Processed',
      value: 50350.00,
      change: 40,
      changeLabel: '+40% this month',
      isCurrency: true
    }
  ];

  // Sample branch info data
  const branchInfoFields = [
    { label: 'Branch Name', value: 'Mike Salam' },
    { label: 'Branch ID', value: '46729233' },
    { label: 'Date Created', value: 'Jan 15, 2025' },
    { label: 'Region', value: 'Lagos State' }
  ];

  // Sample Reports data
  const reportsData = [
    {
      id: '1',
      reportId: 'ID: 43756',
      branchName: 'Ademola Jumoke',
      timeSent: 'eltford@mac.com',
      date: 'June 03, 2024'
    },
    {
      id: '2',
      reportId: 'ID: 43178',
      branchName: 'Adegboyoga Precious',
      timeSent: 'bradi@comcast.net',
      date: 'Dec 24, 2023'
    },
    {
      id: '3',
      reportId: 'ID: 70668',
      branchName: 'Nneka Chukwu',
      timeSent: 'fwitness@yahoo.ca',
      date: 'Nov 11, 2024'
    },
    {
      id: '4',
      reportId: 'ID: 97174',
      branchName: 'Damilare Usman',
      timeSent: 'plover@aol.com',
      date: 'Feb 02, 2024'
    },
    {
      id: '5',
      reportId: 'ID: 39635',
      branchName: 'Jide Kosoko',
      timeSent: 'crusader@yahoo.com',
      date: 'Aug 18, 2023'
    },
    {
      id: '6',
      reportId: 'ID: 97174',
      branchName: 'Oladeji Israel',
      timeSent: 'mccurley@yahoo.ca',
      date: 'Sept 09, 2024'
    },
    {
      id: '7',
      reportId: 'ID: 22739',
      branchName: 'Eze Chinedu',
      timeSent: 'jginspace@mac.com',
      date: 'July 27, 2023'
    },
    {
      id: '8',
      reportId: 'ID: 22739',
      branchName: 'Adebanji Bolaji',
      timeSent: 'amichalo@msn.com',
      date: 'April 05, 2024'
    },
    {
      id: '9',
      reportId: 'ID: 43756',
      branchName: 'Baba Kaothat',
      timeSent: 'dieman@live.com',
      date: 'Oct 14, 2023'
    },
    {
      id: '10',
      reportId: 'ID: 39635',
      branchName: 'Adebayo Salami',
      timeSent: 'smallpaul@me.com',
      date: 'March 22, 2024'
    }
  ];

  // Sample Missed Reports data
  const missedReportsData = [
    {
      id: '1',
      reportId: 'ID: 43756',
      branchName: 'Ademola Jumoke',
      status: 'Missed' as const,
      dateDue: 'June 03, 2024'
    },
    {
      id: '2',
      reportId: 'ID: 43178',
      branchName: 'Adegboyoga Precious',
      status: 'Missed' as const,
      dateDue: 'Dec 24, 2023'
    },
    {
      id: '3',
      reportId: 'ID: 70668',
      branchName: 'Nneka Chukwu',
      status: 'Missed' as const,
      dateDue: 'Nov 11, 2024'
    },
    {
      id: '4',
      reportId: 'ID: 97174',
      branchName: 'Damilare Usman',
      status: 'Missed' as const,
      dateDue: 'Feb 02, 2024'
    },
    {
      id: '5',
      reportId: 'ID: 39635',
      branchName: 'Jide Kosoko',
      status: 'Missed' as const,
      dateDue: 'Aug 18, 2023'
    },
    {
      id: '6',
      reportId: 'ID: 97174',
      branchName: 'Oladeji Israel',
      status: 'Missed' as const,
      dateDue: 'Sept 09, 2024'
    },
    {
      id: '7',
      reportId: 'ID: 22739',
      branchName: 'Eze Chinedu',
      status: 'Missed' as const,
      dateDue: 'July 27, 2023'
    },
    {
      id: '8',
      reportId: 'ID: 22739',
      branchName: 'Adebanji Bolaji',
      status: 'Missed' as const,
      dateDue: 'April 05, 2024'
    },
    {
      id: '9',
      reportId: 'ID: 43756',
      branchName: 'Baba Kaothat',
      status: 'Missed' as const,
      dateDue: 'Oct 14, 2023'
    },
    {
      id: '10',
      reportId: 'ID: 39635',
      branchName: 'Adebayo Salami',
      status: 'Missed' as const,
      dateDue: 'March 22, 2024'
    }
  ];

  // Sample Credit Officers data
  const creditOfficersData = [
    {
      id: '1',
      name: 'Ademola Jumoke',
      idNumber: '43766',
      status: 'Active' as const,
      phone: '+2348160006000',
      email: 'etford@mac.com',
      dateJoined: 'June 03, 2024'
    },
    {
      id: '2',
      name: 'Adegboyega Precious',
      idNumber: '43178',
      status: 'Active' as const,
      phone: '+234812345678',
      email: 'bradi@comcast.net',
      dateJoined: 'Dec 24, 2023'
    },
    {
      id: '3',
      name: 'Nneka Chukwu',
      idNumber: '70868',
      status: 'In active' as const,
      phone: '+234904449999',
      email: 'fwitness@yahoo.ca',
      dateJoined: 'Nov 11, 2024'
    },
    {
      id: '4',
      name: 'Damilare Usman',
      idNumber: '97174',
      status: 'Active' as const,
      phone: '+234908008888',
      email: 'plover@aol.com',
      dateJoined: 'Feb 02, 2024'
    },
    {
      id: '5',
      name: 'Jide Kosoko',
      idNumber: '39635',
      status: 'Active' as const,
      phone: '+234906123456',
      email: 'crusader@yahoo.com',
      dateJoined: 'Aug 18, 2023'
    },
    {
      id: '6',
      name: 'Oladeji Israel',
      idNumber: '97174',
      status: 'Active' as const,
      phone: '+234805551234',
      email: 'mccurley@yahoo.ca',
      dateJoined: 'Sept 09, 2024'
    },
    {
      id: '7',
      name: 'Eze Chinedu',
      idNumber: '22739',
      status: 'Active' as const,
      phone: '+234808785432',
      email: 'jginspace@mac.com',
      dateJoined: 'July 27, 2023'
    },
    {
      id: '8',
      name: 'Adebanji Bolaji',
      idNumber: '22739',
      status: 'Active' as const,
      phone: '+234806001122',
      email: 'amichalo@msn.com',
      dateJoined: 'April 05, 2024'
    },
    {
      id: '9',
      name: 'Baba Kaothat',
      idNumber: '43756',
      status: 'Active' as const,
      phone: '+234812345678',
      email: 'diaman@live.com',
      dateJoined: 'Oct 14, 2023'
    },
    {
      id: '10',
      name: 'Adebayo Salami',
      idNumber: '39635',
      status: 'Active' as const,
      phone: '+234803345678',
      email: 'smallpaul@me.com',
      dateJoined: 'March 22, 2024'
    }
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
                  {params.id ? 'Branch Not Found' : 'Error Loading Branch'}
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
      <main className="flex-1 pl-[58px] pr-6 pt-6">
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
              <h1 className="text-2xl font-bold" style={{ color: '#021C3E' }}>
                Branch Details
              </h1>

              <button
                className="px-6 py-2.5 bg-[#7F56D9] hover:bg-[#6941C6] text-white font-semibold rounded-lg transition-colors"
                onClick={() => console.log('Assign users')}
              >
                Assign users to branch
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
                  data={creditOfficersData}
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
                  data={reportsData}
                  onEdit={handleEditReport}
                  onDelete={handleDeleteReport}
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
                  data={missedReportsData}
                  onEdit={handleEditMissedReport}
                  onDelete={handleDeleteMissedReport}
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

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
