import React from "react";

type RepaymentProgressProps = {
  paid: number;
  total: number;
}

export default function RepaymentProgress({paid, total} : RepaymentProgressProps) {
  const percentage = Math.round((paid / total) * 100);
  return (
    <>
      <div className="flex justify-between mt-3">
        <h1 className="font-semibold text-neutral-700">
          Repayment Progress ({percentage}% Paid)
        </h1>
        <p className="text-sm text-gray-500">₦{paid.toLocaleString()}</p>
      </div>
      <div>
        <progress
          className="w-56 w-full progress custom-progress"
          value={percentage}
          max="100"
        ></progress>

        <p className="my-1 text-xs text-gray-500">Total: #{total.toLocaleString()}</p>
      </div>
    </>
  );
}
