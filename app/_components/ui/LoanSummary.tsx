import { useLoanDetails } from "@/app/dashboard/bm/queries/loan/useLoanDetails";
import {
  mapLoanDetailsData,
  mapLoanIntrestData,
  mapOtherLoanDetailsData,
} from "@/lib/utils";
import SummaryCard from "./SummaryCard";
import SpinnerLg from "./SpinnerLg";
import ErrorMessage from "./table/ErrorMessage";
import { LoanDetailsResponse } from "@/app/types/loan";
import { AxiosError } from "axios";
import { ApiResponseError } from "@/app/types/auth";

interface LoanSummaryProps {
  isLoading: boolean;
  error?: AxiosError<ApiResponseError> | null;
  loanDetails?: LoanDetailsResponse;
}

export default function LoanSummary({
  isLoading,
  error,
  loanDetails,
}: LoanSummaryProps) {
  const loanSummary = loanDetails ? mapLoanDetailsData(loanDetails.data) : [];
  const loanOtherDetails = loanDetails
    ? mapOtherLoanDetailsData(loanDetails.data)
    : [];
  const loanIntrestSummary = loanDetails
    ? mapLoanIntrestData(loanDetails.data)
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
        {loanSummary.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </div>
      <p className="px-5 font-semibold text-neutral-700">Other details</p>
      <div className="flex gap-6 px-5 py-2">
        {loanOtherDetails.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </div>
      <div className="flex px-5 py-2 gap-15">
        {loanIntrestSummary.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </div>
    </>
  );
}
