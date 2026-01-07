import React from "react";
import SpinnerLg from "./SpinnerLg";
import { formatCurrency } from "@/lib/utils";

type RepaymentProgressProps = {
  isLoading: boolean;
  paid: number;
  total: number;
};

export default function RepaymentProgress({
  isLoading,
  paid,
  total,
}: RepaymentProgressProps) {
  const percentage = Math.round((paid / total) * 100);
  if (isLoading) {
    return (
      <div className="flex justify-center pt-3">
        <SpinnerLg />
      </div>
    );
  }
  return (
    <>
      <div className="flex justify-between">
        <h1 className="font-semibold text-neutral-700">
          Repayment Progress ({percentage}% Paid)
        </h1>
        <p className="text-sm font-semibold text-gray-500">{formatCurrency(paid)}</p>
      </div>
      <div>
        <progress
          className="w-56 w-full progress custom-progress"
          value={percentage}
          max="100"
        ></progress>

        <p className="my-1 text-xs font-semibold text-gray-500">
          Total: {formatCurrency(total)}
        </p>
      </div>
    </>
  );
}
