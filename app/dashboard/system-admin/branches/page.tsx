'use client';

import React, { useState } from 'react';
import FilterControls from '@/app/_components/ui/FilterControls';
import { StatisticsCard, StatSection } from '@/app/_components/ui/StatisticsCard';
import Table, { BranchRecord } from '@/app/_components/ui/Table';
import CreateBranchModal from '@/app/_components/ui/CreateBranchModal';
import { DateRange } from 'react-day-picker';

type TimePeriod = '12months' | '30days' | '7days' | '24hours' | null;

interface BranchFormData {
  branchName: string;
  stateRegion: string;
  assignUsers: string;
}

// Branch statistics data
const branchStatistics: StatSection[] = [
  {
    label: 'All Branches',
    value: 42094,
    change: 6,
  },
  {
    label: "All CO's",
    value: 15350,
    change: 6,
  },
  {
    label: 'All Customers',
    value: 28350,
    change: -26,
  },
  {
    label: 'Active Loans',
    value: 50350.00,
    change: 40,
    isCurrency: true,
  },
];

// Branch table data - 10 records as specified in requirements
const branchData: BranchRecord[] = [
  { 
    id: '1', 
    branchId: 'ID: 43756', 
    name: 'Ademola Jumoke', 
    cos: '23', 
    customers: 38, 
    dateCreated: '2024-06-03' 
  },
  { 
    id: '2', 
    branchId: 'ID: 43178', 
    name: 'Adegboyoga Precious', 
    cos: '23', 
    customers: 77, 
    dateCreated: '2023-12-24' 
  },
  { 
    id: '3', 
    branchId: 'ID: 70668', 
    name: 'Nneka Chukwu', 
    cos: '23', 
    customers: 12, 
    dateCreated: '2024-11-11' 
  },
  { 
    id: '4', 
    branchId: 'ID: 97174', 
    name: 'Damilare Usman', 
    cos: '23', 
    customers: 64, 
    dateCreated: '2024-02-02' 
  },
  { 
    id: '5', 
    branchId: 'ID: 39635', 
    name: 'Jide Kosoko', 
    cos: '23', 
    customers: 29, 
    dateCreated: '2023-08-18' 
  },
  { 
    id: '6', 
    branchId: 'ID: 97174', 
    name: 'Oladejo Israel', 
    cos: '23', 
    customers: 85, 
    dateCreated: '2024-09-09' 
  },
  { 
    id: '7', 
    branchId: 'ID: 22739', 
    name: 'Eze Chinedu', 
    cos: '23%', 
    customers: 51, 
    dateCreated: '2023-07-27' 
  },
  { 
    id: '8', 
    branchId: 'ID: 22739', 
    name: 'Adebanji Bolaji', 
    cos: '95%', 
    customers: 99, 
    dateCreated: '2024-04-05' 
  },
  { 
    id: '9', 
    branchId: 'ID: 43756', 
    name: 'Baba Kaothat', 
    cos: '42%', 
    customers: 44, 
    dateCreated: '2023-10-14' 
  },
  { 
    id: '10', 
    branchId: 'ID: 39635', 
    name: 'Adebayo Salami', 
    cos: '58%', 
    customers: 72, 
    dateCreated: '2024-03-22' 
  },
];

export default function BranchesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('12months');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateBranch = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = (data: BranchFormData) => {
    console.log('Branch created:', data);
    // TODO: Add API call to create branch
    // TODO: Refresh branch list
    // TODO: Show success notification
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    console.log('Time period changed:', period);
    // TODO: Filter data based on period
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log('Date range changed:', range);
    // TODO: Filter data based on date range
  };

  const handleFilterClick = () => {
    console.log('Filters clicked');
    // TODO: Open advanced filters modal
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedBranches(selectedIds);
    console.log('Selected branches:', selectedIds);
  };

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1">
        <div className="max-w-[1440px] mx-auto">
          <div className="px-4 sm:px-6 lg:px-[58px]">
            {/* Page Header with Create Button */}
            <div className="pt-6 sm:pt-8 lg:pt-10 mb-8 sm:mb-10 lg:mb-12 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <h1 className="text-[20px] sm:text-[22px] lg:text-[24px] font-bold leading-[28px] sm:leading-[30px] lg:leading-[32px] text-[#021C3E]">
                  Overview
                </h1>
                <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-[20px] sm:leading-[22px] lg:leading-[24px] text-[#021C3E] opacity-50 mt-2">
                  Osun state
                </p>
              </div>

              {/* Create New Branch Button - responsive width */}
              <button
                onClick={handleCreateBranch}
                className="w-full sm:w-auto sm:min-w-[200px] lg:w-[265px] h-[44px] px-[18px] py-[10px] bg-[#7F56D9] text-white text-[14px] sm:text-[15px] lg:text-[16px] font-semibold leading-[24px] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-[#6941C6] transition-colors duration-200"
                aria-label="Create new branch"
              >
                Create new branch
              </button>
            </div>

            {/* Filter Controls - responsive */}
            <div className="mb-6 sm:mb-7 lg:mb-8">
              <FilterControls
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
                onDateRangeChange={handleDateRangeChange}
                onFilter={handleFilterClick}
              />
            </div>

            {/* Statistics Card - responsive */}
            <div className="mb-8 sm:mb-10 lg:mb-12 max-w-[1091px]">
              <StatisticsCard sections={branchStatistics} />
            </div>

            {/* Branches Section Title */}
            <div className="mb-4 sm:mb-5 lg:mb-6 pl-0 sm:pl-2 lg:pl-4">
              <h2 className="text-[16px] sm:text-[17px] lg:text-[18px] font-semibold leading-[24px] sm:leading-[26px] lg:leading-[28px] text-[#101828]">
                Branches
              </h2>
            </div>

            {/* Branches Table - responsive with horizontal scroll on mobile */}
            <div className="max-w-[1041px] overflow-x-auto">
              <Table 
                data={branchData} 
                tableType="branches"
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Create Branch Modal */}
      <CreateBranchModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
