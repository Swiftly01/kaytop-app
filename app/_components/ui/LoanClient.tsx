"use client";
import { useDashboardQuery } from "@/app/dashboard/bm/queries/kpi/useDashboardQuery";
import { useBranchLoans } from "@/app/dashboard/bm/queries/loan/useBranchLoans";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";
import { getBranchLoanMetrics } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import DrawerTable from "./DrawerTable";
import Metric from "./Metric";
import BranchLoanTable from "./table/BranchLoanTable";

export default function LoanClient() {
  const { isLoading, error, data } = useDashboardQuery();

  const metricData = getBranchLoanMetrics({ data });
  const {
    isLoading: isLoadingLoan,
    error: branchLoanError,
    data: branchLoan,
  } = useBranchLoans();

  
    const { handlePageChange } = usePageChange();

  return (
    <>
      <DashboardHeader data={data} isLoading={isLoading} />

      <Metric item={metricData} cols={3} isLoading={isLoading} error={error} />

      <div className=" drawer drawer-end">
        <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label
            htmlFor="my-drawer-5"
            className="underline cursor-pointer drawer-button text-md decoration-brand-purple text-brand-purple"
          >
            View Loan
          </label>
        </div>
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
            <div className="flex justify-between px-5 py-2">
              <div>
                <p className="text-sm font-semibold text-gray-500">Loan ID</p>
                <h1 className="text-sm text-neutral-700">BN-B1E73DA–0017</h1>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  CO In-charge
                </p>
                <h1 className="text-sm text-neutral-700">James Alagbon</h1>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Branch</p>
                <h1 className="text-sm text-neutral-700">Alagbon</h1>
              </div>
            </div>
            <p className="px-5 font-semibold text-neutral-700">Other details</p>
            <div className="flex gap-6 px-5 py-2">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Amount borrowed
                </p>
                <h1 className="text-sm text-neutral-700">₦300,000</h1>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Date disbursed
                </p>
                <h1 className="text-sm text-neutral-700">Dec 30, 2022</h1>
              </div>
            </div>
            <div className="flex px-5 py-2 gap-15">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Interest rate
                </p>
                <h1 className="text-sm text-neutral-700">5%</h1>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Loan Status
                </p>
                <div className="flex gap-1 px-2 rounded bg-brand-neutral ">
                  <img src="/ongoing.svg" alt="ongoing icon" />
                  <span className="text-sm text-brand-orange">Ongoing</span>
                </div>
              </div>
            </div>

            <p className="px-5 my-4 font-semibold text-md text-neutral-700">
              Repayment History
            </p>
            <DrawerTable />
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
          />
          <div className="p-10 bg-white tab-content">
            <BranchLoanTable
              isLoading={isLoadingLoan}
              error={branchLoanError}
              item={branchLoan?.data}
              meta={branchLoan?.meta}
              onPageChange={(page) =>
                handlePageChange(page, PaginationKey.branch_loan_page)
              }
            />
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Active"
          />
          <div className="p-10 bg-white tab-content">Tab content 2</div>

          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Completed"
          />
          <div className="p-10 bg-white tab-content">Tab content 3</div>
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Missed payments"
          />
          <div className="p-10 bg-white tab-content">Tab content 4</div>
        </div>
      </div>
    </>
  );
}
