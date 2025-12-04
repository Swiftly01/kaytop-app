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
    <div className="flex flex-col gap-6">
      <p className="text-sm font-semibold tracking-[0.006em] text-[#8B8F96] opacity-90">
        {title}
      </p>
      <p className="text-[28px] font-bold leading-[1.29] text-[#021C3E]">{value}</p>
      <p
        className={`text-sm leading-[1.43] tracking-[0.006em] ${
          isPositive ? "text-[#5CC47C]" : "text-[#E43535]"
        }`}
      >
        {change}
      </p>
    </div>
  );
}
