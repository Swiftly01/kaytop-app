'use client';

import React from 'react';

interface InfoField {
  label: string;
  value: string;
}

interface CreditOfficerInfoCardProps {
  fields: InfoField[];
}

export default function CreditOfficerInfoCard({ fields }: CreditOfficerInfoCardProps) {
  return (
    <div
      className="bg-white rounded-lg p-6"
      style={{
        border: '1px solid var(--color-border-gray-200)',
        boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
      }}
    >
      <div 
        className="grid gap-8"
        style={{
          gridTemplateColumns: 'minmax(120px, 1fr) minmax(100px, 0.8fr) minmax(120px, 1fr) minmax(200px, 2fr) minmax(140px, 1.2fr) minmax(80px, 0.8fr)'
        }}
      >
        {fields.map((field, index) => (
          <div key={index} className="flex flex-col gap-1">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {field.label}
            </span>
            <span 
              className="text-base font-normal" 
              style={{ 
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={field.value}
            >
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
