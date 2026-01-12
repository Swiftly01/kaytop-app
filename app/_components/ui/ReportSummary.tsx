import { ApiResponseError } from "@/app/types/auth";
import { ReportByIdResponse } from "@/app/types/report";
import {
  mapReportDetails,
  mapReportLoanDetails
} from "@/lib/utils";
import { AxiosError } from "axios";
import SpinnerLg from "./SpinnerLg";
import SummaryCard from "./SummaryCard";
import ErrorMessage from "./table/ErrorMessage";

interface ReportSummaryProps {
  isLoading: boolean;
  error?: AxiosError<ApiResponseError> | null;
  reportDetails?: ReportByIdResponse;
}

export default function ReportSummary({
  isLoading,
  error,
  reportDetails,
}: ReportSummaryProps) {
  const reportSummary = reportDetails
    ? mapReportDetails(reportDetails.data)
    : [];
  const reportLoanDetails = reportDetails
    ? mapReportLoanDetails(reportDetails.data)
    : [];


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[10vh]">
        <SpinnerLg />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <>
      <div className="flex justify-between px-5 py-2">
        {reportSummary.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </div>
      <p className="px-5 font-semibold text-neutral-700">Other details</p>
      <div className="grid grid-cols-3 gap-5 px-5">
        {reportLoanDetails.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </div>
    </>
  );
}
