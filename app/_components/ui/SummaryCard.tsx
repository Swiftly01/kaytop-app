import { SummaryProps } from "@/app/types/dashboard";
import React from "react";

interface SummaryCardProps {
  item: SummaryProps
}

export default function SummaryCard({item}: SummaryCardProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{item.label}</p>
      <h1 className="text-sm text-neutral-700">{item.value}</h1>
    </div>
  );
}
