import FilterButton from "@/app/_components/ui/FilterButton";
import StatsCard from "@/app/_components/ui/StatsCard";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <div className="leading-4 text-neutral-700">
          <h1 className="text-2xl font-medium">Overview</h1>
          <p className="text-md opacity-50">Osun state</p>
        </div>

        {/* Stats Cards Row 1 */}
        <div className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white border border-neutral-200/50 rounded-lg">
            <StatsCard
              title="All Branches"
              value="45"
              change="+6% this month"
              isPositive={true}
            />
          </div>
          <div className="p-6 bg-white border border-neutral-200/50 rounded-lg">
            <StatsCard
              title="All CO's"
              value="128"
              change="+6% this month"
              isPositive={true}
            />
          </div>
          <div className="p-6 bg-white border border-neutral-200/50 rounded-lg">
            <StatsCard
              title="All Customers"
              value="2,847"
              change="-26% this month"
              isPositive={false}
            />
          </div>
          <div className="p-6 bg-white border border-neutral-200/50 rounded-lg">
            <StatsCard
              title="Loans Processed"
              value="1,234"
              change="+40% this month"
              isPositive={true}
            />
          </div>
        </div>

        {/* Stats Cards Row 2 */}
        <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-white border border-neutral-200/50 rounded-lg">
            <StatsCard
              title="Loan Amounts"
              value="₦45.2M"
              change="+6% this month"
              isPositive={true}
            />
          </div>
          <div className="p-6 bg-white border border-neutral-200/50 rounded-lg">
            <StatsCard
              title="Active Loans"
              value="892"
              change="+6% this month"
              isPositive={true}
            />
          </div>
          <div className="p-6 bg-white border border-neutral-200/50 rounded-lg">
            <StatsCard
              title="Missed Payments"
              value="34"
              change="+6% this month"
              isPositive={true}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-10">
          <button className="pb-2 text-base font-medium border-b-2 text-brand-purple border-brand-purple">
            Disbursements
          </button>
          <button className="pb-2 text-base font-medium text-neutral-400">
            Re-collections
          </button>
          <button className="pb-2 text-base font-medium text-neutral-400">
            Savings
          </button>
          <button className="pb-2 text-base font-medium text-neutral-400">
            Missed payments
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex flex-wrap items-center gap-1 px-1 py-1 bg-white border rounded-lg shadow-sm border-neutral-200 w-fit">
            <FilterButton active={true}>12 months</FilterButton>
            <FilterButton>30 days</FilterButton>
            <FilterButton>7 days</FilterButton>
            <FilterButton>24 hours</FilterButton>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterButton className="flex gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm border-neutral-200">
              <img src="/calendar.svg" alt="calendar" />
              <span>Select dates</span>
            </FilterButton>
            <FilterButton className="flex gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm border-neutral-200">
              <img src="/filter.svg" alt="filter" />
              <span>Filters</span>
            </FilterButton>
          </div>
        </div>

        {/* Table Placeholder */}
        <div className="p-6 mt-6 mb-10 bg-white border rounded-lg shadow-sm border-neutral-200">
          <h3 className="mb-4 text-lg font-semibold text-neutral-700">
            Recent Disbursements
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr className="border-b border-neutral-200">
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500">
                    Interest Rate
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-neutral-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {[
                  {
                    branch: "Ikeja Branch",
                    status: "Active",
                    rate: "7.25%",
                    amount: "NGN87,000",
                    date: "June 03, 2024",
                  },
                  {
                    branch: "Lekki Branch",
                    status: "Active",
                    rate: "6.50%",
                    amount: "NGN55,000",
                    date: "Dec 24, 2023",
                  },
                  {
                    branch: "Surulere Branch",
                    status: "Pending",
                    rate: "8.00%",
                    amount: "NGN92,000",
                    date: "Nov 11, 2024",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
                      {row.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          row.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
                      {row.rate}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
                      {row.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
