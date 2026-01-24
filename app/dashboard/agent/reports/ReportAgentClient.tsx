"use client"

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { useReports, useReportById, useCreateReport, useSubmitReport } from "@/app/hooks/useReports";
import ReportFilters from "./reportcomponent/ReportFilters";
import CreateReportModal from "./reportcomponent/CreateReportModal";
import ViewReportModal from "./reportcomponent/ViewReportModal";
import ReportsTable from "./reportcomponent/ReportsTable";
import { CreateReportPayload, Report, ReportListItem } from "@/app/types/report";
import Button from "@/app/_components/ui/Button";
import { AxiosError } from "axios";
import { ApiResponseError } from "@/app/types/auth";



export default function ReportAgentClient() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  /* ===================== DATA ===================== */
  const {
    data,
    isLoading,
    status,
    error: queryError,
    setStatus,
    type,
    setType,
    page,
    setPage,
  } = useReports();

  const { data: selectedReportData, isLoading: isLoadingReport } =
    useReportById(selectedReportId);

  const createReportMutation = useCreateReport();
  const submitReportMutation = useSubmitReport();


  /* ===================== ACTIONS ===================== */
 
const handleCreateReport = async (payload: CreateReportPayload): Promise<Report> => {
  return await createReportMutation.mutateAsync(payload);
};


  const handleSubmitReport = async (reportId: number, remarks?: string) => {
    await submitReportMutation.mutateAsync({
      reportId,
      payload: { remarks },
    });
  };

  const handleRowClick = (reportId: number) => {
    setSelectedReportId(reportId);
  };

  

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl  font-semibold text-slate-900">Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage your branch reports
            </p>
          </div>

          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center bg-violet-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create New Report
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ReportFilters
            status={status}
            type={type}
            onStatusChange={setStatus}
            onTypeChange={setType}
          />
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <ReportsTable
            reports={data?.data || []}
            meta={data?.meta} 
            isLoading={isLoading}
           error={queryError as AxiosError<ApiResponseError> | null}
            onPageChange={setPage}
            onRowClick={handleRowClick}
          />
        </div>

        {/* Create Modal */}
        <CreateReportModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateReport}
          onSubmit={handleSubmitReport}
        />

        {/* View Modal */}
        <ViewReportModal
          isOpen={selectedReportId !== null}
          onClose={() => setSelectedReportId(null)}
          report={selectedReportData?.data || null}
          isLoading={isLoadingReport}
        />
      </div>
    </div>
  );
}
