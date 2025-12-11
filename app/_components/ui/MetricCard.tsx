import { MetricProps } from "@/app/types/dashboard";
import React from "react";


interface MetricCardProps {
  item: MetricProps;
  index: number;
}

export default function MetricCard({ item, index }: MetricCardProps) {
  const changeColorClass =
    item.changeColor === "green" ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`flex flex-col items-start px-4 border-gray-300 ${
        item.border && index !== 2 ? "border-l" : ""
      }
      ${index === 2 ? "md:border-l" : ""}
       `}
    >
      <p className="text-sm text-gray-500">{item.title}</p>
      <h1 className="text-xl font-semibold">{item.value}</h1>
      <p className={`text-sm ${changeColorClass}`}>{item.change}</p>
    </div>
  );
}
