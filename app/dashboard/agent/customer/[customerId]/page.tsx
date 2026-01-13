"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/app/_components/ui/Button";
import RecordRepaymentModal from "./RecordRepaymentModal";
import AddSavingsModal from "./AddSavingsModal";
import { useParams } from "next/navigation";
import { CustomerService } from "@/app/services/customerService";
import { useBranchCustomerLoan } from "@/app/dashboard/bm/queries/loan/useBranchCustomerLoan";
import { useBranchCustomerById } from "@/app/dashboard/bm/queries/customers/useBranchCustomerById";
import { useBranchCustomerSavings } from "@/app/dashboard/bm/queries/loan/useBranchCustomerSavings";
import { formatCurrency, getActiveLoanSummary, getBranchCustomerProfileSummary, mapLoanRepaymentProgessData, mapSavingsProgressData } from "@/lib/utils";
import { usePageChange } from "@/app/hooks/usePageChange";
import { Meta, PaginationKey, SummaryProps } from "@/app/types/dashboard";
import { useLoanPaymentSchedule } from "@/app/dashboard/bm/queries/loan/useLoanPaymentSchedule";
import { useCustomerSavingsProgress } from "@/app/dashboard/bm/queries/savings/useCustomerSavingsProgress";
import LoanRepaymentChart from "@/app/_components/ui/LoanRepaymentChart";
import SavingsChart from "@/app/_components/ui/SavingsChart";
import ProfileSummary from "@/app/_components/ui/ProfileSummary";
import BranchCustomerSavingsTable from "@/app/_components/ui/table/BranchCustomerSavingsTable";
import PaymentScheduleTable from "@/app/_components/ui/table/PaymentScheduleTable";
import { Items } from "@/app/types/loan";
import { X } from "lucide-react";



interface ActiveLoanCardProps {
  loanId: number;
  amount: number;
  outstanding: number;
  dailyPayment: number;
  interestRate: number;
  dueDate: string;
  progress: number;
   disburseDate: string;
   amountPaid: number;
   totalAmount: number;
  onRecordRepayment: () => void;
  onAddSavings: () => void;
}

interface KpiCardsProps {
  loanAmount: number;
  nextPayment: number;
  nextDate?: string;
  savingsBalance: number;

  loanChartData: { label: string; value: number }[];
  savingsChartData: { label: string; value: number }[];

  isLoadingLoans: boolean;
  loansError?: any;

  isLoadingSavings: boolean;
  savingsError?: any;
}

// KPI cards
export function KpiCards({
  loanAmount,
  nextPayment,
  nextDate,
  savingsBalance,
  loanChartData,
  savingsChartData,
  isLoadingLoans,
  loansError,
  isLoadingSavings,
  savingsError,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Loan KPI */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm text-slate-500">Loan Repayment</h4>
          <div className="mt-2 text-2xl font-semibold">
            ₦{nextPayment.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">
            Next Payment – {nextDate ? new Date(nextDate).toDateString() : "—"}
          </div>
        </div>

        <LoanRepaymentChart
            isLoading={isLoadingLoans}
            error={loansError}
            data={loanChartData}
            isAnimationActive={false}
          />

      </div>

      {/* Savings KPI */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm text-slate-500">Savings Account</h4>
          <div className="mt-2 text-2xl font-semibold">
            ₦{savingsBalance.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">Current balance</div>
        </div>

        <SavingsChart
            isLoading={isLoadingSavings}
            error={savingsError}
            data={savingsChartData}
            isAnimationActive={false}
          />

       
      </div>
    </div>
  );
}


// ActiveLoan card
export function ActiveLoanCard({
  loanId,
  amount,
  outstanding,
  dailyPayment,
  interestRate,
  amountPaid,
  disburseDate,
  dueDate,
  progress,
  totalAmount,
  onRecordRepayment,
  onAddSavings,
  onViewSchedule,
}: ActiveLoanCardProps & { onViewSchedule: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Active Loan</h3>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm text-slate-600">
        <Info label="Loan ID" value={loanId} />
        <Info label="Loan Amount" value={`₦${amount.toLocaleString()}`} />
        <Info label="Outstanding" value={`₦${outstanding.toLocaleString()}`} />
        <Info label="Amount Paid" value={`₦${amountPaid.toLocaleString()}`} />

        <Info label="Daily Payment" value={`₦${dailyPayment.toLocaleString()}`} />
        <Info label="Interest Rate" value={`${interestRate}%`} />
        <Info label="Disburse Date" value={new Date(disburseDate).toDateString()} />
        <Info label="Due Date" value={new Date(dueDate).toDateString()} />
      </div>

      {/* Progress */}
      <div className="mt-6 ">
        <div className="flex justify-between mb-2">
          <p className="text-xs text-slate-500">Repayment Progress ({progress}% Paid) </p>
                <p className="text-sm font-semibold text-gray-500">{formatCurrency(amountPaid)}</p>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full">
          <div className="h-2 rounded-full bg-violet-500" style={{ width: `${progress}%` }} />
          <p className="my-1 text-xs font-semibold text-gray-500">
                  Total: {formatCurrency(totalAmount)}
                </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button onClick={onRecordRepayment} className="bg-violet-600 text-white">Record Repayment</Button>
        <Button onClick={onAddSavings} className="bg-white border border-slate-200">Add Savings</Button>
        <button
          onClick={onViewSchedule}
          className="text-sm text-violet-600 hover:underline"
        >
          View Payment Schedule
        </button>

      </div>
    </div>
  );
}


interface PaymentScheduleModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: any;
  items?: Items[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export function PaymentScheduleModal({
  open,
  onClose,
  isLoading,
  error,
  items,
  meta,
  onPageChange,
}: PaymentScheduleModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Modal content */}
      <div className="w-full max-w-3xl bg-white h-full shadow-xl p-6 overflow-y-auto">
        <button
    onClick={onClose}
    className=" text-gray-500 hover:text-gray-700"
  >
    <X className="w-6 h-6" />
  </button>
        <h3 className="text-lg font-semibold mb-4 items-center text-center">Payment Schedule</h3>

        <PaymentScheduleTable
          isLoading={isLoading}
          error={error}
          item={items}
          meta={meta}
          onPageChange={onPageChange}
          renderExtraColumn={(item) => (
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#7f56d9] pointer-events-none"
              checked={item.status === "PAID"}
              readOnly
            />
          )}
        />
      </div>
    </div>
  );
}



export default function DashboardPage() {
  const { customerId } = useParams();
const id = Number(customerId);
  /* =======================
     UI STATE
     ======================= */
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  /* =======================
     LOCAL DATA STATE
     ======================= */
  const [customer, setCustomer] = useState<any>(null);
  const [loan, setLoan] = useState<any>(null);

  /* =======================
     QUERY HOOKS
     ======================= */
      const { handlePageChange, setContextParam } = usePageChange();

       function handleClick() {
    if (activeLoan) {
      setContextParam(activeLoan?.id, PaginationKey.active_loan_id);
    }

    return;
  }

  const {
    isLoading: isLoadingCustomer,
    error: customerError,
    data: customerData,
  } = useBranchCustomerById();

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

  const {
    isLoading: isLoadingPaymentSchedule,
    error: paymentScheduleError,
    data: paymentScheduleData,
  } = useLoanPaymentSchedule();

  console.log(paymentScheduleData);

  const {
    isLoading: isLoadingSavingsProgress,
    error: savingsProgressError,
    data: savingsProgress,
  } = useCustomerSavingsProgress();

  /* =======================
     DERIVED DATA
     ======================= */
  const activeLoan = loans?.find((l) => l.status === "active") ?? null;
   
      const activeLoanSummary = activeLoan ? getActiveLoanSummary(activeLoan) : [];

  const profileSummary = customerData?.data
    ? getBranchCustomerProfileSummary(customerData.data)
    : [];

  const loanSummary = activeLoan
  ? mapLoanRepaymentProgessData(activeLoan).map((i) => ({
      label: i.label,
      value: Number(i.value ?? 0),
    }))
  : [];

const savingsSummary = savingsProgress
  ? mapSavingsProgressData(savingsProgress).map((i) => ({
      label: i.label,
      value: Number(i.value ?? 0),
    }))
  : [];


  /* =======================
     SIDE EFFECTS
     ======================= */
  useEffect(() => {
    if (!id) return;

    async function loadCustomer() {
      try {
        const customerRes = await CustomerService.getBranchCustomerById(id);
        setCustomer(customerRes.data);
      } catch (err) {
        console.error("Failed to load customer", err);
      }
    }

    loadCustomer();
  }, [id]);

  useEffect(() => {
    if (!activeLoan?.id) return;
    setLoan(activeLoan);
  }, [activeLoan]);

  /* =======================
     LOADING GUARD
     ======================= */
  if (isLoadingCustomer || isLoadingLoans) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading customer details…
      </div>
    );
  }

function handleViewSchedule() {
  if (!activeLoan) return;
  setContextParam(activeLoan.id, PaginationKey.active_loan_id);
  setIsScheduleOpen(true);
}


  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-3">Customer Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
          <div className="lg:col-span-6">
           {/* KPI CARDS */}
                <KpiCards
                  loanAmount={Number(loan?.totalRepayable)}
                  nextPayment={Number(loan?.dailyRepayment)}
                  nextDate={loan?.dueDate}
                  savingsBalance={Number(savings?.data?.balance ?? 0)}
                  loanChartData={loanSummary}
                  savingsChartData={savingsSummary}
                  isLoadingLoans={isLoadingLoans}
                  loansError={loansError}
                  isLoadingSavings={isLoadingSavingsProgress}
                  savingsError={savingsProgressError}
                />



            <div className="mt-6">
          <ProfileSummary
                  item={profileSummary}
                  isLoading={isLoadingCustomer}
                  error={customerError}
                  title="Customer Summary"
                gridCols="grid-cols-1 md:grid-cols-6"
                />

{activeLoan && (
        <>
          <div className="px-5 py-3 my-3 bg-white rounded-md">
              <ActiveLoanCard
            loanId={loan.id}
            amount={Number(loan.amount)}
            outstanding={Number(loan.remainingBalance)}
             amountPaid={Number(loan.amountPaid)}
            dailyPayment={Number(loan?.dailyRepayment)}
            interestRate={Number(loan.interestRate)}
            disburseDate={loan.disbursementDate}
            dueDate={loan.dueDate}
            progress={Math.round(
              (Number(loan.amountPaid) / Number(loan?.totalRepayable)) * 100
            )}
            onRecordRepayment={() => setIsRepaymentModalOpen(true)}
            onAddSavings={() => setIsSavingsModalOpen(true)}
            onViewSchedule={handleViewSchedule}
              totalAmount={Number(activeLoan?.totalRepayable)}
          />

          </div>
        </>
      )}
            


            </div>
            </div>
            <div className="lg:col-span-5">
                   <p className="pb-5 text-lg font-semibold">Transaction History</p>
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

        </div>
      </main>

    
    
        <PaymentScheduleModal
  open={isScheduleOpen}
  onClose={() => setIsScheduleOpen(false)}
  isLoading={isLoadingPaymentSchedule}
  error={paymentScheduleError}
  items={paymentScheduleData?.schedule?.items}
  meta={paymentScheduleData?.schedule?.pagination}
  onPageChange={(page) =>
    handlePageChange(page, PaginationKey.payment_schedule_page)
  }
/>





       <RecordRepaymentModal
        isOpen={isRepaymentModalOpen}
        onClose={() => setIsRepaymentModalOpen(false)}
        loanId={loan?.id}
        customerId={customer?.id}
      />
      <AddSavingsModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
      />
    </div>
  );
}



function Info({ label, value }: { label: string; value: any }) {
   return (
     <div>
       <div className="text-sm text-slate-400">{label}</div>
       <div className="font-medium">{value}</div>
     </div>
   );
 }
