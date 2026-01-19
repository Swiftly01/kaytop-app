import { DashboardKpiResponse, MetricProps } from "@/app/types/dashboard";
import { AxiosError } from "axios";
import Spinner from "./Spinner";
import { CustomerMetricCard } from "./CustomerMetricCard";

type AllowedCols = 1 | 2 | 3 | 4;

interface CustomerMetricPropsWrapper {
  cols?: AllowedCols;
  item: MetricProps[];
  isLoading: boolean;
  error: AxiosError<DashboardKpiResponse> | null;
}

const colMap: Record<AllowedCols, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export function CustomerMetric({
  cols = 4,
  item,
  isLoading,
  error,
}: CustomerMetricPropsWrapper) {
  const numcols = colMap[cols];

  if (isLoading) {
    return (
      <div className="flex justify-center py-6 bg-white rounded-md">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-white p-4 rounded-md">
        {error.response?.data?.message || "Failed to load KPI"}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 ${numcols} gap-4 rounded-md`}>
      {item.map((metric, index) => (
        <CustomerMetricCard key={index} item={metric} index={index} />
      ))}
    </div>
  );
}
