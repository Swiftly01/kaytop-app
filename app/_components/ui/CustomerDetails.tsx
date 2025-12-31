"use client";
import { useBranchCustomerById } from "@/app/dashboard/bm/queries/customers/useBranchCustomerById";
import {
  getActiveLoanSummary,
  getBranchCustomerProfileSummary,
  ROUTES,
} from "@/lib/utils";
import BreadCrumb from "./BreadCrumb";
import DrawerTable from "./DrawerTable";
import PieChart from "./PieChart";
import RepaymentProgress from "./RepaymentProgress";

import { useBranchCustomerLoan } from "@/app/dashboard/bm/queries/loan/useBranchCustomerLoan";
import { useBranchCustomerSavings } from "@/app/dashboard/bm/queries/loan/useBranchCustomerSavings";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";
import ProfileSummary from "./ProfileSummary";
import BranchCustomerSavingsTable from "./table/BranchCustomerSavingsTable";
import { useLoanPaymentSchedule } from "@/app/dashboard/bm/queries/loan/useLoanPaymentSchedule";
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

  const profileSummary = data?.data
    ? getBranchCustomerProfileSummary(data.data)
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


  return (
    <>
      <BreadCrumb title="Customer Details" link={ROUTES.Bm.CUSTOMERS} />
      <div className="flex flex-wrap gap-6 my-5 lg:flex-nowrap">
        <div className="flex flex-col items-center w-full gap-4 px-5 bg-white rounded-lg sm:flex-row">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
            <PieChart />
          </div>

          <div className="text-center sm:text-left">
            <h1 className=" text-neutral-700 text-md">Loan Repayment</h1>
            <div className="py-5">
              <p className="text-sm text-gray-600">
                Next Payment - Jan 15, 2025
              </p>
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">₦40,206.20</h1>
                <span className="px-2 text-sm bg-green-200 rounded-full text-end">
                  3.4%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center w-full gap-4 px-5 bg-white rounded-lg sm:flex-row">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
            <PieChart />
          </div>

          <div className="text-center sm:text-left">
            <h1 className=" text-neutral-700 text-md">Savings Account</h1>
            <div className="py-5">
              <p className="text-sm text-gray-600">
                Next Payment - Jan 15, 2025
              </p>
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">₦40,206.20</h1>
                <span className="px-2 text-sm bg-green-200 rounded-full text-end">
                  3.4%
                </span>
              </div>
            </div>
          </div>
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
                <ul className="z-50 min-h-full p-4 overflow-x-scroll bg-white menu w-80 md:w-140">
                  <h1 className="text-center text-md text-neutral-700">
                    Payment Schedule
                  </h1>
                  <PaymentScheduleTable
                    isLoading={isLoadingPaymentSchedule}
                    error={paymentScheduleError}
                    item={paymentScheduleData?.data.schedule}
                    meta={paymentScheduleData?.meta}
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
