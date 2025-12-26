'use client';

import React, { useState, useMemo, useEffect } from 'react';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import ReportsTable from '@/app/_components/ui/ReportsTable';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import Pagination from '@/app/_components/ui/Pagination';
import ReportsFiltersModal, { ReportsFilters } from '@/app/_components/ui/ReportsFiltersModal';
import ReportDetailsModal, { ReportDetailsData } from '@/app/_components/ui/ReportDetailsModal';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { amBranchService, type AMReport } from '@/lib/services/amBranches';
import { amDashboardService } from '@/lib/services/amDashboard';
import { DateRange } from 'react-day-picker';

type TimePeriod = '12months' | '30days' | '7days' | '24hours' | null;

export default function AMReportsPage() {
  const { toasts, removeToast, success, error } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('12months');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<AMReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ReportsFilters>({
    creditOfficer: '',
    reportStatus: '',
    reportType: '',
    dateFrom: '',
    dateTo: '',
  });
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReportForDetails, setSelectedReportForDetails] = useState<AMReport | null>(null);
  
  // API data state
  const [reportStatistics, setReportStatistics] = useState<StatSection[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Fetch reports data from AM API
  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setApiError(null);

      // For now, create mock data since we don't have a comprehensive AM reports endpoint
      // In a real implementation, this would call amReportsService.getAllReports() or similar
      const mockReports: AMReport[] = [
        {
          id: '1',
          reportId: 'RPT-001',
          creditOfficer: 'John Doe',
          creditOfficerId: '1',
          branchName: 'Ikeja Branch',
          branchId: '1',
          status: 'pending',
          dateSubmitted: '2024-12-20T10:30:00Z',
          timeSent: '10:30 AM',
          loansDisburse: 5,
          loansValueDisbursed: 500000,
          savingsCollected: 250000,
          repaymentsCollected: 150000,
          notes: 'Monthly report for December'
        },
        {
          id: '2',
          reportId: 'RPT-002',
          creditOfficer: 'Jane Smith',
          creditOfficerId: '2',
          branchName: 'Victoria Island Branch',
          branchId: '2',
          status: 'approved',
          dateSubmitted: '2024-12-19T14:15:00Z',
          timeSent: '2:15 PM',
          loansDisburse: 8,
          loansValueDisbursed: 800000,
          savingsCollected: 400000,
          repaymentsCollected: 300000,
          notes: 'Weekly report - excellent performance'
        },
        {
          id: '3',
          reportId: 'RPT-003',
          creditOfficer: 'Mike Johnson',
          creditOfficerId: '3',
          branchName: 'Surulere Branch',
          branchId: '3',
          status: 'declined',
          dateSubmitted: '2024-12-18T09:45:00Z',
          timeSent: '9:45 AM',
          loansDisburse: 3,
          loansValueDisbursed: 300000,
          savingsCollected: 100000,
          repaymentsCollected: 75000,
          notes: 'Report needs revision'
        }
      ];

      setReports(mockReports);
      setTotalReports(mockReports.length);

      // Fetch AM dashboard statistics for reports
      const dashboardData = await amDashboardService.getKPIs();
      const stats: StatSection[] = [
        {
          label: 'Total Reports',
          value: mockReports.length,
          change: 12.5,
        },
        {
          label: 'Pending Reports',
          value: mockReports.filter(r => r.status === 'pending').length,
          change: -5.2,
        },
        {
          label: 'Approved Reports',
          value: mockReports.filter(r => r.status === 'approved').length,
          change: 8.7,
        },
        {
          label: 'Total Loans Disbursed',
          value: mockReports.reduce((sum, r) => sum + r.loansDisburse, 0),
          change: 15.3,
        },
      ];
      setReportStatistics(stats);

    } catch (err) {
      console.error('Failed to fetch AM reports data:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load reports data');
      error('Failed to load reports data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchReportsData();
  }, []);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setCurrentPage(1);
    console.log('Time period changed:', period);
    // Refresh data with time filter
    fetchReportsData();
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
    console.log('Date range changed:', range);
    // Refresh data with date range filter
    fetchReportsData();
  };

  const handleFilterClick = () => {
    setIsFiltersOpen(true);
  };

  const handleApplyFilters = (filters: ReportsFilters) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    
    const activeCount = Object.values(filters).filter(v => v !== '').length;
    
    if (activeCount > 0) {
      success(`${activeCount} filter${activeCount > 1 ? 's' : ''} applied successfully!`);
    }
  };

  const handleReportClick = (report: any) => {
    // Convert AMReport to the format expected by ReportDetailsModal
    const amReport = report as AMReport;
    setSelectedReportForDetails(amReport);
    setDetailsModalOpen(true);
  };

  const handleApproveReport = async () => {
    if (selectedReportForDetails) {
      try {
        setLoading(true);
        
        await amBranchService.approveReport(selectedReportForDetails.id, {
          action: 'approve',
          notes: 'Report approved by Account Manager'
        });

        // Update the report status in local state
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === selectedReportForDetails.id 
              ? { ...report, status: 'approved' as const }
              : report
          )
        );
        
        success(`Report "${selectedReportForDetails.reportId}" approved successfully!`);
        setDetailsModalOpen(false);
        setSelectedReportForDetails(null);
        
        // Refresh statistics
        await fetchReportsData();
        
      } catch (err) {
        console.error('Failed to approve report:', err);
        error('Failed to approve report. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeclineReport = async () => {
    if (selectedReportForDetails) {
      try {
        setLoading(true);
        
        await amBranchService.declineReport(selectedReportForDetails.id, {
          action: 'decline',
          notes: 'Report declined by Account Manager'
        });

        // Update the report status in local state
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === selectedReportForDetails.id 
              ? { ...report, status: 'declined' as const }
              : report
          )
        );
        
        success(`Report "${selectedReportForDetails.reportId}" declined.`);
        setDetailsModalOpen(false);
        setSelectedReportForDetails(null);
        
        // Refresh statistics
        await fetchReportsData();
        
      } catch (err) {
        console.error('Failed to decline report:', err);
        error('Failed to decline report. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedReports(selectedIds);
    console.log('Selected reports:', selectedIds);
  };

  // Filter and paginate reports
  const filteredReports = reports.filter((report) => {
    // Apply search filters
    if (appliedFilters.creditOfficer && !report.creditOfficer.toLowerCase().includes(appliedFilters.creditOfficer.toLowerCase())) {
      return false;
    }
    if (appliedFilters.reportStatus && report.status !== appliedFilters.reportStatus.toLowerCase()) {
      return false;
    }
    // Add more filter logic as needed
    return true;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

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
                Reports Overview
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
                Monitor and manage branch reports
              </p>
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
            <div
              className="w-full"
              style={{
                maxWidth: '1091px',
                marginBottom: '48px'
              }}
            >
              {loading ? (
                <StatisticsCardSkeleton />
              ) : apiError ? (
                <div className="bg-white rounded-lg border border-[#EAECF0] p-6">
                  <div className="text-center">
                    <p className="text-[#E43535] mb-2">Failed to load statistics</p>
                    <button
                      onClick={() => fetchReportsData()}
                      className="text-[#7F56D9] hover:text-[#6941C6] font-medium"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : (
                <StatisticsCard sections={reportStatistics} />
              )}
            </div>

            {/* Reports Section Title */}
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
                Reports
              </h2>
            </div>

            {/* Reports Table */}
            <div className="max-w-[1075px]">
              {loading ? (
                <TableSkeleton rows={itemsPerPage} />
              ) : paginatedReports.length === 0 ? (
                <div 
                  className="bg-white rounded-[12px] border border-[#EAECF0] p-12 text-center"
                  role="status"
                  aria-live="polite"
                >
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No reports found
                  </h3>
                  <p 
                    className="text-base text-[#475467]"
                    style={{ fontFamily: "'Open Sauce Sans', sans-serif" }}
                  >
                    {apiError ? 'Failed to load reports data. Please try again.' : 'No reports found matching the selected filters.'}
                  </p>
                </div>
              ) : (
                <>
                  <ReportsTable
                    reports={paginatedReports}
                    selectedReports={selectedReports}
                    onSelectionChange={handleSelectionChange}
                    onEdit={() => {}} // AM users can't edit reports directly
                    onDelete={() => {}} // AM users can't delete reports
                    onReportClick={handleReportClick}
                    readOnly={true} // Make table read-only for AM users except approve/decline
                  />

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#475467]">
                          Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length} results
                        </span>
                      </div>

                      <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Reports Filters Modal */}
      <ReportsFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={handleApplyFilters}
        currentFilters={appliedFilters}
      />

      {/* Report Details Modal */}
      {selectedReportForDetails && (
        <ReportDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedReportForDetails(null);
          }}
          reportData={{
            reportId: selectedReportForDetails.reportId,
            creditOfficer: selectedReportForDetails.creditOfficer,
            branch: selectedReportForDetails.branchName,
            email: `${selectedReportForDetails.creditOfficer.toLowerCase().replace(' ', '.')}@example.com`,
            dateSent: selectedReportForDetails.dateSubmitted?.split('T')[0] || new Date().toISOString().split('T')[0],
            timeSent: selectedReportForDetails.timeSent || new Date().toLocaleTimeString(),
            reportType: 'monthly',
            status: selectedReportForDetails.status,
            isApproved: selectedReportForDetails.status === 'approved',
            loansDispursed: selectedReportForDetails.loansDisburse,
            loansValueDispursed: `₦${selectedReportForDetails.loansValueDisbursed.toLocaleString()}`,
            savingsCollected: `₦${selectedReportForDetails.savingsCollected.toLocaleString()}`,
            repaymentsCollected: selectedReportForDetails.repaymentsCollected,
          }}
          onApprove={handleApproveReport}
          onDecline={handleDeclineReport}
        />
      )}
    </div>
  );
}