"use client";

import { useState } from "react";
import CustomerSelect from "./CustomerSelect";
import { LoanService } from "@/app/services/loanService";
import { CustomerService } from "@/app/services/customerService";

export default function LoanSetupStep({
  onContinue,
  onCancel,
}: {
  onContinue: (data: {
    customerId: number;
    amount: number;
    durationDays: number;
  }) => void;
  onCancel: () => void;
}) {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);
  const [hasLoan, setHasLoan] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkLoanStatus = async () => {
    if (!customerId) return;
    setLoading(true);
    const loans = await CustomerService.getBranchCustomerLoan(customerId);
    setHasLoan(loans.some((l) => l.status === "active"));
    setChecked(true);
    setLoading(false);
  };

  return (
    <>
      <h2 className="text-lg font-semibold">Create new loan</h2>
      <p className="text-sm text-slate-500 mb-6">
        Tell us about your customer. It only takes a few minutes.
      </p>

      <label className="block mb-1 text-sm">Select Customer</label>
      <CustomerSelect onSelect={setCustomerId} />

      <button
        onClick={checkLoanStatus}
        disabled={!customerId || loading}
        className="text-purple-600 text-sm mt-2 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Check loan status"}
      </button>

      {checked && hasLoan && (
        <p className="text-red-600 text-sm mt-2">
          This customer already has an active loan
        </p>
      )}

      <label className="block mt-4 mb-1 text-sm">Loan amount</label>
      <input
        type="number"
        className="w-full border rounded-lg px-4 py-2"
        value={amount}
        onChange={(e) => setAmount(+e.target.value)}
      />

      <label className="block mt-4 mb-1 text-sm">
        Repayment Duration (days)
      </label>
      <input
        type="number"
        className="w-full border rounded-lg px-4 py-2"
        value={duration}
        onChange={(e) => setDuration(+e.target.value)}
      />

      <div className="flex justify-between mt-6">
        <button onClick={onCancel} className="border px-4 py-2 rounded-lg">
          Cancel
        </button>

        <button
          disabled={!customerId || hasLoan || !checked || amount <= 0}
          onClick={() =>
            onContinue({
              customerId: customerId!,
              amount,
              durationDays: duration,
            })
          }
          className="bg-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </>
  );
}
