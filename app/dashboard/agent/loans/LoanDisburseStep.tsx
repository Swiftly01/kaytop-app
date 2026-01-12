"use client";

import { useMemo, useState } from "react";
// import { LoanService } from "@/services/loan.service";
import { LoanDraft } from "./CreateLoanModal";
import { calculateLoan } from "./LoanCalculator";
import { LoanService } from "@/app/services/loanService";

export default function LoanDisburseStep({
  draft,
  onBack,
  onSuccess,
}: {
  draft: LoanDraft;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [interestRate, setInterestRate] = useState(20);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const summary = useMemo(
    () =>
      calculateLoan({
        amount: draft.amount,
        interestRate,
        durationDays: draft.durationDays,
      }),
    [draft, interestRate]
  );

  const submit = async () => {
    if (!file) return;
    setLoading(true);

    const loan = await LoanService.createLoan(draft.customerId, {
      amount: draft.amount,
      term: draft.durationDays,
      interestRate,
    });

    const formData = new FormData();
    formData.append("disbursementProof", file);

    await LoanService.disburseLoan(loan.id, formData);

    setLoading(false);
    onSuccess();
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">
        Disburse Loan
      </h2>

      <div className="bg-sky-50 rounded-xl p-4 mb-4 space-y-2">
        <div>Interest Rate: {interestRate}%</div>
        <div>Monthly Payment: ₦{summary.monthlyPayment}</div>
        <div>Total Repayment: ₦{summary.totalRepayment}</div>
      </div>

      <label className="block mb-1">Interest Rate (%)</label>
      <input
        type="number"
        value={interestRate}
        onChange={(e) => setInterestRate(+e.target.value)}
        className="w-full border rounded-lg px-4 py-2 mb-4"
      />

      <label className="block mb-1">Disbursement Proof</label>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-6"
      />

      <div className="flex justify-between">
        <button onClick={onBack} className="border px-4 py-2 rounded-lg">
          Back
        </button>

        <button
          onClick={submit}
          disabled={!file || loading}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Processing..." : "Create and Disburse Loan"}
        </button>
      </div>
    </>
  );
}
