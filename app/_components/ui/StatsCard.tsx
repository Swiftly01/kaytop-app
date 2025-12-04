import React from "react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
}

export default function StatsCard({
  title,
  value,
  change,
  isPositive = true,
}: StatsCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-neutral-500 opacity-90">
        {title}
      </p>
      <p className="text-3xl font-bold text-neutral-700">{value}</p>
      <p
        className={`text-sm ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {change}
      </p>
    </div>
  );
}
