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
  PieProps,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import SpinnerLg from "./SpinnerLg";
import ErrorMessage from "./table/ErrorMessage";

const COLORS: Record<string, string> = {
  "Current Balance": "#0f766e",
  "Remaining Amount": "#f44336",
  "Total Deposited": "#7F56D9",
  "Total Withdrawn": "#ff9800",
  default: "#8884d8",
};

interface PieChartProps {
  isLoading: boolean;
  error?: AxiosError<ApiResponseError> | null;
  data: SummaryProps[];
  isAnimationActive?: boolean;
  defaultIndex?: number;
}

export default function SavingsChart({
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

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 425,
        margin: "0 auto",
        height: 1,
        paddingBottom: `${isMobile ? "60%" : "50%"}`,
        position: "relative",
      }}
    >
      <h1 className="hidden pt-5 font-semibold text-center md:block md:text-lg text-neutral-700">
        Savings Charts
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
            paddingAngle={5}
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
