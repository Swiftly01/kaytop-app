import React from 'react';

interface StatusBadgeProps {
  status: 'Active' | 'Scheduled';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isActive = status === 'Active';
  
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-2xl ${
        isActive
          ? 'bg-[#ECFDF3] text-[#027A48]'
          : 'bg-[rgba(255,147,38,0.1)] text-[rgba(204,119,32,0.99)]'
      }`}
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
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isActive ? 'bg-[#12B76A]' : 'bg-[#FF9326]'
          }`}
        />
      </div>
      {/* Text */}
      <span className="text-xs font-medium leading-none">
        {status}
      </span>
    </div>
  );
};
