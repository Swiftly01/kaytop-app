'use client';

import { useState } from 'react';

type TabValue = 'disbursements' | 're-collections' | 'savings' | 'missed-payments';

interface TabNavigationProps {
  activeTab?: TabValue;
  onTabChange?: (tab: TabValue) => void;
}

export default function TabNavigation({
  activeTab: controlledActiveTab,
  onTabChange,
}: TabNavigationProps) {
  const [internalTab, setInternalTab] = useState<TabValue>('disbursements');
  
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

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'disbursements', label: 'Disbursements' },
    { value: 're-collections', label: 'Re-collections' },
    { value: 'savings', label: 'Savings' },
    { value: 'missed-payments', label: 'Missed payments' },
  ];

  return (
    <nav className="relative" aria-label="Data table tabs">
      {/* Tab Container */}
      <div className="flex items-center gap-6" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`
              relative font-medium transition-colors duration-200 whitespace-nowrap pb-3
              focus:outline-none
              ${currentTab === tab.value 
                ? 'text-[#7F56D9]' 
                : 'text-[#ABAFB3] hover:text-[#888F9B]'
              }
            `}
            style={{
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '24px',
            }}
            role="tab"
            aria-selected={currentTab === tab.value}
            aria-controls={`${tab.value}-panel`}
            id={`${tab.value}-tab`}
          >
            {tab.label}
            
            {/* Active Indicator - Bottom Underline */}
            {currentTab === tab.value && (
              <span
                className="absolute left-0 right-0 bottom-0 mx-auto"
                style={{
                  width: '99px',
                  height: '2px',
                  backgroundColor: '#7F56D9',
                  borderRadius: '20px',
                  display: 'block',
                }}
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
