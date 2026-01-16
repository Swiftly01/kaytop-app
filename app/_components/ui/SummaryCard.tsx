import { StatusBadge } from "@/app/dashboard/agent/loans/LoanAgentClient";
import { SummaryProps } from "@/app/types/dashboard";
import React from "react";

interface SummaryCardProps {
  item: SummaryProps
}

export default function SummaryCard({item}: SummaryCardProps) {
  return (
    <div>
      <p className="text-md text-slate-400">{item.label}</p>
      <h1 className="font-medium text-neutral-800"> {item.label === "Loan status" ? (
          <StatusBadge status={String(item.value)} />
        ) : (
          item.value
        )}</h1>
    </div>
  );
}
