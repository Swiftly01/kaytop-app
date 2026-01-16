/**
 * DonutChart Component
 * Simple donut-style chart for loan repayment visualization (Figma style)
 */

interface DonutChartProps {
  percentage: number; // 0-100
  size?: number;
  strokeWidth?: number;
  filledColor?: string;
  unfilledColor?: string;
  backgroundColor?: string;
}

export default function DonutChart({
  percentage,
  size = 120,
  strokeWidth = 20,
  filledColor = '#7F56D9',
  unfilledColor = '#F4EBFF',
  backgroundColor = '#F4EBFF'
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillLength = (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
      style={{ transform: 'rotate(-90deg)' }} // Start from top
    >
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={size / 2}
        fill={backgroundColor}
      />

      {/* Unfilled track (light purple) */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={unfilledColor}
        strokeWidth={strokeWidth}
      />

      {/* Filled portion (purple) */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={filledColor}
        strokeWidth={strokeWidth}
        strokeDasharray={`${fillLength} ${circumference}`}
        strokeLinecap="round"
      />
    </svg>
  );
}
