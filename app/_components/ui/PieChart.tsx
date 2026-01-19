/**
 * PieChart Component
 * SVG-based pie chart for visualizing data distributions
 * Styled to match DonutChart design consistency
 */

interface PieChartProps {
  data: { value: number; color: string }[];
  size?: number;
  backgroundColor?: string;
}

/**
 * Convert polar coordinates to cartesian coordinates
 */
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

/**
 * Generate SVG path for an arc segment
 */
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'L',
    x,
    y,
    'Z'
  ].join(' ');
}

export default function PieChart({
  data,
  size = 120,
  backgroundColor = '#F2F4F7'
}: PieChartProps) {
  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Generate segments with consistent sizing (matching DonutChart)
  const center = size / 2;
  const radius = size / 2; // Full radius for pie segments
  
  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const path = describeArc(
      center,
      center,
      radius,
      currentAngle,
      currentAngle + angle
    );
    currentAngle += angle;

    return {
      path,
      color: item.color,
      key: `segment-${index}`
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
    >
      {/* Background circle - full size to match DonutChart */}
      <circle
        cx={center}
        cy={center}
        r={size / 2}
        fill={backgroundColor}
      />

      {/* Segments */}
      {segments.map((segment) => (
        <path
          key={segment.key}
          d={segment.path}
          fill={segment.color}
        />
      ))}
    </svg>
  );
}
