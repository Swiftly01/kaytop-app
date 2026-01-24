/**
 * AccountCard Component
 * Display account information with chart visualization
 */

import PieChart from './PieChart';
import DonutChart from './DonutChart';

interface AccountCardProps {
  title: string;
  subtitle: string;
  amount: string;
  growth: number;
  chartData: { value: number; color: string }[];
  chartType: 'loan' | 'savings';
  percentage?: number; // For loan repayment donut chart
}

export default function AccountCard({
  title,
  subtitle,
  amount,
  growth,
  chartData,
  chartType,
  percentage
}: AccountCardProps) {
  // Determine background color based on chart type
  const backgroundColor = chartType === 'loan' ? '#F4EBFF' : '#F2F4F7';

  return (
    <div
      className="flex items-center gap-6 rounded-xl"
      style={{
        width: '551px',
        height: '168px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #EAECF0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)'
      }}
    >
      {/* Chart - Donut for loan, Pie for savings */}
      {chartType === 'loan' && percentage !== undefined ? (
        <DonutChart
          percentage={percentage}
          size={120}
          strokeWidth={20}
          filledColor="#7F56D9"
          unfilledColor="#F4EBFF"
          backgroundColor="#F4EBFF"
        />
      ) : (
        <PieChart
          data={chartData}
          size={120}
          backgroundColor={backgroundColor}
        />
      )}

      {/* Content */}
      <div className="flex flex-col justify-center flex-1">
        {/* Title */}
        <h3
          className="text-base font-semibold mb-1"
          style={{ color: '#101828' }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        <p
          className="text-sm font-medium mb-2"
          style={{ color: '#475467' }}
        >
          {subtitle}
        </p>

        {/* Amount */}
        <p
          className="text-3xl font-semibold mb-2"
          style={{ color: '#101828', fontSize: '30px' }}
        >
          {amount}
        </p>

        {/* Growth Badge */}
        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full w-fit"
          style={{
            backgroundColor: '#ECFDF3'
          }}
        >
          {/* Up Arrow Icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9.5V2.5M6 2.5L2.5 6M6 2.5L9.5 6"
              stroke="#027A48"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Growth Text */}
          <span
            className="text-xs font-medium"
            style={{ color: '#027A48' }}
          >
            +{growth.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
