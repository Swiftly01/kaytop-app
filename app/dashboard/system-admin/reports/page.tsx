'use client';

import React, { useState, useMemo, useEffect } from 'react';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import ReportsTable from '@/app/_components/ui/ReportsTable';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import Pagination from '@/app/_components/ui/Pagination';
import EditReportModal from '@/app/_components/ui/EditReportModal';
import DeleteConfirmationModal from '@/app/_components/ui/DeleteConfirmationModal';
import ReportsFiltersModal, { ReportsFilters } from '@/app/_components/ui/ReportsFiltersModal';
import ReportDetailsModal, { ReportDetailsData } from '@/app/_components/ui/ReportDetailsModal';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { reportsService } from '@/lib/services/reports';
import { dashboardService } from '@/lib/services/dashboard';
import type { Report, ReportStatistics, ReportFilters as APIReportFilters } from '@/lib/api/types';
import { DateRange } from 'react-day-picker';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';
import { useAuth } from '@/app/context/AuthContext';

export default function ReportsPage() {
  const { session } = useAuth();
  const { toasts, removeToast, success, error } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('last_30_days');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<Report[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
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
  const [apiError, setApiError] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Fetch reports data from API
  const fetchReportsData = async (filters?: APIReportFilters) => {
    try {
      setLoading(true);
      setApiError(null);

      // Build API filters from current state
      const apiFilters: APIReportFilters = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      };

      // Apply period filter
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

        apiFilters.dateFrom = startDate.toISOString().split('T')[0];
      }

      // Apply custom date range filter
      if (dateRange?.from) {
        apiFilters.dateFrom = dateRange.from.toISOString().split('T')[0];
        if (dateRange.to) {
          apiFilters.dateTo = dateRange.to.toISOString().split('T')[0];
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
          startDate: apiFilters.dateFrom,
          endDate: apiFilters.dateTo,
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

      // Safely handle reports response structure
      const reportsData = Array.isArray(reportsResponse?.data) ? reportsResponse.data : [];
      const paginationData = reportsResponse?.pagination || {};
      
      setReports(reportsData);
      // Handle pagination safely - backend might not return pagination object
      const totalCount = paginationData.total || reportsData.length || 0;
      setTotalReports(totalCount);
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
  }, [currentPage]);

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
    setCurrentPage(1);
    console.log('Time period changed:', period);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
    console.log('Date range changed:', range);
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
          approvedBy: session?.role || 'system-admin', // Use actual user info when available
          approvedAt: new Date().toISOString(),
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
        try {
          await fetchReportsData();
        } catch (refreshError) {
          console.warn('Failed to refresh data after approval:', refreshError);
          // Don't throw error, just log it since the approval was successful
        }
        
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
          approvedBy: session?.role || 'system-admin', // Use actual user info when available
          approvedAt: new Date().toISOString(),
          comments: 'Report declined by system admin',
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
        try {
          await fetchReportsData();
        } catch (refreshError) {
          console.warn('Failed to refresh data after decline:', refreshError);
          // Don't throw error, just log it since the decline was successful
        }
        
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

  const handleEdit = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setEditModalOpen(true);
    }
  };

  const handleDelete = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setDeleteModalOpen(true);
    }
  };

  const handleSaveReport = async (updatedReport: Report) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === updatedReport.id ? updatedReport : report
        )
      );
      success(`Report "${updatedReport.reportId}" updated successfully!`);
    } catch (error) {
      console.error('Error updating report:', error);
      // Error handling would go here
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedReport) {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setReports(prevReports => 
          prevReports.filter(report => report.id !== selectedReport.id)
        );
        success(`Report "${selectedReport.reportId}" deleted successfully!`);
        setSelectedReport(null);
      } catch (error) {
        console.error('Error deleting report:', error);
        // Error handling would go here
      } finally {
        setLoading(false);
      }
    }
  };

  // Pagination (now handled by API)
  const totalPages = Math.ceil(totalReports / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalReports);

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
                Igando Branch
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
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReportClick={handleReportClick}
                  />

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#475467]">
                          Showing {startIndex + 1}-{endIndex} of {totalReports} results
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

      {/* Edit Report Modal */}
      <EditReportModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedReport(null);
        }}
        onSave={handleSaveReport}
        report={selectedReport}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedReport(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Report"
        message={`Are you sure you want to delete report "${selectedReport?.reportId}"? This action cannot be undone.`}
      />

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
            branch: selectedReportForDetails.branch || 'Igando Branch',
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