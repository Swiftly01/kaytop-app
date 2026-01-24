/**
 * ProgressBar Component
 * Visual progress indicator for loan repayment and other metrics
 */

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({
  percentage,
  label,
  showPercentage = true
}: ProgressBarProps) {
  // Ensure percentage is between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="w-full">
      {/* Label and percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span
              className="text-sm font-medium"
              style={{ color: '#344054' }}
            >
              {label}
            </span>
          )}
          {showPercentage && (
            <span
              className="text-sm font-normal"
              style={{ color: '#475467' }}
            >
              {clampedPercentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className="w-full rounded"
        style={{
          height: '8px',
          backgroundColor: '#EAECF0',
          borderRadius: '4px',
          maxWidth: '1072px'
        }}
      >
        <div
          className="h-full rounded transition-all duration-300"
          style={{
            width: `${clampedPercentage}%`,
            backgroundColor: '#7F56D9',
            borderRadius: '4px'
          }}
        />
      </div>
    </div>
  );
}
