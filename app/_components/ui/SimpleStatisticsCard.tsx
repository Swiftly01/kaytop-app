/**
 * SimpleStatisticsCard Component
 * Displays a single statistic with label, value, and growth indicator
 */

interface SimpleStatisticsCardProps {
  label: string;
  value: string | number;
  growth: number;
  showGrowth?: boolean;
}

export default function SimpleStatisticsCard({
  label,
  value,
  growth,
  showGrowth = true
}: SimpleStatisticsCardProps) {
  const isPositive = growth >= 0;

  return (
    <div className="bg-white rounded-[12px] border border-[#EAECF0] p-6">
      <div 
        className="text-sm text-[#475467] mb-2" 
        style={{ 
          opacity: 0.9,
          fontWeight: 600,
          fontFamily: "'Open Sauce Sans', sans-serif"
        }}
      >
        {label}
      </div>
      <div 
        className="text-lg text-[#101828] mb-1"
        style={{
          fontWeight: 700,
          fontFamily: "'Open Sauce Sans', sans-serif"
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {showGrowth && (
        <div
          className="text-sm"
          style={{
            color: isPositive ? '#027A48' : '#E43535',
            fontWeight: 500,
            fontFamily: "'Open Sauce Sans', sans-serif"
          }}
        >
          <span style={{ fontWeight: 700 }}>
            {isPositive ? '+' : ''}
            {Math.abs(growth)}%
          </span>
          {' '}This Month
        </div>
      )}
    </div>
  );
}
