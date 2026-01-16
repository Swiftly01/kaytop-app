'use client';

import React from 'react';

interface CreditOfficerTabsProps {
  activeTab: 'collections' | 'loans-disbursed';
  onTabChange: (tab: 'collections' | 'loans-disbursed') => void;
}

export default function CreditOfficerTabs({ activeTab, onTabChange }: CreditOfficerTabsProps) {
  return (
    <div className="flex items-center gap-6 mb-6">
      <button
        className={`text-base font-medium pb-2 border-b-2 transition-colors ${
          activeTab === 'collections'
            ? 'text-purple-600 border-purple-600'
            : 'text-gray-500 border-transparent hover:text-gray-700'
        }`}
        onClick={() => onTabChange('collections')}
        role="tab"
        aria-selected={activeTab === 'collections'}
        aria-controls="collections-panel"
        id="collections-tab"
      >
        Collections
      </button>
      <button
        className={`text-base font-medium pb-2 border-b-2 transition-colors ${
          activeTab === 'loans-disbursed'
            ? 'text-purple-600 border-purple-600'
            : 'text-gray-500 border-transparent hover:text-gray-700'
        }`}
        onClick={() => onTabChange('loans-disbursed')}
        role="tab"
        aria-selected={activeTab === 'loans-disbursed'}
        aria-controls="loans-disbursed-panel"
        id="loans-disbursed-tab"
      >
        Loans disbursed
      </button>
    </div>
  );
}
