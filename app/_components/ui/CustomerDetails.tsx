"use client";
import { useBranchCustomerById } from "@/app/dashboard/bm/queries/customers/useBranchCustomerById";
import {
  getActiveLoanSummary,
  getBranchCustomerProfileSummary,
  mapLoanRepaymentProgessData,
  mapSavingsProgressData,
  ROUTES,
} from "@/lib/utils";
import BreadCrumb from "./BreadCrumb";
import RepaymentProgress from "./RepaymentProgress";

import { useBranchCustomerLoan } from "@/app/dashboard/bm/queries/loan/useBranchCustomerLoan";
import { useBranchCustomerSavings } from "@/app/dashboard/bm/queries/loan/useBranchCustomerSavings";
import { useLoanPaymentSchedule } from "@/app/dashboard/bm/queries/loan/useLoanPaymentSchedule";
import { useCustomerSavingsProgress } from "@/app/dashboard/bm/queries/savings/useCustomerSavingsProgress";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";
import LoanRepaymentChart from "./LoanRepaymentChart";
import ProfileSummary from "./ProfileSummary";
import SavingsChart from "./SavingsChart";
import BranchCustomerSavingsTable from "./table/BranchCustomerSavingsTable";
import PaymentScheduleTable from "./table/PaymentScheduleTable";

export default function CustomerDetails() {
  const { isLoading, error, data } = useBranchCustomerById();
  const {
    isLoading: isLoadingLoans,
    error: loansError,
    data: loans,
  } = useBranchCustomerLoan();
  const {
    isLoading: isLoadingSavings,
    error: savingsError,
    data: savings,
  } = useBranchCustomerSavings();

  const profileSummary = data
    ? getBranchCustomerProfileSummary(data)
    : [];

  const { handlePageChange, setContextParam } = usePageChange();

  const activeLoan = loans?.find((loan) => {
    return loan.status === "active";
  });

  const activeLoanSummary = activeLoan ? getActiveLoanSummary(activeLoan) : [];

  function handleClick() {
    if (activeLoan) {
      setContextParam(activeLoan?.id, PaginationKey.active_loan_id);
    }

    return;
  }

  const {
    isLoading: isLoadingPaymentSchedule,
    error: paymentScheduleError,
    data: paymentScheduleData,
  } = useLoanPaymentSchedule();

  const {
    isLoading: isLoadingSavingsProgress,
    error: savingsProgressError,
    data: savingsProgress,
  } = useCustomerSavingsProgress();

  const savingsSummary = savingsProgress
    ? mapSavingsProgressData(savingsProgress)
    : [];

  const loanSummary = activeLoan ? mapLoanRepaymentProgessData(activeLoan) : [];

  return (
    <>
      <BreadCrumb title="Customer Details" link={ROUTES.Bm.CUSTOMERS} />
      <div className="flex flex-wrap gap-6 my-5 lg:flex-nowrap">
        <div className="w-full gap-4 px-10 bg-white rounded-lg">
          <LoanRepaymentChart
            data={loanSummary}
            defaultIndex={0}
            isLoading={isLoadingLoans}
            error={loansError}
          />
        </div>
        <div className="w-full gap-4 bg-white rounded-lg md:px-10">
          <SavingsChart
            data={savingsSummary}
            defaultIndex={0}
            isLoading={isLoadingSavingsProgress}
            error={savingsProgressError}
          />
        </div>
      </div>

      <ProfileSummary
        item={profileSummary}
        isLoading={isLoading}
        error={error}
      />

      {activeLoan && (
        <>
          <ProfileSummary
            item={activeLoanSummary}
            isLoading={isLoadingLoans}
            error={loansError}
          />

          <div className="px-5 py-3 my-3 bg-white rounded-md">
            <RepaymentProgress
              isLoading={isLoadingLoans}
              paid={Number(activeLoan?.amountPaid)}
              total={Number(activeLoan?.totalRepayable)}
            />

            <div className="drawer drawer-end">
              <input
                id="my-drawer-5"
                type="checkbox"
                className="drawer-toggle"
              />
              <div className="drawer-content">
                <label
                  onClick={handleClick}
                  htmlFor="my-drawer-5"
                  className="text-sm underline cursor-pointer drawer-button decoration-brand-purple text-brand-purple"
                >
                  View Payment Schedule
                </label>
              </div>
              <div className="z-40 drawer-side">
                <label
                  htmlFor="my-drawer-5"
                  aria-label="close sidebar"
                  className="drawer-overlay"
                ></label>
                <ul className="z-50 min-h-full p-4 overflow-x-scroll bg-white menu w-80 md:w-200">
                  <h1 className="text-center text-md text-neutral-700">
                    Payment Schedule
                  </h1>
                  <PaymentScheduleTable
                    isLoading={isLoadingPaymentSchedule}
                    error={paymentScheduleError}
                    item={paymentScheduleData?.schedule.items}
                    meta={paymentScheduleData?.schedule.pagination}
                    onPageChange={(page) =>
                      handlePageChange(
                        page,
                        PaginationKey.payment_schedule_page
                      )
                    }
                  />
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
      <div>
        <p className="pb-5 text-md">Transaction History</p>
        <div className="p-10 bg-white">
          <BranchCustomerSavingsTable
            isLoading={isLoadingSavings}
            error={savingsError}
            item={savings?.data.transactions}
            meta={savings?.meta}
            onPageChange={(page) =>
              handlePageChange(page, PaginationKey.branch_customer_savings_page)
            }
          />
        </div>
      </div>
    </>
  );
}
