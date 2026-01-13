import { SummaryProps } from "@/app/types/dashboard";
import React from "react";

interface SummaryCardProps {
  item: SummaryProps
}

export default function SummaryCard({item}: SummaryCardProps) {
  return (
    <div>
      <p className="text-sm text-slate-400">{item.label}</p>
      <h1 className="font-medium">{item.value}</h1>
    </div>
  );
}
