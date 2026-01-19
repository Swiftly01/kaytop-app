import { MetricProps } from "@/app/types/dashboard";
import { MoreVertical } from "lucide-react";

interface CustomerMetricCardProps {
  item: MetricProps;
  index: number;
}

interface SparklineProps {
  data?: number[];
  color?: string;
}


function Sparkline({ data = [], color = "#22c55e" }: SparklineProps) {
  //  keep only valid numbers
  const cleanData = data.filter(
    (v): v is number => typeof v === "number" && !isNaN(v)
  );

  //  must have at least 2 points
  if (cleanData.length < 2) return null;

  const max = Math.max(...cleanData);
  const min = Math.min(...cleanData);
  const range = max - min || 1;

  const points = cleanData
    .map((d, i) => {
      const x = (i / (cleanData.length - 1)) * 80;
      const y = 24 - ((d - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="80" height="24" viewBox="0 0 80 24">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}



export function CustomerMetricCard({ item }: CustomerMetricCardProps) {
  const changeColorClass =
    item.changeColor === "green"
      ? "text-green-500"
      : "text-red-500";
      const isGreen = item.changeColor !== "red";

return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white flex justify-between items-center">
      {/* LEFT CONTENT */}
      <div>
        <p className="text-sm text-gray-500">{item.title}</p>

        <p className="text-2xl font-semibold mt-1">
          {item.value}
        </p>

        <p
          className={`text-sm mt-1 ${
            isGreen ? "text-green-500" : "text-red-500"
          }`}
        >
          {item.change || "↑ 100% vs last month"}
        </p>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex flex-col items-end gap-2">
        <MoreVertical size={16} className="text-gray-400" />

        <div className="h-6 w-20 flex items-center justify-end">
                {item.sparkline?.length ? (
                    <Sparkline
                    data={item.sparkline}
                    color={isGreen ? "#22c55e" : "#ef4444"}
                    />
                ) : (
                    <span className="text-xs text-gray-500">—</span>
                )}
                </div>

      </div>
    </div>
  );

}

