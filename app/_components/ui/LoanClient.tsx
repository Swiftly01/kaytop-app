"use client";
import { useDashboardQuery } from "@/app/dashboard/bm/queries/kpi/useDashboardQuery";
import { useBranchLoans } from "@/app/dashboard/bm/queries/loan/useBranchLoans";
import { useLoanDetails } from "@/app/dashboard/bm/queries/loan/useLoanDetails";
import { useMissedPayment } from "@/app/dashboard/bm/queries/loan/useMissedPayment";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";
import { getBranchLoanMetrics } from "@/lib/utils";
import { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import LoanSummary from "./LoanSummary";
import Metric from "./Metric";
import LoanRepaymentTable from "./table/LoanRepaymentTable";
import LoanTable from "./table/LoanTable";
import MissedPaymentTable from "./table/MissedPaymentTable";

export default function LoanClient() {
  const { isLoading, error, data } = useDashboardQuery();
  const [status, setStatus] = useState<undefined | string>();

  const metricData = getBranchLoanMetrics({ data });
  const {
    isLoading: isLoadingLoan,
    error: branchLoanError,
    data: branchLoan,
  } = useBranchLoans(status);

  const { handlePageChange, setContextParam } = usePageChange();

  function handleClick(loanId: number) {
    setContextParam(loanId, PaginationKey.loan_page_id);
  }

  const {
    isLoading: isLoadingDetails,
    error: loanDetailsError,
    data: loanDetails,
  } = useLoanDetails();

  const {
    isLoading: isLoadingMissedPayment,
    error: missedPaymentError,
    data: missedPayment,
  } = useMissedPayment();

  return (
    <>
      <DashboardHeader data={data} isLoading={isLoading} />

      <Metric item={metricData} cols={3} isLoading={isLoading} error={error} />

      <div className=" drawer drawer-end">
        <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content"></div>
        <div className="z-40 drawer-side ">
          <label
            htmlFor="my-drawer-5"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="z-50 min-h-full p-4 overflow-scroll bg-white menu w-80 md:w-140">
            <h1 className="font-semibold text-center text-md text-neutral-700">
              Loan Details
            </h1>

            <LoanSummary
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
              item={loanDetails?.data.repaymentHistory}
              customerDetails={loanDetails?.data.customerDetails}
              loanDetails={loanDetails?.data.loanDetails}
              meta={loanDetails?.meta}
              onPageChange={(page) =>
                handlePageChange(page, PaginationKey.loan_page_repayment)
              }
            />
          </ul>
        </div>
      </div>

      <div>
        <div className="my-5 text-gray-500 tabs tabs-border custom-tabs">
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="All Loans"
            defaultChecked
            onClick={() => setStatus(undefined)}
          />
          <div className="p-10 bg-white tab-content">
            <LoanTable
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

          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Active"
            onClick={() => setStatus("active")}
          />
          <div className="p-10 bg-white tab-content">
            <LoanTable
              isLoading={isLoadingLoan}
              error={branchLoanError}
              item={branchLoan?.data}
              meta={branchLoan?.meta}
              onPageChange={(page) =>
                handlePageChange(page, PaginationKey.active_loan_page)
              }
              onView={handleClick}
            />
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Completed"
            onClick={() => setStatus("completed")}
          />
          <div className="p-10 bg-white tab-content">
            <LoanTable
              isLoading={isLoadingLoan}
              error={branchLoanError}
              item={branchLoan?.data}
              meta={branchLoan?.meta}
              onPageChange={(page) =>
                handlePageChange(page, PaginationKey.completed_loan_page)
              }
              onView={handleClick}
            />
          </div>
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Missed payments"
            onClick={() => setStatus(undefined)}
          />
          <div className="p-10 bg-white tab-content">
            <MissedPaymentTable
              isLoading={isLoadingMissedPayment}
              error={missedPaymentError}
              item={missedPayment?.data}
              meta={missedPayment?.meta}
              onPageChange={(page) =>
                handlePageChange(page, PaginationKey.missed_payment_page)
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
