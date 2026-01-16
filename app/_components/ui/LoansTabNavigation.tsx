'use client';

/**
 * LoansTabNavigation Component
 * Tab navigation specifically for the Loans page
 */

interface Tab {
  id: string;
  label: string;
}

interface LoansTabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function LoansTabNavigation({
  tabs,
  activeTab,
  onTabChange
}: LoansTabNavigationProps) {
  return (
    <nav className="relative" aria-label="Loans filter tabs">
      <div className="flex items-center gap-6" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative font-medium transition-colors duration-200 whitespace-nowrap pb-3
              focus:outline-none
              ${activeTab === tab.id 
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
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
          >
            {tab.label}
            
            {activeTab === tab.id && (
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
