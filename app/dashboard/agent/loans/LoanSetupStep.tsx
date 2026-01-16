"use client";

import { useMemo, useState, useEffect } from "react";
import CustomerSelect from "./CustomerSelect";
import { LoanService } from "@/app/services/loanService";
import { CustomerService } from "@/app/services/customerService";
import { calculateLoan } from "./LoanCalculator";
import { LoanDraft } from "./CreateLoanModal";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";

export default function LoanSetupStep({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);
  const [hasLoan, setHasLoan] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showDisbursement, setShowDisbursement] = useState(false);
  const [interestRate, setInterestRate] = useState(20);
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [checkingLoan, setCheckingLoan] = useState(false);

  const summary = useMemo(
    () =>
      calculateLoan({
        amount,
        interestRate,
        durationDays: duration,
      }),
    [amount, interestRate, duration]
  );

  // Reset loan check if customer changes
  useEffect(() => {
    setChecked(false);
    setHasLoan(false);
  }, [customerId]);

  const fetchLoanStatus = async (customerId: number) => {
    const loans = await CustomerService.getBranchCustomerLoan(customerId);
    return loans.some((l) => l.status === "active");
  };

  const checkLoanStatus = async () => {
    if (!customerId) return;

    setCheckingLoan(true);
    try {
      const hasActiveLoan = await fetchLoanStatus(customerId);
      setHasLoan(hasActiveLoan);
      setChecked(true);
    } catch (err) {
      toast.error("Failed to check loan status");
    } finally {
      setCheckingLoan(false);
    }
  };

  const handleContinue = async () => {
    if (!customerId || amount <= 0) return;

    setLoading(true);
    let activeLoan = hasLoan;

    // Automatically check loan status if user never clicked
    if (!checked) {
      try {
        activeLoan = await fetchLoanStatus(customerId);
        setHasLoan(activeLoan);
        setChecked(true);
      } catch (err) {
        toast.error("Failed to check loan status");
        setLoading(false);
        return;
      }
    }

    setLoading(false);

    if (activeLoan) {
      toast.error("This customer already has an active loan");
      return;
    }

    // Show disbursement section
    setShowDisbursement(true);
  };

  const submit = async () => {
    if (!customerId || amount <= 0 || !file) return;
    
    if (!file) {
    toast.error("Please upload disbursement proof");
    return;
  }

    const draft: LoanDraft = {
      customerId,
      amount,
      durationDays: duration,
    };

    try {
      setLoading(true);

      const loan = await LoanService.createLoan(draft.customerId, {
        amount: draft.amount,
        term: draft.durationDays,
        interestRate,
      });

      const formData = new FormData();
      formData.append("disbursementProof", file);

      await LoanService.disburseLoan(loan.id, formData);

      toast.success("Loan created and disbursed successfully");
      onSuccess();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Customer has an unresolved or overdue loan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <h2 className="text-lg font-semibold mb-1">Create new loan</h2>
      <p className="text-sm text-slate-500 mb-6">
        Tell us about your customer. It only takes a few minutes.
      </p>

      {/* Select Customer */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-medium text-slate-700 sm:w-40">
          Select Customer
        </label>
        <div className="flex flex-1 items-center border rounded-lg">
          <div className="flex-1">
            <CustomerSelect onSelect={setCustomerId} />
          </div>
          <button
            onClick={checkLoanStatus}
            disabled={!customerId || checkingLoan}
            className="px-4 text-sm text-purple-600 whitespace-nowrap disabled:opacity-50"
          >
            {checkingLoan ? "Checking..." : "Check loan status"}
          </button>
        </div>
      </div>

      {checked && hasLoan && (
        <p className="text-red-600 text-xs ml-44 mb-2">
          This user has an existing loan and cannot access a new one.
        </p>
      )}

      {/* Loan Amount */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
        <label className="text-sm font-medium text-slate-700 sm:w-40">
          Loan amount
        </label>
        <div className="flex flex-1 items-center border rounded-lg overflow-hidden">
          <input
            type="number"
            placeholder="₦0.00"
            className="flex-1 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            value={amount === 0 ? "" : amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          />
        </div>
      </div>

      {/* Repayment Duration */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-medium text-slate-700 sm:w-40">
          Repayment Duration
        </label>
        <div className="flex flex-1 items-center border rounded-lg overflow-hidden">
          <input
            type="number"
            className="flex-1 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            value={duration === 0 ? "" : duration}
            onChange={(e) => setDuration(Math.max(1, +e.target.value))}
          />
          <span className="px-4 text-sm border-l bg-slate-50">Days</span>
        </div>
      </div>

      {/* Disbursement Section */}
      {showDisbursement && (
        <>
  <div className="mt-6 rounded-xl bg-sky-50 p-6 space-y-6">

    {/* Interest Rate */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <label className="text-sm font-medium sm:w-40">Interest Rate</label>
      <div className="flex-1 relative">
        <input
          type="number"
          value={interestRate}
          min={0}
          onChange={(e) => setInterestRate(Math.max(0, +e.target.value))}
          className="w-full rounded-lg border px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-violet-500"
        /> 
        <span className="absolute right-64 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
          %
        </span>
      </div>
    </div>

    {/* Monthly Payment */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <label className="text-sm font-medium sm:w-40">Monthly Payment</label>
      <div className="flex-1 relative">
        <div className="w-full rounded-lg border px-4 py-2 pr-6  text-sm font-semibold">
          ₦{summary.monthlyPayment.toLocaleString()}
        </div>
      </div>
    </div>

    {/* Total Repayment */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <label className="text-sm font-medium sm:w-40">Total Repayment</label>
      <div className="flex-1 relative">
        <div className="w-full rounded-lg border px-4 py-2 pr-6  text-sm font-semibold">
          ₦{summary.totalRepayment.toLocaleString()}
        </div>
      </div>
    </div>

   
  </div>
   {/* Disbursement Proof */}
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 mt-3">
      <label className="text-sm font-medium sm:w-40">Disbursement Proof</label>

      {/* Hidden file input */}
      <input
        type="file"
        id="disbursementFile"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {/* Styled drag-drop box */}
      <label
        htmlFor="disbursementFile"
        className="flex-1 border border-dashed rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
      >
        <div className="p-3 bg-[hsl(262,83%,58%)]/10 rounded-full text-[hsl(262,83%,58%)]">
                  <UploadCloud className="w-5 h-5" />
                </div>
        <div className="text-center sm:text-left">
          <p className="text-sm text-purple-600 font-medium cursor-pointer">
            Click to upload
          </p>
          <p className="text-xs text-gray-500">
            or drag and drop SVG, PNG, JPG, GIF (max. 800×400px)
          </p>
          {file && (
            <p className="text-xs text-gray-700 mt-1">Selected: {file.name}</p>
          )}
        </div>
      </label>
    </div>
  </>
)}


      {/* Footer Buttons */}
      <div className="flex justify-between gap-4 mt-4">
        <button
          onClick={onCancel}
          className="flex-1 border rounded-lg py-2 text-sm"
        >
          Cancel
        </button>

        {!showDisbursement && (
          <button
            disabled={!customerId || amount <= 0 || loading || hasLoan}
            onClick={handleContinue}
            className="flex-1 bg-purple-600 text-white rounded-lg py-2 text-sm disabled:opacity-50"
          >
            Continue
          </button>
        )}

        {showDisbursement && (
          <button
            onClick={submit}
            disabled={!file || loading}
            className="flex-1 bg-purple-600 text-white rounded-lg py-2 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Create and Disburse Loan"}
          </button>
        )}
      </div>
    </>
  );
}
