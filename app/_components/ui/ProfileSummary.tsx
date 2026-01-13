import React from "react";
import SummaryCard from "./SummaryCard";
import { SummaryProps } from "@/app/types/dashboard";
import { AxiosError } from "axios";
import { CreditOfficerErrorResponse } from "@/app/types/creditOfficer";
import Spinner from "./Spinner";
import SpinnerLg from "./SpinnerLg";

interface AppProps {
  isLoading: boolean;
  error: AxiosError<CreditOfficerErrorResponse> | null;
  item: SummaryProps[];
   title?: string; // optional header
  className?: string; // optional additional styling
  gridCols?: string; // optional grid column definition
}

export default function ProfileSummary({ item, isLoading, error, title,
  className = "",
  gridCols = "grid-cols-1 md:grid-cols-6", // default to 6-cols on md+
   }: AppProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center px-4 py-5 my-5 bg-white rounded-md">
        <SpinnerLg />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-5 my-5 text-center text-red-400 bg-white rounded-md">
        {error.response?.data?.message || "Failed to load KPI"}
      </div>
    );
  }
  return (
    // <div className="flex flex-wrap justify-between gap-4 px-5 py-8 mt-3 bg-white rounded-md">
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}

       <div className={`grid ${gridCols} gap-4 text-sm text-slate-600`}>
      {item.map((item: SummaryProps, index: number) => (
        <div key={index} className="wrap-break-word">
      <SummaryCard item={item} />
    </div>
      ))}
      </div>
    </div>
  );
}
