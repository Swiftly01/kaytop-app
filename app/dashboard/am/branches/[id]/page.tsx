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
import { dashboardService } from '@/lib/services/dashboard';
import { unifiedUserService } from '@/lib/services/unifiedUser';
import { reportsService } from '@/lib/services/reports';
import type { ReportStatistics } from '@/lib/api/types';

// TypeScript Interfaces
interface AMBranchDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function AMBranchDetailsPage({ params }: AMBranchDetailsPageProps) {
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
  const [branchData, setBranchData] = useState<any | null>(null);
  const [creditOfficers, setCreditOfficers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [missedReports, setMissedReports] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [branchReportStats, setBranchReportStats] = useState<ReportStatistics | null>(null);

  // Fetch branch data on component mount
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create mock branch details since we're using unified services
        const mockBranchDetails = {
          id: id,
          name: `Branch ${id}`,
          code: `BR-${id.padStart(4, '0')}`,
          region: 'Lagos',
          state: 'Lagos',
          dateCreated: '2024-01-15',
          createdAt: '2024-01-15T10:00:00Z',
          manager: 'John Manager',
          phone: '+234 801 234 5678',
          email: `branch${id}@kaytop.com`,
          address: `${id} Branch Street, Lagos`,
          statistics: {
            totalCreditOfficers: 5,
            creditOfficersGrowth: 12.5,
            totalCustomers: 150,
            customersGrowth: 8.7,
            activeLoans: 45,
            activeLoansGrowth: 15.3,
            loansProcessed: 2500000,
            loansProcessedGrowth: 22.1
          }
        };
        
        setBranchData(mockBranchDetails);
        
        // Fetch real branch report statistics
        let branchReportStats: ReportStatistics | null = null;
        try {
          branchReportStats = await reportsService.getBranchReportStatistics(id, {
            // Use current month as default filter
            dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0],
          });
          setBranchReportStats(branchReportStats);
        } catch (reportError) {
          console.warn('Failed to fetch branch report statistics:', reportError);
          setBranchReportStats(null);
        }
        
        // Transform statistics for the component, including report statistics
        const transformedStats = {
          allCOs: {
            value: mockBranchDetails.statistics.totalCreditOfficers,
            change: mockBranchDetails.statistics.creditOfficersGrowth,
            changeLabel: mockBranchDetails.statistics.creditOfficersGrowth > 0 
              ? `+${mockBranchDetails.statistics.creditOfficersGrowth}% this month`
              : `${mockBranchDetails.statistics.creditOfficersGrowth}% this month`
          },
          allCustomers: {
            value: mockBranchDetails.statistics.totalCustomers,
            change: mockBranchDetails.statistics.customersGrowth,
            changeLabel: mockBranchDetails.statistics.customersGrowth > 0 
              ? `+${mockBranchDetails.statistics.customersGrowth}% this month`
              : `${mockBranchDetails.statistics.customersGrowth}% this month`
          },
          activeLoans: {
            value: mockBranchDetails.statistics.activeLoans,
            change: mockBranchDetails.statistics.activeLoansGrowth,
            changeLabel: mockBranchDetails.statistics.activeLoansGrowth > 0 
              ? `+${mockBranchDetails.statistics.activeLoansGrowth}% this month`
              : `${mockBranchDetails.statistics.activeLoansGrowth}% this month`
          },
          loansProcessed: {
            amount: mockBranchDetails.statistics.loansProcessed,
            change: mockBranchDetails.statistics.loansProcessedGrowth,
            changeLabel: mockBranchDetails.statistics.loansProcessedGrowth > 0 
              ? `+${mockBranchDetails.statistics.loansProcessedGrowth}% this month`
              : `${mockBranchDetails.statistics.loansProcessedGrowth}% this month`
          },
          // Add real report statistics
          totalReports: branchReportStats ? {
            value: branchReportStats.totalReports.count,
            change: branchReportStats.totalReports.growth,
            changeLabel: `${branchReportStats.totalReports.growth >= 0 ? '+' : ''}${branchReportStats.totalReports.growth}% this month`
          } : {
            value: 0,
            change: 0,
            changeLabel: 'No data available'
          },
          pendingReports: branchReportStats ? {
            value: branchReportStats.pendingReports.count,
            change: branchReportStats.pendingReports.growth,
            changeLabel: `${branchReportStats.pendingReports.growth >= 0 ? '+' : ''}${branchReportStats.pendingReports.growth}% this month`
          } : {
            value: 0,
            change: 0,
            changeLabel: 'No data available'
          },
          missedReports: branchReportStats ? {
            value: branchReportStats.missedReports.count,
            change: branchReportStats.missedReports.growth,
            changeLabel: `${branchReportStats.missedReports.growth >= 0 ? '+' : ''}${branchReportStats.missedReports.growth}% this month`
          } : {
            value: 0,
            change: 0,
            changeLabel: 'No data available'
          }
        };
        setStatistics(transformedStats);
        
        // Fetch real credit officers data for this branch
        let creditOfficersData: any[] = [];
        try {
          // Use unified services to get credit officers for this branch
          const branchUsersResponse = await unifiedUserService.getUsers({ 
            branch: `Branch ${id}`, 
            role: 'credit_officer',
            page: 1, 
            limit: 100 
          });
          creditOfficersData = branchUsersResponse?.data || [];
        } catch (creditOfficersError) {
          console.warn('Failed to fetch credit officers:', creditOfficersError);
          creditOfficersData = [];
        }
        setCreditOfficers(creditOfficersData);
        
        // Fetch real reports data for this branch
        let reportsData: any[] = [];
        try {
          const reportsResponse = await reportsService.getAllReports({
            page: 1,
            limit: 100,
            branchId: id
          });
          
          // Transform reports to component format
          reportsData = (reportsResponse.data || []).map(report => ({
            id: report.id,
            reportId: report.reportId,
            creditOfficer: report.creditOfficer,
            status: report.status,
            dateSubmitted: report.createdAt,
            timeSent: report.timeSent || new Date(report.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          }));
        } catch (reportsError) {
          console.warn('Failed to fetch reports:', reportsError);
          reportsData = [];
        }
        setReports(reportsData);
        
        // Fetch real missed reports data for this branch
        let missedReportsData: any[] = [];
        try {
          const missedReportsResponse = await reportsService.getMissedReports(id, {
            // Use current month as default filter
            dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0],
          });
          
          // Transform missed reports to match MissedReportsTable interface
          missedReportsData = missedReportsResponse.map(report => ({
            id: report.id,
            reportId: report.reportId,
            branchName: report.branch || `Branch ${id}`,
            status: 'Missed' as const,
            dateDue: report.dateSent || report.createdAt,
          }));
          
        } catch (missedReportsError) {
          console.warn('Failed to fetch missed reports:', missedReportsError);
          // Fall back to empty array if API fails
          missedReportsData = [];
        }
        setMissedReports(missedReportsData);

      } catch (err) {
        console.error('Failed to fetch branch data:', err);
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
      // Use unified services for report actions
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'approve') {
        success('Report approved successfully');
      } else {
        success('Report declined successfully');
      }
      
      // Update reports data locally
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { ...report, status: action === 'approve' ? 'approved' : 'declined' }
            : report
        )
      );
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

  const { data: currentPageData, totalPages } = getCurrentPageData();

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
              <BranchDetailsStatistics sections={[
                {
                  label: "All CO's",
                  value: statistics.allCOs.value,
                  change: statistics.allCOs.change,
                  changeLabel: statistics.allCOs.changeLabel
                },
                {
                  label: "All Customers",
                  value: statistics.allCustomers.value,
                  change: statistics.allCustomers.change,
                  changeLabel: statistics.allCustomers.changeLabel
                },
                {
                  label: "Active Loans",
                  value: statistics.activeLoans.value,
                  change: statistics.activeLoans.change,
                  changeLabel: statistics.activeLoans.changeLabel
                },
                {
                  label: "Loans Processed",
                  value: statistics.loansProcessed.amount,
                  change: statistics.loansProcessed.change,
                  changeLabel: statistics.loansProcessed.changeLabel,
                  isCurrency: true
                },
                // Add report statistics
                {
                  label: "Total Reports",
                  value: statistics.totalReports.value,
                  change: statistics.totalReports.change,
                  changeLabel: statistics.totalReports.changeLabel
                },
                {
                  label: "Pending Reports",
                  value: statistics.pendingReports.value,
                  change: statistics.pendingReports.change,
                  changeLabel: statistics.pendingReports.changeLabel
                },
                {
                  label: "Missed Reports",
                  value: statistics.missedReports.value,
                  change: statistics.missedReports.change,
                  changeLabel: statistics.missedReports.changeLabel
                }
              ]} />
            </div>
          )}

          {/* Branch Info Card */}
          <div className="mb-8">
            <BranchInfoCard
              fields={[
                { label: 'Branch Name', value: branchData.name },
                { label: 'Branch ID', value: branchData.code || branchData.id },
                { label: 'Region', value: branchData.region || branchData.state },
                { label: 'Date Created', value: new Date(branchData.dateCreated || branchData.createdAt).toLocaleDateString() },
                { label: 'Manager', value: branchData.manager || 'Not assigned' },
                { label: 'Phone', value: branchData.phone || 'Not provided' },
                { label: 'Email', value: branchData.email || 'Not provided' },
                { label: 'Address', value: branchData.address || 'Not provided' }
              ]}
            />
          </div>

          {/* Tabs Section */}
          <div className="mb-6">
            <BranchDetailsTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Content based on active tab */}
          <div className="mb-6">
            {activeTab === 'credit-officers' && (
              <CreditOfficersTable
                data={currentPageData}
                onEdit={() => {}} // AM users can't edit credit officers
                onDelete={() => {}} // AM users can't delete credit officers
              />
            )}

            {activeTab === 'reports' && (
              <ReportsTable
                reports={currentPageData}
                selectedReports={[]}
                onSelectionChange={() => {}}
                onEdit={() => {}} // AM users can approve/decline but not edit
              />
            )}

            {activeTab === 'missed-reports' && (
              <MissedReportsTable
                data={currentPageData}
                onEdit={() => {}} // AM users can't edit missed reports
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