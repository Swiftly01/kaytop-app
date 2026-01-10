"use client";
import { useDashboardQuery } from "@/app/dashboard/bm/queries/kpi/useDashboardQuery";
import { useReport } from "@/app/dashboard/bm/queries/reports/useReport";
import useReportById from "@/app/dashboard/bm/queries/reports/useReportById";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";
import { ReportStatus, ReportType } from "@/app/types/report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getReportMetrics,
  isReportType,
  REPORT_TYPE_OPTIONS,
} from "@/lib/utils";
import { useState } from "react";
import Button from "./Button";
import DashboardHeader from "./DashboardHeader";
import Metric from "./Metric";
import { ReportActionModal } from "./ReportActionModal";
import ReportFilter from "./ReportFilter";
import ReportSummary from "./ReportSummary";
import SpinnerLg from "./SpinnerLg";
import ReportsTable from "./table/ReportsTable";

export default function ReportClient() {
  const [reportType, setReportType] = useState<ReportType | undefined>();
  const { isLoading, error, data } = useDashboardQuery();
  const metricData = data ? getReportMetrics({ data }) : [];

  const branch = data?.branch;

  const {
    isLoading: isLoadingReport,
    error: reportError,
    data: reportData,
  } = useReport({ branch });

  const { handlePageChange, setContextParam } = usePageChange();

  function handleClick(reportId: number) {
    setContextParam(reportId, PaginationKey.report_id);
  }

  const {
    isLoading: isLoadingReportById,
    error: reportIdError,
    data: reportIdData,
  } = useReportById();

  return (
    <>
      <DashboardHeader data={data} isLoading={isLoading} />

      <Metric item={metricData} cols={4} isLoading={isLoading} error={error} />

      <p className="font-semibold text-md text-neutral-700">Reports</p>

      <div className="flex flex-wrap justify-between">
        <div className="flex flex-wrap items-center gap-1 px-1 py-1 my-2 bg-white rounded-sm w-fit">
          <ReportFilter isLoading={isLoadingReport} />
        </div>
        <Select
          value={reportType}
          onValueChange={(value) => {
            if (isReportType(value)) {
              setReportType(value);
              setContextParam(value, PaginationKey.report_type);
            }
          }}
        >
          <SelectTrigger className="w-[180px] bg-white font-semibold text-neutral-700  data-placeholder:text-neutral-400 focus:ring-1 focus:ring-neutral-300">
            <SelectValue placeholder="Report type" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-md border-neutral-200">
            {REPORT_TYPE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer  hover:bg-brand-purple focus:bg-neutral-100 data-[state=checked]:bg-brand-purple  data-[state=checked]:text-white  data-[state=checked]:font-semibold"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-10 my-5 bg-white rounded-md">
        <ReportsTable
          isLoading={isLoadingReport}
          error={reportError}
          item={reportData?.data}
          meta={reportData?.meta}
          onPageChange={(page) =>
            handlePageChange(page, PaginationKey.report_page)
          }
          onView={handleClick}
        />
      </div>

      <div className=" drawer drawer-end">
        <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content"></div>
        <div className="z-40 drawer-side ">
          <label
            htmlFor="my-drawer-5"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="z-50 min-h-full p-4 overflow-hidden bg-white menu w-80 md:w-120">
            <h1 className="font-semibold text-center text-md text-neutral-700">
              Report Details
            </h1>

            <ReportSummary
              isLoading={isLoadingReportById}
              error={reportIdError}
              reportDetails={reportIdData}
            />

            <div className="flex flex-col gap-2 px-5 mt-6">
              {isLoadingReportById ? (
                <div className="flex justify-center h-[10vh] items-center">
                  <SpinnerLg />
                </div>
              ) : (
                <>
                  <ReportActionModal
                    action="approve"
                    isLoading={isLoadingReportById}
                    status={reportIdData?.data.status}
                    hideTrigger={
                      reportIdData?.data.status !== ReportStatus.PENDING
                    }
                  />
                  <ReportActionModal
                    action="decline"
                    isLoading={isLoadingReportById}
                    status={reportIdData?.data.status}
                    hideTrigger={
                      reportIdData?.data.status !== ReportStatus.PENDING
                    }
                  />
                </>
              )}

              {reportIdData?.data.status === ReportStatus.APPROVED && (
                <Button fullWidth variant="tertiary" disabled type="button">
                  Report approved and is locked
                </Button>
              )}

              {reportIdData?.data.status === ReportStatus.DECLINED && (
                <Button fullWidth variant="danger" disabled type="button">
                  Report declined
                </Button>
              )}
            </div>
          </ul>
        </div>
      </div>
    </>
  );
}
