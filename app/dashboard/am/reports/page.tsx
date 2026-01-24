'use client';

import React, { useState, useMemo, useEffect } from 'react';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import ReportsTable from '@/app/_components/ui/ReportsTable';
import BranchAggregateTable from '@/app/_components/ui/BranchAggregateTable';
import HQReviewModal, { HQReviewModalData } from '@/app/_components/ui/HQReviewModal';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import Pagination from '@/app/_components/ui/Pagination';
import ReportsFiltersModal, { ReportsFilters } from '@/app/_components/ui/ReportsFiltersModal';
import ReportDetailsModal, { ReportDetailsData } from '@/app/_components/ui/ReportDetailsModal';
import { StatisticsCardSkeleton, TableSkeleton } from '@/app/_components/ui/Skeleton';
import { ReportsErrorBoundary, HQDashboardErrorBoundary } from '@/app/_components/ui/HQDashboardErrorBoundary';
import { PAGINATION_LIMIT } from '@/lib/config';
import { reportsService } from '@/lib/services/reports';
import { userProfileService } from '@/lib/services/userProfile';
import type { Report, ReportStatistics, ReportFilters as APIReportFilters, BranchReport } from '@/lib/api/types';
import { DateRange } from 'react-day-picker';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';
import { useAuth } from '@/app/context/AuthContext';

export default function AMReportsPage() {
  const { session } = useAuth();
  const { toasts, removeToast, success, error } = useToast();
  
  // View toggle state - HQ managers can switch between Individual Reports and Branch Aggregates
  const [viewMode, setViewMode] = useState<'individual' | 'branch_aggregates'>('individual');
  const isHQManager = session?.role === 'hq_manager' || session?.role === 'system_admin';
  
  // Role-based access control
  useEffect(() => {
    console.log('🔍 Current session:', session);
    console.log('🔍 User role check:', session?.role);
    console.log('🔍 Is HQ Manager:', isHQManager);
    
    if (session && !['hq_manager', 'system_admin'].includes(session.role)) {
      error('Access denied. This page is only accessible to HQ Managers and System Administrators.');
      // Redirect to appropriate dashboard based on role
      const roleRedirects = {
        'credit_officer': '/dashboard/co',
        'branch_manager': '/dashboard/bm',
        'account_manager': '/dashboard/am'
      };
      const redirectPath = roleRedirects[session.role as keyof typeof roleRedirects] || '/dashboard';
      window.location.href = redirectPath;
      return;
    }
  }, [session, error]);

  // Don't render the page if user doesn't have proper access
  if (session && !['hq_manager', 'system_admin'].includes(session.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to HQ Managers and System Administrators.</p>
        </div>
      </div>
    );
  }
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGINATION_LIMIT);
  const [reports, setReports] = useState<Report[]>([]);
  const [branchReports, setBranchReports] = useState<BranchReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Sorting state for branch aggregates
  const [sortColumn, setSortColumn] = useState<string>('branchName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [appliedFilters, setAppliedFilters] = useState<ReportsFilters>({
    creditOfficer: '',
    reportStatus: '',
    reportType: '',
    dateFrom: '',
    dateTo: '',
  });
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReportForDetails, setSelectedReportForDetails] = useState<Report | null>(null);

  // HQ Review Modal state
  const [hqReviewModalOpen, setHqReviewModalOpen] = useState(false);
  const [selectedBranchForReview, setSelectedBranchForReview] = useState<BranchReport | null>(null);
  const [hqReviewLoading, setHqReviewLoading] = useState(false);

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

      console.log('🔍 AM Reports - Fetching data with filters:', filters);
      console.log('📊 View mode:', viewMode);

      // Build API filters from current state
      const apiFilters: APIReportFilters = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      };

      console.log('📋 AM Reports - API filters:', apiFilters);

      // Store date range for statistics API call
      let statsDateFrom: string | undefined;
      let statsDateTo: string | undefined;

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

        statsDateFrom = startDate.toISOString().split('T')[0];
      }

      // Apply custom date range filter for statistics
      if (dateRange?.from) {
        statsDateFrom = dateRange.from.toISOString().split('T')[0];
        if (dateRange.to) {
          statsDateTo = dateRange.to.toISOString().split('T')[0];
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

      // Fetch data based on view mode
      if (viewMode === 'branch_aggregates' && isHQManager) {
        // Fetch branch aggregate reports for HQ managers
        const [branchReportsResponse, statisticsResponse] = await Promise.all([
          reportsService.getBranchAggregateReports({
            branchId: apiFilters.branchId,
            status: apiFilters.status,
            reportType: apiFilters.reportType,
            page: apiFilters.page,
            limit: apiFilters.limit,
          }),
          reportsService.getReportStatistics({
            dateFrom: statsDateFrom,
            dateTo: statsDateTo,
            branchId: apiFilters.branchId,
          }).catch(statsError => {
            console.warn('Failed to fetch report statistics, using defaults:', statsError);
            return {
              totalReports: { count: 0, growth: 0 },
              submittedReports: { count: 0, growth: 0 },
              pendingReports: { count: 0, growth: 0 },
              approvedReports: { count: 0, growth: 0 },
              missedReports: { count: 0, growth: 0 },
            };
          }),
        ]);

        console.log('📦 AM Reports - Branch aggregates response:', branchReportsResponse);
        console.log('📊 AM Reports - Statistics response:', statisticsResponse);

        setBranchReports(branchReportsResponse.data || []);
        setReports([]); // Clear individual reports when showing branch aggregates
        
        // Handle pagination for branch aggregates
        const totalCount = branchReportsResponse?.pagination?.total || 0;
        const backendTotalPages = branchReportsResponse?.pagination?.totalPages || 1;
        setTotalReports(totalCount);
        setTotalPages(backendTotalPages);
        setReportStatistics(statisticsResponse);

      } else {
        // Fetch individual reports (default behavior)
        const [reportsResponse, statisticsResponse] = await Promise.all([
          reportsService.getAllReports(apiFilters),
          reportsService.getReportStatistics({
            dateFrom: statsDateFrom,
            dateTo: statsDateTo,
            branchId: apiFilters.branchId,
          }).catch(statsError => {
            console.warn('Failed to fetch report statistics, using defaults:', statsError);
            return {
              totalReports: { count: 0, growth: 0 },
              submittedReports: { count: 0, growth: 0 },
              pendingReports: { count: 0, growth: 0 },
              approvedReports: { count: 0, growth: 0 },
              missedReports: { count: 0, growth: 0 },
            };
          }),
        ]);

        console.log('📦 AM Reports - Raw API response:', reportsResponse);
        console.log('📊 AM Reports - Statistics response:', statisticsResponse);

        // Safely handle reports response structure - PaginatedResponse has {data: [], pagination: {}}
        const rawReportsData = Array.isArray(reportsResponse?.data) ? reportsResponse.data : [];

        console.log('✅ AM Reports - Processed data:', { 
          reportsCount: rawReportsData.length, 
          total: reportsResponse?.pagination?.total 
        });

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

        setReports(reportsData);
        setBranchReports([]); // Clear branch reports when showing individual reports
        
        // Handle pagination - use data from backend pagination object
        const totalCount = reportsResponse?.pagination?.total || reportsData.length || 0;
        const backendTotalPages = reportsResponse?.pagination?.totalPages || 1;
        setTotalReports(totalCount);
        setTotalPages(backendTotalPages);
        setReportStatistics(statisticsResponse);
      }

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
  }, [currentPage, itemsPerPage]);

  // Reload data when filters or view mode change
  useEffect(() => {
    if (currentPage === 1) {
      fetchReportsData();
    } else {
      setCurrentPage(1);
    }
  }, [selectedPeriod, dateRange, appliedFilters, viewMode]);

  // Convert API statistics to StatSection format
  const statistics = useMemo(() => {
    if (!reportStatistics) return [];

    // Ensure all required properties exist with fallback values
    const safeStats = {
      totalReports: reportStatistics.totalReports || { count: 0, growth: 0 },
      pendingReports: reportStatistics.pendingReports || { count: 0, growth: 0 },
      approvedReports: reportStatistics.approvedReports || { count: 0, growth: 0 },
      missedReports: reportStatistics.missedReports || { count: 0, growth: 0 },
    };

    const statSections: StatSection[] = [
      {
        label: 'Total Reports',
        value: safeStats.totalReports.count,
        change: safeStats.totalReports.growth,
        changeLabel: `${safeStats.totalReports.growth >= 0 ? '+' : ''}${safeStats.totalReports.growth}% this month`,
        isCurrency: false,
      },
      {
        label: 'Pending Reports',
        value: safeStats.pendingReports.count,
        change: safeStats.pendingReports.growth,
        changeLabel: `${safeStats.pendingReports.growth >= 0 ? '+' : ''}${safeStats.pendingReports.growth}% this month`,
        isCurrency: false,
      },
      {
        label: 'Approved Reports',
        value: safeStats.approvedReports.count,
        change: safeStats.approvedReports.growth,
        changeLabel: `${safeStats.approvedReports.growth >= 0 ? '+' : ''}${safeStats.approvedReports.growth}% this month`,
        isCurrency: false,
      },
      {
        label: 'Missed Reports',
        value: safeStats.missedReports.count,
        change: safeStats.missedReports.growth,
        changeLabel: `${safeStats.missedReports.growth >= 0 ? '+' : ''}${safeStats.missedReports.growth}% this month`,
        isCurrency: false,
      },
    ];

    return statSections;
  }, [reportStatistics]);

  // Sort branch reports based on current sort settings
  const sortedBranchReports = useMemo(() => {
    if (!branchReports.length) return branchReports;

    const sorted = [...branchReports].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof BranchReport];
      let bValue: any = b[sortColumn as keyof BranchReport];

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle dates
      if (sortColumn === 'lastSubmissionDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [branchReports, sortColumn, sortDirection]);

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

  const handleReportClick = async (report: Report) => {
    try {
      setLoading(true);

      console.log('🔍 Clicked report data:', report);

      // Fetch detailed report information from API
      const detailedReport = await reportsService.getReportById(report.id);

      console.log('🔍 Detailed report from API:', detailedReport);
      console.log('🔍 Report fields check:', {
        reportId: detailedReport.reportId,
        creditOfficer: detailedReport.creditOfficer,
        branch: detailedReport.branch,
        email: detailedReport.email,
        dateSent: detailedReport.dateSent,
        timeSent: detailedReport.timeSent,
        status: detailedReport.status
      });

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

        // Get user profile for proper name
        const userProfile = await userProfileService.getUserProfile();
        const approverName = `${userProfile.firstName} ${userProfile.lastName}`;

        const approvalData = {
          status: 'approved' as const,
          approvedBy: approverName,
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
        
        // Provide user-friendly error messages for specific cases
        if (err instanceof Error) {
          if (err.message.includes('not in forwarded status') || err.message.includes('draft report')) {
            error('This report cannot be approved yet. It must be forwarded by the Branch Manager first.');
          } else if (err.message.includes('already approved')) {
            error('This report has already been approved.');
          } else if (err.message.includes('declined report')) {
            error('Cannot approve a report that has been declined.');
          } else {
            error('Failed to approve report. Please try again.');
          }
        } else {
          error('Failed to approve report. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeclineReport = async () => {
    if (selectedReportForDetails) {
      try {
        setLoading(true);

        // Get user profile for proper name
        const userProfile = await userProfileService.getUserProfile();
        const approverName = `${userProfile.firstName} ${userProfile.lastName}`;

        const declineData = {
          status: 'declined' as const,
          approvedBy: approverName,
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
        
        // Provide user-friendly error messages for specific cases
        if (err instanceof Error) {
          if (err.message.includes('not in forwarded status') || err.message.includes('draft report')) {
            error('This report cannot be declined yet. It must be forwarded by the Branch Manager first.');
          } else if (err.message.includes('already approved')) {
            error('Cannot decline a report that has already been approved.');
          } else if (err.message.includes('declined report')) {
            error('This report has already been declined.');
          } else {
            error('Failed to decline report. Please try again.');
          }
        } else {
          error('Failed to decline report. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedReports(selectedIds);
    console.log('Selected reports:', selectedIds);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleBranchReportClick = (branchReport: BranchReport) => {
    // Open HQ Review Modal for branch aggregate review
    if (isHQManager && (branchReport.status === 'pending' || branchReport.status === 'mixed')) {
      setSelectedBranchForReview(branchReport);
      setHqReviewModalOpen(true);
    } else {
      console.log('Branch aggregate clicked (read-only):', branchReport);
    }
  };

  /**
   * Handle HQ approval of branch reports
   * Implements Task 3.2: Approval handler with remarks and optimistic UI updates
   */
  const handleHQApprove = async (remarks?: string) => {
    if (!selectedBranchForReview) return;

    try {
      setHqReviewLoading(true);

      // For branch aggregates, we need to approve all pending reports in the branch
      // Since we don't have individual report IDs in the branch aggregate,
      // we'll fetch the individual reports for this branch and approve them
      const branchReportsResponse = await reportsService.getAllReports({
        branchId: selectedBranchForReview.branchId,
        status: 'pending',
        limit: 100, // Get all pending reports for this branch
      });

      const pendingReports = branchReportsResponse.data || [];
      
      if (pendingReports.length === 0) {
        error('No pending reports found for this branch.');
        return;
      }

      // Approve all pending reports for this branch
      const approvalPromises = pendingReports.map(report =>
        reportsService.hqReviewReport(report.id, {
          action: 'APPROVE',
          remarks: remarks || `Branch reports approved by HQ Manager on ${new Date().toLocaleDateString()}`
        })
      );

      await Promise.all(approvalPromises);

      // Optimistic UI update - update branch report status
      setBranchReports(prevBranchReports =>
        prevBranchReports.map(br =>
          br.id === selectedBranchForReview.id
            ? { ...br, status: 'approved' as const, pendingReports: 0, approvedReports: br.reportCount }
            : br
        )
      );

      success(`Successfully approved ${pendingReports.length} report${pendingReports.length > 1 ? 's' : ''} for ${selectedBranchForReview.branchName}`);
      
      // Close modal and refresh data
      setHqReviewModalOpen(false);
      setSelectedBranchForReview(null);
      
      // Refresh statistics to reflect the changes
      await fetchReportsData();

    } catch (err) {
      console.error('Failed to approve branch reports:', err);
      error('Failed to approve branch reports. Please try again.');
    } finally {
      setHqReviewLoading(false);
    }
  };

  /**
   * Handle HQ rejection of branch reports
   * Implements Task 3.2: Rejection handler with decline reason and optimistic UI updates
   */
  const handleHQReject = async (reason: string) => {
    if (!selectedBranchForReview || !reason.trim()) return;

    try {
      setHqReviewLoading(true);

      // For branch aggregates, we need to decline all pending reports in the branch
      const branchReportsResponse = await reportsService.getAllReports({
        branchId: selectedBranchForReview.branchId,
        status: 'pending',
        limit: 100, // Get all pending reports for this branch
      });

      const pendingReports = branchReportsResponse.data || [];
      
      if (pendingReports.length === 0) {
        error('No pending reports found for this branch.');
        return;
      }

      // Decline all pending reports for this branch
      const rejectionPromises = pendingReports.map(report =>
        reportsService.hqReviewReport(report.id, {
          action: 'DECLINE',
          remarks: reason.trim()
        })
      );

      await Promise.all(rejectionPromises);

      // Optimistic UI update - update branch report status
      setBranchReports(prevBranchReports =>
        prevBranchReports.map(br =>
          br.id === selectedBranchForReview.id
            ? { ...br, status: 'declined' as const, pendingReports: 0, declinedReports: br.reportCount }
            : br
        )
      );

      success(`Successfully rejected ${pendingReports.length} report${pendingReports.length > 1 ? 's' : ''} for ${selectedBranchForReview.branchName}`);
      
      // Close modal and refresh data
      setHqReviewModalOpen(false);
      setSelectedBranchForReview(null);
      
      // Refresh statistics to reflect the changes
      await fetchReportsData();

    } catch (err) {
      console.error('Failed to reject branch reports:', err);
      error('Failed to reject branch reports. Please try again.');
    } finally {
      setHqReviewLoading(false);
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

            {/* View Toggle for HQ Managers */}
            {isHQManager && (
              <div style={{ marginBottom: '32px' }}>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                  <button
                    onClick={() => setViewMode('individual')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === 'individual'
                        ? 'bg-[#7F56D9] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={{
                      fontFamily: "'Open Sauce Sans', sans-serif",
                    }}
                  >
                    Individual Reports
                  </button>
                  <button
                    onClick={() => setViewMode('branch_aggregates')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === 'branch_aggregates'
                        ? 'bg-[#7F56D9] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={{
                      fontFamily: "'Open Sauce Sans', sans-serif",
                    }}
                  >
                    Branch Aggregates
                  </button>
                </div>
              </div>
            )}

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
                {viewMode === 'branch_aggregates' && isHQManager ? 'Branch Aggregates' : 'Reports'}
              </h2>
            </div>

            {/* Reports Table */}
            <ReportsErrorBoundary>
              <div className="max-w-[1075px]">
                {loading ? (
                  <TableSkeleton rows={itemsPerPage} />
                ) : viewMode === 'branch_aggregates' && isHQManager ? (
                  // Branch Aggregates View for HQ Managers
                  <>
                    <BranchAggregateTable
                      data={sortedBranchReports}
                      loading={loading}
                      selectedReports={selectedReports}
                      onSelectionChange={handleSelectionChange}
                      onRowClick={handleBranchReportClick}
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />

                    {/* Pagination Controls for Branch Aggregates */}
                    {totalReports > 0 && (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#475467]">
                            Showing {startIndex + 1}-{endIndex} of {totalReports} branches
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
                ) : (
                  // Individual Reports View (default)
                  reports.length === 0 ? (
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
                        // HQ Managers can't edit/delete reports - only approve/decline
                        // Edit/Delete buttons will be hidden when these props are undefined
                        onReportClick={handleReportClick}
                      />

                      {/* Pagination Controls for Individual Reports */}
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
                )
              )}
              </div>
            </ReportsErrorBoundary>
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
            branch: selectedReportForDetails.branch,
            email: selectedReportForDetails.email,
            dateSent: selectedReportForDetails.dateSent,
            timeSent: selectedReportForDetails.timeSent,
            reportType: selectedReportForDetails.reportType,
            status: selectedReportForDetails.status,
            isApproved: selectedReportForDetails.status === 'approved',
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

      {/* HQ Review Modal for Branch Aggregates */}
      {selectedBranchForReview && isHQManager && (
        <HQReviewModal
          isOpen={hqReviewModalOpen}
          onClose={() => {
            setHqReviewModalOpen(false);
            setSelectedBranchForReview(null);
          }}
          reviewData={{
            branchReport: selectedBranchForReview,
            // TODO: In a future enhancement, we could fetch individual reports for this branch
            // and display them in the modal for more detailed review
            individualReports: []
          }}
          onApprove={handleHQApprove}
          onReject={handleHQReject}
          loading={hqReviewLoading}
        />
      )}
    </div>
  );
}
