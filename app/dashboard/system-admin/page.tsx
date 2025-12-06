'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { StatisticsCard } from "@/app/_components/ui/StatisticsCard";
import { PerformanceCard } from "@/app/_components/ui/PerformanceCard";
import FilterControls from "@/app/_components/ui/FilterControls";
import TabNavigation from "@/app/_components/ui/TabNavigation";
import Table from "@/app/_components/ui/Table";

type TabValue = 'disbursements' | 're-collections' | 'savings' | 'missed-payments';

export default function SystemAdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timePeriod, setTimePeriod] = useState<string | null>('12months');
  const [activeTab, setActiveTab] = useState<TabValue>('disbursements');

  // Handler for date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log('Dashboard filtering by date range:', range);
    // TODO: Fetch filtered data from backend API based on date range
    // Example: fetchDashboardData(range?.from, range?.to)
  };

  // Handler for time period changes
  const handleTimePeriodChange = (period: string | null) => {
    setTimePeriod(period);
    console.log('Dashboard filtering by time period:', period);
    // TODO: Fetch filtered data from backend API based on time period
    // Example: fetchDashboardData(period)
  };

  // Handler for filter button click
  const handleFilterClick = () => {
    console.log('Filter button clicked - opening advanced filters');
    // TODO: Implement advanced filter modal/panel
    // This could include filters for:
    // - Branch selection
    // - Credit officer selection
    // - Loan status
    // - Amount ranges
    // - etc.
  };

  // Handler for tab changes
  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    console.log('Active tab changed to:', tab);
    // TODO: Fetch data for the selected tab from backend API
    // Example: fetchTabData(tab)
  };

  /* 
   * BACKEND INTEGRATION GUIDE:
   * ===========================
   * 
   * This dashboard is now set up for dynamic data filtering based on date ranges.
   * When a user selects a date range or time period and clicks "Apply", the 
   * handleDateRangeChange or handleTimePeriodChange functions are called.
   * 
   * TO COMPLETE THE INTEGRATION:
   * 
   * 1. Convert the static data arrays below to useState hooks:
   *    const [topCardSections, setTopCardSections] = useState([...]);
   *    const [middleCardSections, setMiddleCardSections] = useState([...]);
   *    const [bestPerformingBranches, setBestPerformingBranches] = useState([...]);
   *    const [worstPerformingBranches, setWorstPerformingBranches] = useState([...]);
   * 
   * 2. Create an API endpoint that accepts date range parameters:
   *    GET /api/dashboard/overview?startDate=2024-01-01&endDate=2024-01-31
   * 
   * 3. In handleDateRangeChange, call your API:
   *    const response = await fetch(`/api/dashboard/overview?startDate=${range?.from}&endDate=${range?.to}`);
   *    const data = await response.json();
   *    setTopCardSections(data.statistics.top);
   *    setMiddleCardSections(data.statistics.middle);
   *    setBestPerformingBranches(data.performance.best);
   *    setWorstPerformingBranches(data.performance.worst);
   * 
   * 4. The Table component should also be updated to accept filtered data as props
   * 
   * 5. Add loading states while fetching data
   */

  // Top statistics card data (4 sections)
  const topCardSections = [
    {
      label: "All Branches",
      value: 42094,
      change: 8,
    },
    {
      label: "All CO's",
      value: 15350,
      change: -8,
    },
    {
      label: "All Customers",
      value: 28350,
      change: -26,
    },
    {
      label: "Loans Processed",
      value: 50350.0,
      change: -10,
      isCurrency: true,
    },
  ];

  // Middle statistics card data (3 sections)
  const middleCardSections = [
    {
      label: "Loan Amounts",
      value: 42094,
      change: 8,
    },
    {
      label: "Active Loans",
      value: 15350,
      change: -6,
    },
    {
      label: "Missed Payments",
      value: 15350,
      change: 6,
    },
  ];

  // Best performing branches data
  const bestPerformingBranches = [
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
  ];

  // Worst performing branches data
  const worstPerformingBranches = [
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
    {
      name: "Igando Branch",
      activeLoans: 10,
      amount: 64240.60,
    },
  ];

  // Tab data structures
  // TODO: Replace with actual API data fetching based on activeTab
  const tabData = {
    disbursements: [
      { id: '1', loanId: '43756', name: 'Ademola Jumoke', status: 'Active' as const, interest: '7.25%', amount: 'NGN87,000', dateDisbursed: '2024-06-03' },
      { id: '2', loanId: '45173', name: 'Adegboyoga Precious', status: 'Active' as const, interest: '6.50%', amount: 'NGN55,000', dateDisbursed: '2023-12-24' },
      { id: '3', loanId: '70668', name: 'Nneka Chukwu', status: 'Scheduled' as const, interest: '8.00%', amount: 'NGN92,000', dateDisbursed: '2024-11-11' },
      { id: '4', loanId: '87174', name: 'Damilare Usman', status: 'Active' as const, interest: '7.75%', amount: 'NGN68,000', dateDisbursed: '2024-02-02' },
      { id: '5', loanId: '89636', name: 'Jide Kosoko', status: 'Active' as const, interest: '7.00%', amount: 'NGN79,000', dateDisbursed: '2023-08-18' },
      { id: '6', loanId: '97174', name: 'Oladejo israel', status: 'Active' as const, interest: '6.75%', amount: 'NGN46,000', dateDisbursed: '2024-09-09' },
      { id: '7', loanId: '22739', name: 'Eze Chinedu', status: 'Active' as const, interest: '8.25%', amount: 'NGN61,000', dateDisbursed: '2023-07-27' },
      { id: '8', loanId: '22739', name: 'Adebanji Bolaji', status: 'Active' as const, interest: '7.50%', amount: 'NGN73,000', dateDisbursed: '2024-04-05' },
      { id: '9', loanId: '48755', name: 'Baba Kaothat', status: 'Active' as const, interest: '6.25%', amount: 'NGN62,000', dateDisbursed: '2023-10-14' },
      { id: '10', loanId: '30635', name: 'Adebayo Salami', status: 'Active' as const, interest: '7.10%', amount: 'NGN84,000', dateDisbursed: '2024-03-22' },
    ],
    're-collections': [
      { id: '11', loanId: '43756', name: 'Ademola Jumoke', status: 'Active' as const, amount: 'NGN87,000', dateDisbursed: '2024-06-03' },
      { id: '12', loanId: '43178', name: 'Adegboyoga Precious', status: 'Active' as const, amount: 'NGN55,000', dateDisbursed: '2023-12-24' },
      { id: '13', loanId: '70668', name: 'Nneka Chukwu', status: 'Scheduled' as const, amount: 'NGN92,000', dateDisbursed: '2024-11-11' },
      { id: '14', loanId: '97174', name: 'Damilare Usman', status: 'Active' as const, amount: 'NGN68,000', dateDisbursed: '2024-02-02' },
      { id: '15', loanId: '39635', name: 'Jide Kosoko', status: 'Active' as const, amount: 'NGN79,000', dateDisbursed: '2023-08-18' },
      { id: '16', loanId: '97174', name: 'Oladejo israel', status: 'Active' as const, amount: 'NGN46,000', dateDisbursed: '2024-09-09' },
      { id: '17', loanId: '22739', name: 'Eze Chinedu', status: 'Active' as const, amount: 'NGN61,000', dateDisbursed: '2023-07-27' },
      { id: '18', loanId: '22739', name: 'Adebanji Bolaji', status: 'Active' as const, amount: 'NGN73,000', dateDisbursed: '2024-04-05' },
      { id: '19', loanId: '43756', name: 'Baba Kaothat', status: 'Active' as const, amount: 'NGN52,000', dateDisbursed: '2023-10-14' },
      { id: '20', loanId: '39635', name: 'Adebayo Salami', status: 'Active' as const, amount: 'NGN84,000', dateDisbursed: '2024-03-22' },
    ],
    savings: [
      { id: '21', loanId: '43756', name: 'Ademola Jumoke', type: 'Savings' as const, amount: 'NGN87,000', dateDisbursed: '2024-06-03' },
      { id: '22', loanId: '43178', name: 'Adegboyoga Precious', type: 'Savings' as const, amount: 'NGN55,000', dateDisbursed: '2023-12-24' },
      { id: '23', loanId: '70668', name: 'Nneka Chukwu', type: 'Savings' as const, amount: 'NGN92,000', dateDisbursed: '2024-11-11' },
      { id: '24', loanId: '97174', name: 'Damilare Usman', type: 'Savings' as const, amount: 'NGN68,000', dateDisbursed: '2024-02-02' },
      { id: '25', loanId: '39635', name: 'Jide Kosoko', type: 'Savings' as const, amount: 'NGN79,000', dateDisbursed: '2023-08-18' },
      { id: '26', loanId: '97174', name: 'Oladejo israel', type: 'Savings' as const, amount: 'NGN46,000', dateDisbursed: '2024-09-09' },
      { id: '27', loanId: '22739', name: 'Eze Chinedu', type: 'Savings' as const, amount: 'NGN61,000', dateDisbursed: '2023-07-27' },
      { id: '28', loanId: '22739', name: 'Adebanji Bolaji', type: 'Savings' as const, amount: 'NGN73,000', dateDisbursed: '2024-04-05' },
      { id: '29', loanId: '43756', name: 'Baba Kaothat', type: 'Savings' as const, amount: 'NGN52,000', dateDisbursed: '2023-10-14' },
      { id: '30', loanId: '39635', name: 'Adebayo Salami', type: 'Savings' as const, amount: 'NGN84,000', dateDisbursed: '2024-03-22' },
    ],
    'missed-payments': [
      { id: '31', loanId: '43756', name: 'Ademola Jumoke', status: 'Active' as const, interest: '7.25%', amount: 'NGN87,000', dateDisbursed: '2024-06-03' },
      { id: '32', loanId: '43178', name: 'Adegboyoga Precious', status: 'Active' as const, interest: '6.50%', amount: 'NGN55,000', dateDisbursed: '2023-12-24' },
      { id: '33', loanId: '70668', name: 'Nneka Chukwu', status: 'Scheduled' as const, interest: '8.00%', amount: 'NGN92,000', dateDisbursed: '2024-11-11' },
      { id: '34', loanId: '97174', name: 'Damilare Usman', status: 'Active' as const, interest: '7.75%', amount: 'NGN68,000', dateDisbursed: '2024-02-02' },
      { id: '35', loanId: '39635', name: 'Jide Kosoko', status: 'Active' as const, interest: '7.00%', amount: 'NGN79,000', dateDisbursed: '2023-08-18' },
      { id: '36', loanId: '97174', name: 'Oladejo israel', status: 'Active' as const, interest: '6.75%', amount: 'NGN46,000', dateDisbursed: '2024-09-09' },
      { id: '37', loanId: '22739', name: 'Eze Chinedu', status: 'Active' as const, interest: '8.25%', amount: 'NGN61,000', dateDisbursed: '2023-07-27' },
      { id: '38', loanId: '22739', name: 'Adebanji Bolaji', status: 'Active' as const, interest: '7.50%', amount: 'NGN73,000', dateDisbursed: '2024-04-05' },
      { id: '39', loanId: '43756', name: 'Baba Kaothat', status: 'Active' as const, interest: '6.25%', amount: 'NGN52,000', dateDisbursed: '2023-10-14' },
      { id: '40', loanId: '39635', name: 'Adebayo Salami', status: 'Active' as const, interest: '7.10%', amount: 'NGN84,000', dateDisbursed: '2024-03-22' },
    ],
  };

  // Get current tab data
  const currentTabData = tabData[activeTab];

  return (
    <div className="drawer-content flex flex-col min-h-screen">
      <main className="flex-1 pl-[58px] pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          {/* Page Header - Position: y:110px (Overview), y:150px (Osun state) */}
          <header>
            <h1 className="text-2xl font-bold text-[#021C3E]" style={{ marginBottom: '8px' }}>Overview</h1>
            <p className="text-base font-medium text-[#021C3E] opacity-50" style={{ marginBottom: '48px' }}>
              Osun state
            </p>
          </header>

          {/* Filter Controls - Position: y:198px */}
          <div style={{ marginBottom: '56px' }}>
            <FilterControls 
              selectedPeriod={timePeriod as '12months' | '30days' | '7days' | '24hours' | null}
              onDateRangeChange={handleDateRangeChange}
              onPeriodChange={handleTimePeriodChange}
              onFilter={handleFilterClick}
            />
          </div>

          {/* Statistics Section - First card at y:254px */}
          <section className="space-y-4 sm:space-y-6" aria-label="Dashboard statistics">
            {/* Top Statistics Card - 4 sections */}
            <div className="w-full max-w-[1091px]">
              <StatisticsCard sections={topCardSections} />
            </div>

            {/* Middle Statistics Card - 3 sections */}
            <div className="w-full max-w-[833px]">
              <StatisticsCard sections={middleCardSections} />
            </div>

            {/* Performance Cards */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 mt-6 sm:mt-8">
              {/* Card 3 - Top 3 Best performing branch */}
              <PerformanceCard
                title="Top 3 Best performing branch"
                branches={bestPerformingBranches}
              />

              {/* Card 4 - Top 3 worst performing branch */}
              <PerformanceCard
                title="Top 3 worst performing branch"
                branches={worstPerformingBranches}
              />
            </div>
          </section>

          {/* Tab Navigation */}
          <div className="mt-8">
            <TabNavigation 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Data Table - Card 5 */}
          <section 
            className="mt-6"
            role="tabpanel"
            id={`${activeTab}-panel`}
            aria-labelledby={`${activeTab}-tab`}
          >
            <Table data={currentTabData} tableType={activeTab} />
          </section>
        </div>
      </main>
    </div>
  );
}
