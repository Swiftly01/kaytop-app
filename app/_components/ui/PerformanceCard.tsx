import React from 'react';
import { DotsVerticalIcon } from '@/app/_components/icons/dots-vertical-icon';
import { formatCurrency } from '@/lib/formatCurrency';

export interface BranchPerformance {
  name: string;
  activeLoans: number;
  amount: number;
}

export interface PerformanceCardProps {
  title: string;
  branches: BranchPerformance[];
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({ 
  title, 
  branches 
}) => {
  return (
    <div
      className="bg-white w-full md:w-[400px]"
      style={{
        minHeight: '312px',
        border: '1px solid #EAECF0',
        borderRadius: '12px',
        boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        padding: '24px',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#101828',
            margin: 0,
          }}
        >
          {title}
        </h3>
        <button
          className="cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={`More options for ${title}`}
        >
          <DotsVerticalIcon color="#667085" />
        </button>
      </div>

      {/* Table */}
      <div>
        {branches.map((branch, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              borderBottom: index < branches.length - 1 ? '1px solid #EAECF0' : 'none',
            }}
          >
            {/* First column: Branch info */}
            <div style={{ width: '250px' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#101828',
                  marginBottom: '4px',
                }}
              >
                {branch.name}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#475467',
                }}
              >
                {branch.activeLoans} active loans
              </div>
            </div>

            {/* Second column: Amount */}
            <div
              style={{
                width: '102px',
                textAlign: 'right',
                fontSize: '14px',
                fontWeight: 400,
                color: '#039855',
              }}
            >
              {formatCurrency(branch.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
