import React from "react";

interface MetricData {
  title: string;
  value: string;
  change: string;
  changeColor: "green" | "red";
  border: boolean;
}

interface MetricCardProps {
  item: MetricData;
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
      <p className={`text-sm text-${changeColorClass}-500`}>{item.change}</p>
    </div>
  );
}
