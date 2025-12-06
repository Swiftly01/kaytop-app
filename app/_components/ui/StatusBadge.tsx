import React from 'react';

interface StatusBadgeProps {
  status: 'Active' | 'Scheduled' | 'Savings';
  type?: 'savings';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const isActive = status === 'Active';
  const isSavings = status === 'Savings' || type === 'savings';
  
  // Determine colors based on status/type
  const getColors = () => {
    if (isSavings) {
      return {
        bg: 'bg-[#ECFDF3]',
        text: 'text-[#027A48]',
        dot: 'bg-[#12B76A]'
      };
    }
    if (isActive) {
      return {
        bg: 'bg-[#ECFDF3]',
        text: 'text-[#027A48]',
        dot: 'bg-[#12B76A]'
      };
    }
    return {
      bg: 'bg-[rgba(255,147,38,0.1)]',
      text: 'text-[rgba(204,119,32,0.99)]',
      dot: 'bg-[#FF9326]'
    };
  };
  
  const colors = getColors();
  
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-2xl ${colors.bg} ${colors.text}`}
      style={{
        paddingLeft: '6px',
        paddingRight: '8px',
        paddingTop: '2px',
        paddingBottom: '2px',
      }}
      role="status"
      aria-label={`Loan status: ${status}`}
    >
      {/* Dot container */}
      <div className="w-2 h-2 flex items-center justify-center" aria-hidden="true">
        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      </div>
      {/* Text */}
      <span className="text-xs font-medium leading-none">
        {status}
      </span>
    </div>
  );
};
