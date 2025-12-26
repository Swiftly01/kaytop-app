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
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import { PageSkeleton } from '@/app/_components/ui/Skeleton';
import { amBranchService, type AMBranchDetails, type AMReport } from '@/lib/services/amBranches';

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

export default function AMBranchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise (Next.js 15+ requirement)
  const { id } = use(params);
  
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'credit-officers' | 'reports' | 'missed-reports'>('credit-officers');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // API data state
  const [branchData, setBranchData] = useState<AMBranchDetails | null>(null);
  const [creditOfficers, setCreditOfficers] = useState<any[]>([]);
  const [reports, setReports] = useState<AMReport[]>([]);
  const [missedReports, setMissedReports] = useState<AMReport[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  // Fetch branch data on component mount
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch AM branch details
        const branchDetails = await amBranchService.getBranchById(id);
        setBranchData(branchDetails);
        
        // Transform statistics for the component
        const transformedStats = {
          allCOs: {
            value: branchDetails.statistics.totalCreditOfficers,
            change: branchDetails.statistics.creditOfficersGrowth,
            changeLabel: branchDetails.statistics.creditOfficersGrowth > 0 
              ? `+${branchDetails.statistics.creditOfficersGrowth}% this month`
              : `${branchDetails.statistics.creditOfficersGrowth}% this month`
          },
          allCustomers: {
            value: branchDetails.statistics.totalCustomers,
            change: branchDetails.statistics.customersGrowth,
            changeLabel: branchDetails.statistics.customersGrowth > 0 
              ? `+${branchDetails.statistics.customersGrowth}% this month`
              : `${branchDetails.statistics.customersGrowth}% this month`
          },
          activeLoans: {
            value: branchDetails.statistics.activeLoans,
            change: branchDetails.statistics.activeLoansGrowth,
            changeLabel: branchDetails.statistics.activeLoansGrowth > 0 
              ? `+${branchDetails.statistics.activeLoansGrowth}% this month`
              : `${branchDetails.statistics.activeLoansGrowth}% this month`
          },
          loansProcessed: {
            amount: branchDetails.statistics.loansProcessed,
            change: branchDetails.statistics.loansProcessedGrowth,
            changeLabel: branchDetails.statistics.loansProcessedGrowth > 0 
              ? `+${branchDetails.statistics.loansProcessedGrowth}% this month`
              : `${branchDetails.statistics.loansProcessedGrowth}% this month`
          }
        };
        setStatistics(transformedStats);
        
        // Fetch credit officers for this branch
        try {
          const creditOfficersResponse = await amBranchService.getBranchCreditOfficers(id, { page: 1, limit: 100 });
          setCreditOfficers(creditOfficersResponse.data || []);
        } catch (coError) {
          console.warn('Credit officers data not available:', coError);
          setCreditOfficers([]);
        }
        
        // Fetch reports for this branch
        try {
          const reportsResponse = await amBranchService.getBranchReports(id, { page: 1, limit: 100 });
          setReports(reportsResponse.data || []);
        } catch (reportsError) {
          console.warn('Reports data not available:', reportsError);
          setReports([]);
        }
        
        // Fetch missed reports for this branch
        try {
          const missedReportsResponse = await amBranchService.getBranchMissedReports(id, { page: 1, limit: 100 });
          setMissedReports(missedReportsResponse.data || []);
        } catch (missedError) {
          console.warn('Missed reports data not available:', missedError);
          setMissedReports([]);
        }

      } catch (err) {
        console.error('Failed to fetch AM branch data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load branch data');
        showError('Failed to load branch data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBranchData();
    }
  }, [id, showError]);

  const handleBack = () => {
    router.push('/dashboard/am/branches');
  };

  const handleTabChange = (tab: 'credit-officers' | 'reports' | 'missed-reports') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset pagination when switching tabs
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle report approval/decline
  const handleReportAction = async (reportId: string, action: 'approve' | 'decline', notes?: string) => {
    try {
      if (action === 'approve') {
        await amBranchService.approveReport(reportId, { action, notes });
        success('Report approved successfully');
      } else {
        await amBranchService.declineReport(reportId, { action, notes });
        success('Report declined successfully');
      }
      
      // Refresh reports data
      const reportsResponse = await amBranchService.getBranchReports(id, { page: 1, limit: 100 });
      setReports(reportsResponse.data || []);
    } catch (err) {
      console.error('Failed to update report:', err);
      showError(`Failed to ${action} report. Please try again.`);
    }
  };

  // Get current page data based on active tab
  const getCurrentPageData = () => {
    let data: any[] = [];
    switch (activeTab) {
      case 'credit-officers':
        data = creditOfficers;
        break;
      case 'reports':
        data = reports;
        break;
      case 'missed-reports':
        data = missedReports;
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

  if (error || !branchData) {
    return (
      <div className="drawer-content flex flex-col">
        <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
          <div className="max-w-[1150px]">
            <div className="bg-white rounded-lg border border-[#EAECF0] p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error ? 'Error Loading Branch' : 'Branch Not Found'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {error || 'The requested branch could not be found.'}
              </p>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-[#7F56D9] hover:text-[#6941C6] transition-colors"
              >
                Back to Branches
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
            className="mb-4 hover:opacity-70 transition-opacity flex items-center gap-2"
            aria-label="Go back to branches list"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="#667085"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium text-[#667085]">Back to Branches</span>
          </button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#101828] mb-2">
              {branchData.name}
            </h1>
            <p className="text-base text-[#667085]">
              Branch ID: {branchData.code || branchData.id} • {branchData.region || branchData.state}
            </p>
          </div>

          {/* Statistics Section */}
          {statistics && (
            <div className="mb-8">
              <BranchDetailsStatistics statistics={statistics} />
            </div>
          )}

          {/* Branch Info Card */}
          <div className="mb-8">
            <BranchInfoCard
              branchName={branchData.name}
              branchId={branchData.code || branchData.id}
              region={branchData.region || branchData.state}
              dateCreated={new Date(branchData.dateCreated || branchData.createdAt)}
              manager={branchData.manager}
              phone={branchData.phone}
              email={branchData.email}
              address={branchData.address}
            />
          </div>

          {/* Tabs Section */}
          <div className="mb-6">
            <BranchDetailsTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              creditOfficersCount={creditOfficers.length}
              reportsCount={reports.length}
              missedReportsCount={missedReports.length}
            />
          </div>

          {/* Content based on active tab */}
          <div className="mb-6">
            {activeTab === 'credit-officers' && (
              <CreditOfficersTable
                data={currentPageData}
                onEdit={() => {}} // AM users can't edit credit officers
                onDelete={() => {}} // AM users can't delete credit officers
                readOnly={true} // Make table read-only for AM users
              />
            )}

            {activeTab === 'reports' && (
              <ReportsTable
                data={currentPageData}
                onApprove={(reportId, notes) => handleReportAction(reportId, 'approve', notes)}
                onDecline={(reportId, notes) => handleReportAction(reportId, 'decline', notes)}
                onEdit={() => {}} // AM users can approve/decline but not edit
                readOnly={false} // Allow approve/decline actions
              />
            )}

            {activeTab === 'missed-reports' && (
              <MissedReportsTable
                data={currentPageData}
                onEdit={() => {}} // AM users can't edit missed reports
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
                There are no {activeTab.replace('-', ' ')} for this branch yet.
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