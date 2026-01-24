import React from 'react';
import { formatCurrency } from '@/lib/formatCurrency';

interface StatSection {
  label: string;
  value: number;
  change: number;
  changeLabel: string;
  isCurrency?: boolean;
}

interface BranchDetailsStatisticsProps {
  sections: StatSection[];
}

export default function BranchDetailsStatistics({ sections }: BranchDetailsStatisticsProps) {
  return (
    <div
      className="w-full bg-white rounded-lg p-6"
      style={{
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section, index) => (
          <div key={index} className="flex flex-col">
            {/* Label */}
            <div
              className="text-sm mb-1"
              style={{
                fontWeight: 600,
                color: '#8B8F96',
                opacity: 0.9
              }}
            >
              {section.label}
            </div>

            {/* Value */}
            <div
              className="mb-1"
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#021C3E'
              }}
            >
              {section.isCurrency ? (
                <>
                  <span className="text-sm" style={{ textDecoration: 'line-through' }}>₦</span>
                  {formatCurrency(section.value).replace('₦', '')}
                </>
              ) : (
                section.value.toLocaleString()
              )}
            </div>

            {/* Change */}
            <div
              className="text-sm"
              style={{
                fontSize: '14px',
                fontWeight: 400,
                color: section.change >= 0 ? '#5CC47C' : '#E43535'
              }}
            >
              {section.changeLabel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
