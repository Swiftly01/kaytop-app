"use client";
import { useDashboardQuery } from "@/app/dashboard/bm/queries/kpi/useDashboardQuery";
import { useLoanDisbursedQuery } from "@/app/dashboard/bm/queries/loan/useLoanDisbursedQuery";
import { getDashboardMetrics } from "@/lib/utils";
import Metric from "./Metric";

import { useDisburseVolume } from "@/app/dashboard/bm/queries/loan/useDisburseVolume";
import { useLoanRecollection } from "@/app/dashboard/bm/queries/loan/useLoanRecollection";
import { useMissedPayment } from "@/app/dashboard/bm/queries/loan/useMissedPayment";
import { useSavings } from "@/app/dashboard/bm/queries/savings/useSavings";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";
import DashboardHeader from "./DashboardHeader";
import DisbursementLineChart from "./DisbursementLineChart";
import DisbursementTable from "./table/DisbursementTable";
import MissedPaymentTable from "./table/MissedPaymentTable";
import RecollectionTable from "./table/RecollectionTable";
import SavingsTable from "./table/SavingsTable";

export default function DashboardClient() {
  const { isLoading, error, data } = useDashboardQuery();
  const {
    isLoading: isLoadingLoan,
    error: loanError,
    data: loan,
  } = useLoanDisbursedQuery();
  const {
    isLoading: isLoadingDisburse,
    error: disburseError,
    data: disburseVolume,
  } = useDisburseVolume();
  const {
    isLoading: isLoadingLoanRecollection,
    error: recollectionError,
    data: loanRecollection,
  } = useLoanRecollection();
  const {
    isLoading: isLoadingSavings,
    error: savingsError,
    data: savings,
  } = useSavings();
  const {
    isLoading: isLoadingMissedPayment,
    error: missedPaymentError,
    data: missedPayment,
  } = useMissedPayment();
  const { handlePageChange } = usePageChange();

  const { primary, secondary } = getDashboardMetrics({ data });

  return (
    <>
      <DashboardHeader data={data} isLoading={isLoading} />

      <Metric item={primary} isLoading={isLoading} error={error} />

      <Metric item={secondary} cols={2} isLoading={isLoading} error={error} />

      <div className="flex flex-col p-5 my-5 bg-white h-[40vh]">
        <DisbursementLineChart
          data={disburseVolume ?? []}
          isLoading={isLoadingDisburse}
          error={disburseError}
        />
      </div>
      <div>
        <div className="my-5 text-gray-500 tabs tabs-border custom-tabs">
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Disbursements"
            defaultChecked
          />
          <div className="p-10 bg-white tab-content">
            <DisbursementTable
              isLoading={isLoadingLoan}
              error={loanError}
              item={loan?.data}
              meta={loan?.meta}
              onPageChange={(page) =>
                handlePageChange(page, PaginationKey.loan_page)
              }
            />
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Re-collections"
          />
          <div className="p-10 bg-white tab-content">
            <RecollectionTable
              isLoading={isLoadingLoanRecollection}
              error={recollectionError}
              item={loanRecollection?.data}
              meta={loanRecollection?.meta}
              onPageChange={(page) =>
                handlePageChange(page, PaginationKey.recollection_page)
              }
            />
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Savings"
          />
          <div className="p-10 bg-white tab-content">
            <SavingsTable
              isLoading={isLoadingSavings}
              error={savingsError}
              item={savings?.data}
              meta={savings?.meta}
              onPageChange={(page) =>
                handlePageChange(page, PaginationKey.savings_page)
              }
            />
          </div>
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Missed payments"
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
