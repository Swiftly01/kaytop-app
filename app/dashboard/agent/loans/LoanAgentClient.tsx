"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Calendar, Filter, Pencil, Trash2, X } from "lucide-react";
import { LoanService } from "@/app/services/loanService";
import { DashboardService } from "@/app/services/dashboardService";
import { useDashboardQuery } from "../../bm/queries/kpi/useDashboardQuery";
import { getBranchLoanMetrics, getUserBranchLoanMetrics } from "@/lib/utils";
import { useBranchLoans } from "../../bm/queries/loan/useBranchLoans";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";
import { useLoanDetails } from "../../bm/queries/loan/useLoanDetails";
import { CustomerHeader } from "@/app/_components/ui/CustomerHeader";
import { CustomerMetric } from "@/app/_components/ui/CustomerMetric";
import UserLoanTable from "@/app/_components/ui/UserLoanTable";
import LoanRepaymentTable from "@/app/_components/ui/table/LoanRepaymentTable";
import UserLoanSummary from "@/app/_components/ui/UserLoanSummary";
import SpinnerLg from "@/app/_components/ui/SpinnerLg";




export function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full font-medium ${
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-orange-100 text-orange-700"
      }`}
    >
      ● {status}
    </span>
  );
}


export default function LoanAgentClient() {
const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

 const { isLoading, error, data } = useDashboardQuery();
  const [status, setStatus] = useState<undefined | string>();

  const metricData = getUserBranchLoanMetrics({ data });
  const {
    isLoading: isLoadingLoan,
    error: branchLoanError,
    data: branchLoan,
  } = useBranchLoans(status);

  const { handlePageChange, setContextParam } = usePageChange();

  function handleClick(loanId: number) {
  setSelectedLoanId(loanId); //  opens modal
  setContextParam(loanId, PaginationKey.loan_page_id); //  fetch details
}


  const {
    isLoading: isLoadingDetails,
    error: loanDetailsError,
    data: loanDetails,
  } = useLoanDetails();


  return (
    <div className=" space-y-6 px-6">
      {/* Header */}
      <CustomerHeader title="Loans" data={data} isLoading={isLoading} />

       {/* Stats */}
            <CustomerMetric
              item={metricData}
              cols={4}
              isLoading={isLoading}
              error={error}
            />


      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <UserLoanTable
          isLoading={isLoadingLoan}
          error={branchLoanError}
          item={branchLoan?.data}
          meta={branchLoan?.meta}
          onPageChange={(page) =>
            handlePageChange(page, PaginationKey.branch_loan_page)
          }
          onView={handleClick}
        />
      </div>

    {selectedLoanId && (
  <div className="fixed inset-0 z-50 flex">
    <div
      className="flex-1 bg-black/40"
      onClick={() => setSelectedLoanId(null)}
    />

    <div className="w-full max-w-xl bg-white h-full shadow-xl px-6 overflow-y-auto">
      <button
    onClick={() => setSelectedLoanId(null)}
    className=" text-gray-500 hover:text-gray-700 mt-4"
  >
    <X className="" />
  </button>
        <h3 className="text-lg font-semibold mb-4 items-center text-center">Loan Details</h3>

      {isLoadingDetails ? (
        <SpinnerLg />
      ) : loanDetails ? (
        <>
          <UserLoanSummary
            isLoading={isLoadingDetails}
            error={loanDetailsError}
            loanDetails={loanDetails}
          />

          <p className="px-5 my-4 font-semibold text-md text-neutral-700">
            Repayment History
          </p>

          <LoanRepaymentTable
            isLoading={isLoadingDetails}
            error={loanDetailsError}
            item={loanDetails.data.repaymentHistory}
            customerDetails={loanDetails.data.customerDetails}
            loanDetails={loanDetails.data.loanDetails}
            meta={loanDetails.meta}
            onPageChange={(page) =>
              handlePageChange(page, PaginationKey.loan_page_repayment)
            }
          />
        </>
      ) : (
        <p className="text-center text-slate-500">No details found</p>
      )}
    </div>
  </div>
)}



    </div>
  );
}
