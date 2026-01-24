"use client";
import { useDashboardQuery } from "@/app/dashboard/bm/queries/kpi/useDashboardQuery";
import { useReport } from "@/app/dashboard/bm/queries/reports/useReport";
import useReportById from "@/app/dashboard/bm/queries/reports/useReportById";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";
import { GenerateReportFormData, ReportType } from "@/app/types/report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { useModal } from "@/app/hooks/useModal";
import { Button as ButtonUi } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getBmReportMetrics,
  getReportMetrics,
  isReportType,
  REPORT_TYPE_OPTIONS,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import Button from "./Button";
import DashboardHeader from "./DashboardHeader";
import Error from "./Error";
import FilterButton from "./FilterButton";
import GlobalModal from "./GlobalModal";
import { Label } from "./label";
import Metric from "./Metric";
import ReportFilter from "./ReportFilter";
import ReportSummary from "./ReportSummary";
import ReportsTable from "./table/ReportsTable";
import { useGenerateReport } from "@/app/dashboard/bm/queries/reports/useGenerateReport";
import Spinner from "./Spinner";
import ReportDrawer from "./ReportDrawer";

export default function ReportClient() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType | undefined>();
  const { isLoading, error, data } = useDashboardQuery();
  // const metricData = data?.reportStats ? getReportMetrics({
  //   totalReports: data.reportStats.totalReports,
  //   missedReports: data.reportStats.totalPending,
  //   totalReportsGrowth: 0, // TODO: Add growth calculation when available
  //   missedReportsGrowth: 0, // TODO: Add growth calculation when available
  // }) : [];

  const metricData = data ? getBmReportMetrics({ data }) : [];


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

  const { open: openModal, close: closeModal, isOpen } = useModal();

  const schema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    type: z.string().min(1, "Type is required"),
    reportDate: z.date().refine((val) => val instanceof Date, {
      message: "Report date is required",
    }),
  });

  type ReportData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setError,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const {
    generateReport,
    isPending: isSubmitting,
    reportData: reportDataResponse,
  } = useGenerateReport(setError, reset, closeModal);

  const onSubmit = (data: ReportData) => {
    const payload = {
      ...data,
      reportDate: data.reportDate.toISOString().split("T")[0],
    };

    generateReport(payload);
  };

  return (
    <>
      <DashboardHeader data={data} isLoading={isLoading} />

      <Metric item={metricData} cols={3} isLoading={isLoading} error={error} />

      <p className="font-semibold text-md text-neutral-700">Reports</p>

      <div className="flex flex-wrap justify-between">
        <div className="flex flex-wrap items-center gap-1 px-1 py-1 my-2 bg-white rounded-sm w-fit">
          <ReportFilter isLoading={isLoadingReport} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
          <FilterButton
            disabled={isLoading}
            onClick={openModal}
            className="flex gap-1 px-3 py-[5px]  bg-white rounded-sm"
          >
            Generate report
          </FilterButton>

          <FilterButton
            disabled={!reportDataResponse}
            onClick={() => setIsDrawerOpen(true)}
            className="flex gap-1 px-3 py-[5px] bg-white rounded-sm"
          >
            Show report
          </FilterButton>
        </div>
      </div>

      <GlobalModal title="Generate Report" open={isOpen} onClose={closeModal}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                disabled={isSubmitting}
                placeholder="Enter your title"
                {...register("title")}
              />
              {errors.title && <Error error={errors.title.message} />}
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                placeholder="Enter your description"
                disabled={isSubmitting}
                {...register("description")}
              />
              {errors.description && (
                <Error error={errors.description.message} />
              )}
            </div>

            <div className="grid gap-2">
              <Controller
                disabled={isSubmitting}
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-white font-semibold text-neutral-700  data-placeholder:text-neutral-400 focus:ring-1 focus:ring-neutral-300">
                      <SelectValue placeholder="Report type" />
                    </SelectTrigger>

                    <SelectContent className="bg-white border shadow-md border-neutral-200">
                      {REPORT_TYPE_OPTIONS.map((option) => (
                        <SelectItem
                          className="cursor-pointer  hover:bg-brand-purple focus:bg-neutral-100 data-[state=checked]:bg-brand-purple  data-[state=checked]:text-white  data-[state=checked]:font-semibold"
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <Error error={errors.type.message} />}
            </div>

            <div className="grid gap-2">
              <Label>Report Date</Label>

              <Controller
                disabled={isSubmitting}
                name="reportDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <ButtonUi
                        variant="outline"
                        className="justify-start w-full text-left font-normal bg-white text-md text-neutral-700 hover:bg-brand-purple hover:text-white"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
                      </ButtonUi>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />

              {errors.reportDate && <Error error={errors.reportDate.message} />}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              fullWidth={true}
              type="button"
              variant="danger"
              onClick={closeModal}
            >
              Close
            </Button>

            <Button
              fullWidth={true}
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Generate"}
            </Button>
          </div>
        </form>
      </GlobalModal>

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

      <ReportDrawer
        reportData={reportDataResponse}
        isOpen={isDrawerOpen}
        setIsOpen={setIsDrawerOpen}
      />

      <div className=" drawer drawer-end">
        <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content"></div>
        <div className="z-40 drawer-side ">
          <label
            htmlFor="my-drawer-5"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className=" z-50 min-h-full p-4 overflow-hidden bg-white menu w-80 md:w-120">
            <h1 className="font-semibold text-center text-md text-neutral-700">
              Report Details
            </h1>

            <ReportSummary
              isLoading={isLoadingReportById}
              error={reportIdError}
              reportDetails={reportIdData}
            />
          </ul>
        </div>
      </div>
    </>
  );
}
