import React from 'react';
import { formatCurrency } from '@/lib/formatCurrency';

export interface StatSection {
  label: string;
  value: string | number;
  change: number;
  changeLabel?: string;
  isCurrency?: boolean;
}

export interface StatisticsCardProps {
  sections: StatSection[];
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({ sections }) => {
  const formatValue = (value: string | number, isCurrency?: boolean): string => {
    if (isCurrency && typeof value === 'number') {
      return formatCurrency(value);
    }
    if (typeof value === 'number') {
      return value.toLocaleString('en-US');
    }
    return value;
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? '#5CC47C' : '#E43535';
  };

  const getChangePrefix = (change: number): string => {
    return change >= 0 ? '+' : '-';
  };

  return (
    <div
      className="bg-white flex flex-col sm:flex-row"
      style={{
        border: '0.5px solid rgba(2, 28, 62, 0.2)',
        borderRadius: '4px',
        boxShadow: '0px 30px 30px rgba(0, 0, 0, 0.04)',
      }}
    >
      {sections.map((section, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <div className="w-full h-px sm:w-px sm:h-auto bg-[#EAECF0]" />
          )}
          <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
            <div
              className="text-xs sm:text-sm font-semibold mb-2"
              style={{
                color: 'var(--color-text-label)',
                opacity: 0.9,
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {section.label}
            </div>
            <div
              className="text-base sm:text-lg font-semibold mb-1"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '0.013em',
              }}
            >
              {formatValue(section.value, section.isCurrency)}
            </div>
            <div
              className="text-xs sm:text-sm"
              style={{
                color: getChangeColor(section.change),
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '0.006em',
              }}
            >
              {getChangePrefix(section.change)}
              {Math.abs(section.change)}% This Month
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
