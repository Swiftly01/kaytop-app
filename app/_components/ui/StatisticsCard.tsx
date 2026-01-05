import React from 'react';
import { formatCurrency } from '@/lib/formatCurrency';
import { extractValue } from '@/lib/utils/dataExtraction';

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
  // Safety check - ensure sections is an array
  if (!Array.isArray(sections)) {
    console.error('StatisticsCard: sections prop is not an array:', sections);
    return (
      <div className="bg-white p-6 rounded-lg border">
        <p className="text-red-500">Error: Invalid data format</p>
      </div>
    );
  }

  const formatValue = (value: string | number, isCurrency?: boolean): string => {
    // Use extractValue to handle nested objects
    const safeValue = extractValue(value, 0);
    
    if (safeValue === null || safeValue === undefined) {
      return '0';
    }
    
    if (isCurrency && typeof safeValue === 'number') {
      return formatCurrency(safeValue);
    }
    if (typeof safeValue === 'number') {
      return safeValue.toLocaleString('en-US');
    }
    return String(safeValue);
  };

  const getChangeColor = (change: number): string => {
    const safeChange = extractValue(change, 0);
    return safeChange >= 0 ? '#5CC47C' : '#E43535';
  };

  const getChangePrefix = (change: number): string => {
    const safeChange = extractValue(change, 0);
    return safeChange >= 0 ? '+' : '-';
  };

  const getChangeValue = (change: number): number => {
    return Math.abs(extractValue(change, 0));
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
              {String(extractValue(section.label, 'Unknown'))}
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
              {formatValue(section.value, extractValue(section.isCurrency, false))}
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
              {getChangeValue(section.change)}% This Month
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
