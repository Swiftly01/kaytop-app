'use client';

import { useState } from 'react';

type TabValue = 'credit-officers' | 'reports' | 'missed-reports';

interface BranchDetailsTabsProps {
  activeTab?: TabValue;
  onTabChange?: (tab: TabValue) => void;
}

export default function BranchDetailsTabs({
  activeTab: controlledActiveTab,
  onTabChange,
}: BranchDetailsTabsProps) {
  const [internalTab, setInternalTab] = useState<TabValue>('credit-officers');
  
  // Use controlled activeTab if provided, otherwise use internal state
  const currentTab = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;

  const handleTabClick = (tab: TabValue) => {
    // Update internal state if not controlled
    if (controlledActiveTab === undefined) {
      setInternalTab(tab);
    }
    // Always call the callback if provided
    onTabChange?.(tab);
  };

  const tabs: { value: TabValue; label: string; width: string }[] = [
    { value: 'credit-officers', label: 'Credit Officers', width: '116px' },
    { value: 'reports', label: 'Reports', width: '63px' },
    { value: 'missed-reports', label: 'Missed Reports', width: '124px' },
  ];

  return (
    <nav className="border-b border-gray-200" aria-label="Branch details tabs">
      <div className="flex gap-8" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`
              pb-4 px-1 border-b-2 transition-colors
              focus:outline-none
              ${currentTab === tab.value 
                ? 'border-[#7F56D9] text-[#7F56D9]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            style={{
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '16px'
            }}
            role="tab"
            aria-selected={currentTab === tab.value}
            aria-controls={`${tab.value}-panel`}
            id={`${tab.value}-tab`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
