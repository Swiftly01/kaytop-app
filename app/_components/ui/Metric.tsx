import { DashboardKpiResponse, MetricProps } from "@/app/types/dashboard";
import { JSX } from "react";
import MetricCard from "./MetricCard";
import Spinner from "./SpinnerLg";
import { AxiosError } from "axios";

type AllowedCols = 1 | 2 | 3 | 4;

interface AppProps {
  cols?: AllowedCols;
  item: MetricProps[];
  isLoading: boolean;
  error: AxiosError<DashboardKpiResponse> | null;
}

const colMap: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export default function Metric({
  cols = 4,
  item,
  isLoading,
  error,
}: AppProps): JSX.Element {
  const numcols = colMap[cols] ?? "md:grid-cols-4";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center px-4 py-5 my-5 bg-white rounded-md">
        <Spinner />
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
    <div
      className={`grid grid-cols-2 px-4 py-5 my-5 bg-white rounded-md ${numcols}  gap-y-4`}
    >
      {item.map((item: MetricProps, index: number) => {
        return <MetricCard key={index} item={item} index={index} />;
      })}
    </div>
  );
}
