import React from 'react';

interface InfoField {
  label: string;
  value: string;
}

interface BranchInfoCardProps {
  fields: InfoField[];
}

export default function BranchInfoCard({ fields }: BranchInfoCardProps) {
  return (
    <div
      className="w-full bg-white rounded-lg p-6"
      style={{
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Responsive grid layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {fields.map((field, index) => (
          <div key={index} className="flex flex-col gap-1">
            {/* Label */}
            <div 
              className="text-sm"
              style={{
                fontWeight: 400,
                lineHeight: '140%',
                color: '#7C8FAC'
              }}
            >
              {field.label}
            </div>

            {/* Value */}
            <div 
              className="text-base text-gray-900"
              style={{
                fontWeight: 400,
                lineHeight: '120%',
                color: '#1E3146'
              }}
            >
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
