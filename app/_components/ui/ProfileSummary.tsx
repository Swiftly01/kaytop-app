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
}

export default function ProfileSummary({ item, isLoading, error }: AppProps) {
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
    <div className="flex flex-wrap justify-between gap-4 px-5 py-8 mt-3 bg-white rounded-md">
      {item.map((item: SummaryProps, index: number) => (
        <SummaryCard key={index} item={item} />
      ))}
    </div>
  );
}
