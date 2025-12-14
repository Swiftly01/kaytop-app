'use client';

import React, { useState, useMemo } from 'react';
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
// Local Report interface for display purposes
interface Report {
  id: string;
  reportId: string;
  creditOfficer: string;
  branch: string;
  dateSent: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  loansDispursed: number;
  loansValueDispursed: string;
  savingsCollected: string;
  repaymentsCollected: number;
}
import { DateRange } from 'react-day-picker';

type TimePeriod = '12months' | '30days' | '7days' | '24hours' | null;

export default function ReportsPage() {
  const { toasts, removeToast, success } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('12months');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<Report[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
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

  const itemsPerPage = 10;

  // Filter reports based on selected period, date range, and advanced filters
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Apply period filter
    if (selectedPeriod) {
      filtered = filterReportsByPeriod(filtered, selectedPeriod);
    }

    // Apply custom date range filter
    if (dateRange?.from) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date);
        const fromDate = dateRange.from!;
        const toDate = dateRange.to || new Date();
        return reportDate >= fromDate && reportDate <= toDate;
      });
    }

    // Apply advanced filters
    if (appliedFilters.creditOfficer) {
      filtered = filtered.filter(report => 
        report.creditOfficer === appliedFilters.creditOfficer
      );
    }

    if (appliedFilters.reportStatus) {
      filtered = filtered.filter(report => {
        if (appliedFilters.reportStatus === 'Submitted') return report.status === 'submitted';
        if (appliedFilters.reportStatus === 'Missed') return report.status === 'missed';
        if (appliedFilters.reportStatus === 'Pending') return report.status === 'pending';
        return true;
      });
    }

    if (appliedFilters.reportType) {
      filtered = filtered.filter(report => 
        report.reportType === appliedFilters.reportType
      );
    }

    // Apply advanced date range filter (overrides the date picker if both are set)
    if (appliedFilters.dateFrom || appliedFilters.dateTo) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date);
        const fromDate = appliedFilters.dateFrom ? new Date(appliedFilters.dateFrom) : new Date('1900-01-01');
        const toDate = appliedFilters.dateTo ? new Date(appliedFilters.dateTo) : new Date();
        return reportDate >= fromDate && reportDate <= toDate;
      });
    }

    return filtered;
  }, [reports, selectedPeriod, dateRange, appliedFilters]);

  // Calculate statistics from filtered data
  const statistics = useMemo(() => {
    const stats = calculateReportStatistics(filteredReports);
    
    // Convert to StatSection format
    const statSections: StatSection[] = [
      {
        label: 'Total Reports',
        value: stats.totalReports.count,
        change: stats.totalReports.growth,
      },
      {
        label: 'Missed Reports',
        value: stats.missedReports.count,
        change: stats.missedReports.growth,
      },
    ];

    return statSections;
  }, [filteredReports]);

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

  const handleReportClick = (report: Report) => {
    setSelectedReportForDetails(report);
    setDetailsModalOpen(true);
  };

  const handleApproveReport = () => {
    if (selectedReportForDetails) {
      // Update the report in the reports state to mark it as approved
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === selectedReportForDetails.id 
            ? { ...report, isApproved: true }
            : report
        )
      );
      
      // Update the selected report for details to show the approval status
      setSelectedReportForDetails(prev => 
        prev ? { ...prev, isApproved: true } : null
      );
      
      success(`Report "${selectedReportForDetails.reportId}" approved successfully!`);
      // Keep modal open to show the approval status label
    }
  };

  const handleDeclineReport = () => {
    if (selectedReportForDetails) {
      success(`Report "${selectedReportForDetails.reportId}" declined.`);
      setDetailsModalOpen(false);
      setSelectedReportForDetails(null);
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

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = useMemo(() => 
    filteredReports.slice(startIndex, endIndex),
    [filteredReports, startIndex, endIndex]
  );

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
              <StatisticsCard sections={statistics} />
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
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F56D9]"></div>
                </div>
              )}
              <ReportsTable
                reports={paginatedReports}
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
            branch: 'Igando Branch',
            email: selectedReportForDetails.email,
            dateSent: selectedReportForDetails.date,
            timeSent: selectedReportForDetails.timeSent,
            reportType: selectedReportForDetails.reportType,
            status: selectedReportForDetails.status,
            isApproved: selectedReportForDetails.isApproved,
            loansDispursed: selectedReportForDetails.loansDispursed,
            loansValueDispursed: selectedReportForDetails.loansValueDispursed,
            savingsCollected: selectedReportForDetails.savingsCollected,
            repaymentsCollected: selectedReportForDetails.repaymentsCollected,
          }}
          onApprove={handleApproveReport}
          onDecline={handleDeclineReport}
        />
      )}
    </div>
  );
}