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
      className="relative"
      style={{
        width: '1091px',
        height: '119px',
        background: '#FFFFFF',
        border: '0.5px solid rgba(2, 28, 62, 0.2)',
        borderRadius: '4px',
        boxShadow: '0px 46px 46px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Statistics Content */}
      <div className="flex items-center h-full px-16">
        {sections.map((section, index) => (
          <React.Fragment key={index}>
            {/* Stat Section */}
            <div className="flex flex-col" style={{ minWidth: '200px' }}>
              {/* Label */}
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '20px',
                  color: '#8B8F96',
                  opacity: 0.9,
                  letterSpacing: '0.006em'
                }}
              >
                {section.label}
              </div>

              {/* Value */}
              <div
                className="mt-1"
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#021C3E',
                  letterSpacing: '0.013em'
                }}
              >
                {section.isCurrency ? (
                  <>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        textDecoration: 'line-through',
                        marginRight: '4px'
                      }}
                    >
                      ₦
                    </span>
                    {formatCurrency(section.value).replace('₦', '')}
                  </>
                ) : (
                  section.value.toLocaleString()
                )}
              </div>

              {/* Change */}
              <div
                className="mt-0.5"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: section.change >= 0 ? '#5CC47C' : '#E43535',
                  letterSpacing: '0.006em'
                }}
              >
                {section.changeLabel}
              </div>
            </div>

            {/* Vertical Divider */}
            {index < sections.length - 1 && (
              <div
                className="mx-8"
                style={{
                  width: '0.5px',
                  height: '91px',
                  background: '#000000',
                  opacity: 0.2
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
