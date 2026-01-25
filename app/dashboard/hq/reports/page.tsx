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
import { PAGINATION_LIMIT } from '@/lib/config';
import { reportsService } from '@/lib/services/reports';
import { dashboardService } from '@/lib/services/dashboard';
import type { Report, ReportStatistics, ReportFilters as APIReportFilters } from '@/lib/api/types';
import { DateRange } from 'react-day-picker';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';
import { useAuth } from '@/app/context/AuthContext';

export default function ReportsPage() {
  const { session } = useAuth();
  const { toasts, removeToast, success, error } = useToast();

  // Role-based access control
  useEffect(() => {
    // Should generally be accessible to HQ Managers, Account Managers, and System Admins
    const allowedRoles = ['system_admin', 'hq_manager', 'account_manager'];
    if (session && !allowedRoles.includes(session.role)) {
      error('Access denied. This page is only accessible to Managers.');
      // Redirect to appropriate dashboard based on role
      const roleRedirects = {
        'credit_officer': '/dashboard/co',
        'branch_manager': '/dashboard/bm',
        'customer': '/dashboard/customer'
      };
      const redirectPath = roleRedirects[session.role as keyof typeof roleRedirects] || '/dashboard';
      window.location.href = redirectPath;
      return;
    }
  }, [session, error]);

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGINATION_LIMIT);
  const [reports, setReports] = useState<Report[]>([]);
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
  const [selectedReportForDetails, setSelectedReportForDetails] = useState<Report | null>(null);

  // API data state
  const [reportStatistics, setReportStatistics] = useState<ReportStatistics | null>(null);
  const [totalReports, setTotalReports] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch reports data from API
  const fetchReportsData = async (filters?: APIReportFilters) => {
    try {
      setLoading(true);
      setApiError(null);

      console.log('🔍 HQ Reports - Fetching data with filters:', filters);

      // Build API filters from current state
      const apiFilters: APIReportFilters = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      };

      console.log('📋 HQ Reports - API filters:', apiFilters);

      // Note: Backend /reports endpoint does NOT support dateFrom/dateTo filtering
      // Date filtering will be applied to statistics endpoint only
      // For reports list, we fetch all and can filter client-side if needed

      // Store date range for statistics API call
      let statsStartDate: string | undefined;
      let statsEndDate: string | undefined;

      // Apply period filter for statistics
      if (selectedPeriod) {
        const now = new Date();
        let startDate: Date;

        switch (selectedPeriod) {
          case 'last_24_hours':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'last_7_days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'last_30_days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'custom':
          default:
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 12);
            break;
        }

        statsStartDate = startDate.toISOString().split('T')[0];
      }

      // Apply custom date range filter for statistics
      if (dateRange?.from) {
        statsStartDate = dateRange.from.toISOString().split('T')[0];
        if (dateRange.to) {
          statsEndDate = dateRange.to.toISOString().split('T')[0];
        }
      }

      // Apply advanced filters
      if (appliedFilters.creditOfficer) {
        apiFilters.creditOfficerId = appliedFilters.creditOfficer;
      }
      if (appliedFilters.reportStatus) {
        apiFilters.status = appliedFilters.reportStatus.toLowerCase();
      }
      if (appliedFilters.reportType) {
        apiFilters.reportType = appliedFilters.reportType.toLowerCase() as 'daily' | 'weekly' | 'monthly';
      }

      // Fetch reports and statistics with error handling
      const [reportsResponse, statisticsResponse] = await Promise.all([
        reportsService.getAllReports(apiFilters),
        dashboardService.getReportStatistics({
          startDate: statsStartDate,
          endDate: statsEndDate,
          branch: apiFilters.branchId,
        }).catch(statsError => {
          console.warn('Failed to fetch report statistics, using defaults:', statsError);
          // Return default statistics if the call fails
          return {
            totalReports: { count: 0, growth: 0 },
            submittedReports: { count: 0, growth: 0 },
            pendingReports: { count: 0, growth: 0 },
            approvedReports: { count: 0, growth: 0 },
            missedReports: { count: 0, growth: 0 },
          };
        }),
      ]);

      console.log('📦 HQ Reports - Raw API response:', reportsResponse);
      console.log('📊 HQ Reports - Statistics response:', statisticsResponse);

      // Safely handle reports response structure - PaginatedResponse has {data: [], pagination: {}}
      const rawReportsData = Array.isArray(reportsResponse?.data) ? reportsResponse.data : [];

      console.log('✅ HQ Reports - Processed data:', {
        reportsCount: rawReportsData.length,
        total: reportsResponse?.pagination?.total
      });
      console.log('🔍 HQ Reports - First report sample:', rawReportsData[0]);

      // Transform API data to match expected Report interface
      const reportsData = rawReportsData.map((report: any) => ({
        id: report.id?.toString() || '',
        reportId: report.title || `Report #${report.id}`,
        creditOfficer: report.submittedBy ? `${report.submittedBy.firstName} ${report.submittedBy.lastName}` : 'Unknown',
        creditOfficerId: report.submittedBy?.id?.toString() || '',
        branch: report.branch || 'Unknown Branch',
        branchId: report.branch || '',
        email: report.submittedBy?.email || '',
        dateSent: report.reportDate || report.submittedAt?.split('T')[0] || '',
        timeSent: report.submittedAt?.split('T')[1]?.split('.')[0] || '',
        reportType: (report.type === 'quarterly' || report.type === 'annual' || report.type === 'custom' ? 'monthly' : report.type) as 'daily' | 'weekly' | 'monthly',
        status: report.status?.toLowerCase() as 'submitted' | 'pending' | 'approved' | 'declined',
        isApproved: report.status?.toLowerCase() === 'approved',
        loansDispursed: report.totalLoansProcessed || 0,
        loansValueDispursed: report.totalLoansDisbursed || '0',
        savingsCollected: report.totalSavingsProcessed || '0',
        repaymentsCollected: parseFloat(report.totalRecollections || '0'),
        createdAt: report.createdAt || '',
        updatedAt: report.updatedAt || '',
        approvedBy: report.reviewedBy ? `${report.reviewedBy.firstName} ${report.reviewedBy.lastName}` : undefined,
        declineReason: report.declineReason || undefined,
      }));

      console.log('🔄 HQ Reports - Transformed first report:', reportsData[0]);

      setReports(reportsData);
      // Handle pagination - use data from backend pagination object
      const totalCount = reportsResponse?.pagination?.total || reportsData.length || 0;
      const backendTotalPages = reportsResponse?.pagination?.totalPages || 1;
      setTotalReports(totalCount);
      setTotalPages(backendTotalPages);
      setReportStatistics(statisticsResponse);

    } catch (err) {
      console.error('Failed to fetch reports data:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load reports data');
      error('Failed to load reports data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchReportsData();
  }, [currentPage, itemsPerPage]);

  // Reload data when filters change
  useEffect(() => {
    if (currentPage === 1) {
      fetchReportsData();
    } else {
      setCurrentPage(1);
    }
  }, [selectedPeriod, dateRange, appliedFilters]);

  // Convert API statistics to StatSection format
  const statistics = useMemo(() => {
    if (!reportStatistics) return [];

    const statSections: StatSection[] = [
      {
        label: 'Total Reports',
        value: reportStatistics.totalReports.count,
        change: reportStatistics.totalReports.growth,
        changeLabel: `${reportStatistics.totalReports.growth >= 0 ? '+' : ''}${reportStatistics.totalReports.growth}% this month`,
        isCurrency: false,
      },
      {
        label: 'Missed Reports',
        value: reportStatistics.missedReports.count,
        change: reportStatistics.missedReports.growth,
        changeLabel: `${reportStatistics.missedReports.growth >= 0 ? '+' : ''}${reportStatistics.missedReports.growth}% this month`,
        isCurrency: false,
      },
    ];

    return statSections;
  }, [reportStatistics]);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    // Clear custom date range when selecting a preset period
    if (period !== 'custom') {
      setDateRange(undefined);
    }
    setCurrentPage(1);
    // Refetch data with the new period filter
    fetchReportsData();
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // When a custom date range is selected, set period to 'custom'
    if (range) {
      setSelectedPeriod('custom');
    }
    setCurrentPage(1);
    // Refetch data with the new date range
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

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedReports(selectedIds);
    console.log('Selected reports:', selectedIds);
  };

  const handleReportClick = async (report: Report) => {
    try {
      setLoading(true);

      // Fetch detailed report information from API
      const detailedReport = await reportsService.getReportById(report.id);

      setSelectedReportForDetails(detailedReport);
      setDetailsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch report details:', err);
      error('Failed to load report details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = async () => {
    if (selectedReportForDetails) {
      try {
        setLoading(true);

        const approvalData = {
          status: 'approved' as const,
          approvedBy: session?.firstName && session?.lastName
            ? `${session.firstName} ${session.lastName}`
            : session?.role || 'HQ Manager',
          approvedAt: new Date().toISOString(),
          comments: 'Report approved via HQ dashboard'
        };

        const updatedReport = await reportsService.approveReport(
          selectedReportForDetails.id,
          approvalData
        );

        // Update the report in the reports state
        setReports(prevReports =>
          prevReports.map(report =>
            report.id === selectedReportForDetails.id ? updatedReport : report
          )
        );

        // Update the selected report for details to reflect the approval
        setSelectedReportForDetails(updatedReport);

        success(`Report "${selectedReportForDetails.reportId}" approved successfully!`);

        // Refresh statistics to reflect the change
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

        const declineData = {
          status: 'declined' as const,
          approvedBy: session?.firstName && session?.lastName
            ? `${session.firstName} ${session.lastName}`
            : session?.role || 'HQ Manager',
          approvedAt: new Date().toISOString(),
          comments: 'Report declined via HQ dashboard',
        };

        const updatedReport = await reportsService.declineReport(
          selectedReportForDetails.id,
          declineData
        );

        // Update the report in the reports state
        setReports(prevReports =>
          prevReports.map(report =>
            report.id === selectedReportForDetails.id ? updatedReport : report
          )
        );

        success(`Report "${selectedReportForDetails.reportId}" declined.`);
        setDetailsModalOpen(false);
        setSelectedReportForDetails(null);

        // Refresh statistics to reflect the change
        await fetchReportsData();

      } catch (err) {
        console.error('Failed to decline report:', err);
        error('Failed to decline report. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Pagination (handled by backend API)
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalReports);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
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
                Overview
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
                Report Overview
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
                maxWidth: '564px',
                marginBottom: '48px'
              }}
            >
              {loading ? (
                <StatisticsCardSkeleton />
              ) : (
                <StatisticsCard sections={statistics} />
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
              ) : reports.length === 0 ? (
                <div
                  className="bg-white rounded-[12px] border border-[#EAECF0] p-12 text-center"
                  role="status"
                  aria-live="polite"
                >
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
                    reports={reports}
                    selectedReports={selectedReports}
                    onSelectionChange={handleSelectionChange}
                    // HQ Managers can edit/delete reports? Possibly. Passing undefined hides buttons.
                    // Assuming similar to SA for now.
                    onReportClick={handleReportClick}
                  />

                  {/* Pagination Controls */}
                  {totalReports > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#475467]">
                          Showing {startIndex + 1}-{endIndex} of {totalReports} results
                        </span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                          className="px-3 py-1.5 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                          aria-label="Items per page"
                        >
                          <option value={10}>10 per page</option>
                          <option value={25}>25 per page</option>
                          <option value={50}>50 per page</option>
                        </select>
                      </div>

                      <Pagination
                        totalPages={totalPages}
                        page={currentPage}
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
            branch: selectedReportForDetails.branch || 'Report Overview',
            email: selectedReportForDetails.email,
            dateSent: selectedReportForDetails.dateSent,
            timeSent: selectedReportForDetails.timeSent,
            reportType: selectedReportForDetails.reportType,
            status: selectedReportForDetails.status,
            isApproved: selectedReportForDetails.isApproved,
            loansDispursed: selectedReportForDetails.loansDispursed,
            loansValueDispursed: selectedReportForDetails.loansValueDispursed,
            savingsCollected: selectedReportForDetails.savingsCollected,
            repaymentsCollected: selectedReportForDetails.repaymentsCollected,
            approvalHistory: selectedReportForDetails.approvalHistory,
          }}
          onApprove={handleApproveReport}
          onDecline={handleDeclineReport}
        />
      )}
    </div>
  );
}
