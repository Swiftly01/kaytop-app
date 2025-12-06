'use client';

import { useRouter } from 'next/navigation';
import BranchDetailsStatistics from '@/app/_components/ui/BranchDetailsStatistics';

// TypeScript Interfaces
interface BranchDetails {
  id: string;
  branchId: string;
  name: string;
  dateCreated: Date;
  region: string;
  statistics: {
    allCOs: {
      value: number;
      change: number;
      changeLabel: string;
    };
    allCustomers: {
      value: number;
      change: number;
      changeLabel: string;
    };
    activeLoans: {
      value: number;
      change: number;
      changeLabel: string;
    };
    loansProcessed: {
      amount: number;
      change: number;
      changeLabel: string;
    };
  };
  creditOfficers: CreditOfficer[];
}

interface CreditOfficer {
  id: string;
  name: string;
  branchName: string;
  status: 'Active' | 'Pending';
  email: string;
  phone: string;
  customers: number;
}

export default function BranchDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard/system-admin/branches');
  };

  // Sample statistics data
  const statisticsData = [
    {
      label: "All CO's",
      value: 42094,
      change: 6,
      changeLabel: '+6% this month'
    },
    {
      label: 'All Customers',
      value: 15350,
      change: 6,
      changeLabel: '+6% this month'
    },
    {
      label: 'Active Loans',
      value: 28350,
      change: -26,
      changeLabel: '-26% this month'
    },
    {
      label: 'Loans Processed',
      value: 50350.00,
      change: 40,
      changeLabel: '+40% this month',
      isCurrency: true
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F4F6FA' }}>
      {/* Page Container - 1440px width */}
      <div className="w-full max-w-[1440px] mx-auto">
        {/* Content starts at x:290px from sidebar */}
        <div className="pl-[290px] pr-8 pt-[110px]">
          {/* Back Button Line Indicator - x:290, y:126 */}
          <div 
            className="absolute cursor-pointer hover:opacity-70 transition-opacity"
            style={{
              left: '290px',
              top: '126px',
              width: '18px',
              height: '2px',
              background: '#000000'
            }}
            onClick={handleBack}
            role="button"
            tabIndex={0}
            aria-label="Go back to branches list"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBack();
              }
            }}
          />

          {/* Page Title - x:290, y:142 */}
          <h1 
            className="font-bold"
            style={{
              fontSize: '24px',
              fontWeight: 700,
              lineHeight: '32px',
              color: '#021C3E',
              marginTop: '16px' // 142 - 126 = 16px from back line
            }}
          >
            Branch Details
          </h1>

          {/* Statistics Card - Position at y:198 (88px from title at y:110) */}
          <div className="mt-[56px]">
            <BranchDetailsStatistics sections={statisticsData} />
          </div>

          {/* Placeholder for remaining content */}
          <p className="mt-8 text-gray-600">
            Branch ID: {params.id}
          </p>
        </div>
      </div>
    </div>
  );
}
