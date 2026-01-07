"use client";

import { useIsMobile } from "@/app/hooks/useIsMobile";
import { ApiResponseError } from "@/app/types/auth";
import { SummaryProps } from "@/app/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import { AxiosError } from "axios";
import { useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import SpinnerLg from "./SpinnerLg";
import ErrorMessage from "./table/ErrorMessage";

const COLORS: Record<string, string> = {
  "Amount Paid": "#0f766e",
  "Total Repayable": "#8884d8",
  default: "#8884d8",
};

interface PieChartProps {
  isLoading: boolean;
  error?: AxiosError<ApiResponseError> | null;
  data: SummaryProps[];
  isAnimationActive?: boolean;
  defaultIndex?: number;
}

export default function LoanRepaymentChart({
  isLoading,
  error,
  data,
  isAnimationActive = true,
  defaultIndex,
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number>(defaultIndex ?? 0);
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[20vh]">
        <SpinnerLg />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[20vh] flex items-center justify-center">
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-center h-[20vh] text-red-400">
        <p> No loan repayment Summary available yet!!</p>
       
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 400,
        margin: "0 auto",
        height: 0,
        paddingBottom: `${isMobile ? "60%" : "50%"}`,
        position: "relative",
      }}
    >
      <h1 className="hidden pt-5 font-semibold text-center md:block md:text-lg text-neutral-700">
        Loan Repayment Charts
      </h1>
      <ResponsiveContainer
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <RechartsPieChart>
          <Pie
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            {...(data as any)}
            activeIndex={activeIndex}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            dataKey="value"
            nameKey="label"
            paddingAngle={3}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            isAnimationActive={isAnimationActive}
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.label}`}
                fill={COLORS[entry.label] || COLORS.default}
              />
            ))}
          </Pie>

          <Tooltip formatter={(value: number) => formatCurrency(value)} />

          <Legend
            verticalAlign={isMobile ? "bottom" : "middle"}
            align={isMobile ? "center" : "right"}
            layout={isMobile ? "horizontal" : "vertical"}
            iconSize={15}
            iconType="circle"
            formatter={(value: string) => {
              const dataEntry = data.find((d) => d.label === value);
              const formattedValue = dataEntry
                ? formatCurrency(dataEntry.value as number)
                : "";
              return `${value}: ${formattedValue}`;
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
