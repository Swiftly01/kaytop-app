"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LoanDisbursedVolumeResponse } from "@/app/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import { AxiosError } from "axios";
import { ApiResponseError } from "@/app/types/auth";
import SpinnerLg from "./SpinnerLg";
import ErrorMessage from "./table/ErrorMessage";

interface ChartProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  data: LoanDisbursedVolumeResponse[];
}

// const data = [
//   { date: "2025-11-25", loanCount: 1, totalAmount: 5000 },
//   { date: "2025-11-26", loanCount: 2, totalAmount: 15000 },
//   { date: "2025-11-27", loanCount: 1, totalAmount: 8000 },
//   { date: "2025-11-28", loanCount: 3, totalAmount: 25000 },
//   { date: "2025-11-29", loanCount: 1, totalAmount: 20000 },
// ];

export default function DisbursementLineChart({
  isLoading,
  error,
  data,
}: ChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <SpinnerLg />
      </div>
    );
  }

  if(error){
    return  <ErrorMessage error={error} />
  }
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 25, bottom: 5 }}>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />

        <XAxis dataKey="date" />

        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip
          formatter={(value, name) => {
            if (name === "Total Amount") {
              return [formatCurrency(Number(value)), name];
            }

            return [value, name];
          }}
        />
        <Legend />

        <Line
          type="monotone"
          dataKey="totalAmount"
          stroke="#8884d8"
          strokeWidth={3}
          name="Total Amount"
        />

        <Line
          type="monotone"
          dataKey="loanCount"
          stroke="#82ca9d"
          strokeWidth={3}
          name="Loan Count"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
