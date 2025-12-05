"use client";
import FilterButton from "@/app/_components/ui/FilterButton";
import StatsCard from "@/app/_components/ui/StatsCard";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="h-full px-5 pt-4 mx-auto" style={{ maxWidth: "1091px" }}>
        <div className="text-[#021C3E]">
          <h1 className="text-2xl font-bold leading-[1.33]">Overview</h1>
          <p className="text-base font-medium leading-4 opacity-50">Osun state</p>
        </div>

        {/* Stats Cards Row 1 - Exact Figma spacing with interactivity */}
        <div className="relative mt-[60px]">
          <div className="absolute inset-0 bg-black/[0.04] blur-[60px] rounded-lg" style={{ top: "73px", height: "46px", width: "666px", left: "70px" }} />
          <div className="relative bg-white border border-[rgba(2,28,62,0.2)] rounded-[4px] p-3 hover:shadow-lg transition-shadow duration-300">
            <div className="grid grid-cols-4 gap-0">
              <div className="px-[63px] py-3 border-r border-black/20 hover:bg-[#F9FAFB] transition-colors duration-200 cursor-pointer">
                <StatsCard
                  title="All Branches"
                  value="45"
                  change="+6% this month"
                  isPositive={true}
                />
              </div>
              <div className="px-[63px] py-3 border-r border-black/20 hover:bg-[#F9FAFB] transition-colors duration-200 cursor-pointer">
                <StatsCard
                  title="All CO's"
                  value="128"
                  change="+6% this month"
                  isPositive={true}
                />
              </div>
              <div className="px-[63px] py-3 border-r border-black/20 hover:bg-[#F9FAFB] transition-colors duration-200 cursor-pointer">
                <StatsCard
                  title="All Customers"
                  value="2,847"
                  change="-26% this month"
                  isPositive={false}
                />
              </div>
              <div className="px-[63px] py-3 hover:bg-[#F9FAFB] transition-colors duration-200 cursor-pointer">
                <StatsCard
                  title="Loans Processed"
                  value="1,234"
                  change="+40% this month"
                  isPositive={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Row 2 - Exact Figma spacing with interactivity */}
        <div className="relative mt-[16px]">
          <div className="absolute inset-0 bg-black/[0.04] blur-[60px] rounded-lg" style={{ top: "73px", height: "46px", width: "494px", left: "70px" }} />
          <div className="relative bg-white border border-[rgba(2,28,62,0.2)] rounded-[4px] p-3 hover:shadow-lg transition-shadow duration-300">
            <div className="grid grid-cols-3 gap-0">
              <div className="px-[63px] py-3 border-r border-black/20 hover:bg-[#F9FAFB] transition-colors duration-200 cursor-pointer">
                <StatsCard
                  title="Loan Amounts"
                  value="₦45.2M"
                  change="+6% this month"
                  isPositive={true}
                />
              </div>
              <div className="px-[63px] py-3 border-r border-black/20 hover:bg-[#F9FAFB] transition-colors duration-200 cursor-pointer">
                <StatsCard
                  title="Active Loans"
                  value="892"
                  change="+6% this month"
                  isPositive={true}
                />
              </div>
              <div className="px-[63px] py-3 hover:bg-[#F9FAFB] transition-colors duration-200 cursor-pointer">
                <StatsCard
                  title="Missed Payments"
                  value="34"
                  change="+6% this month"
                  isPositive={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Exact Figma styling with interactivity */}
        <div className="flex items-center gap-6 mt-[182px]">
          <div className="relative">
            <button className="text-base font-medium leading-4 text-[#7F56D9] transition-colors duration-200">
              Disbursements
            </button>
            <div className="absolute bottom-0 left-0 w-[99px] h-[2px] bg-[#7F56D9] rounded-[20px]" style={{ transform: "translateY(8px)" }} />
          </div>
          <button className="text-base font-medium leading-4 text-[#ABAFB3] hover:text-[#7F56D9] transition-colors duration-200">
            Re-collections
          </button>
          <button className="text-base font-medium leading-4 text-[#ABAFB3] hover:text-[#7F56D9] transition-colors duration-200">
            Savings
          </button>
          <button className="text-base font-medium leading-4 text-[#ABAFB3] hover:text-[#7F56D9] transition-colors duration-200">
            Missed payments
          </button>
        </div>

        {/* Filters - Exact Figma styling with interactivity */}
        <div className="flex items-center justify-between mt-[28px]">
          <div className="flex items-center border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
            <button className="px-4 py-[10px] text-sm font-semibold leading-[1.43] text-[#1D2939] bg-[#F9FAFB] border-r border-[#D0D5DD] rounded-l-lg transition-all duration-200">
              12 months
            </button>
            <button className="px-4 py-[10px] text-sm font-semibold leading-[1.43] text-[#344054] bg-white hover:bg-[#F9FAFB] border-r border-[#D0D5DD] transition-all duration-200">
              30 days
            </button>
            <button className="px-4 py-[10px] text-sm font-semibold leading-[1.43] text-[#344054] bg-white hover:bg-[#F9FAFB] border-r border-[#D0D5DD] transition-all duration-200">
              7 days
            </button>
            <button className="px-4 py-[10px] text-sm font-semibold leading-[1.43] text-[#344054] bg-white hover:bg-[#F9FAFB] rounded-r-lg transition-all duration-200">
              24 hours
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-[10px] text-sm font-semibold leading-[1.43] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#F9FAFB] hover:border-[#7F56D9] transition-all duration-200">
              <img src="/calendar.svg" alt="calendar" className="w-5 h-5" />
              <span>Select dates</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-[10px] text-sm font-semibold leading-[1.43] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#F9FAFB] hover:border-[#7F56D9] transition-all duration-200">
              <img src="/filter.svg" alt="filter" className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Table - Exact Figma styling */}
        <div className="mt-[32px] mb-10 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                    <th className="px-6 py-3 text-left">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#D0D5DD]" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      BRANCH
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      INTEREST RATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      AMOUNT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      DATE
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
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
                    {
                      branch: "Victoria Island",
                      status: "Active",
                      rate: "7.75%",
                      amount: "NGN68,000",
                      date: "Feb 02, 2024",
                    },
                    {
                      branch: "Yaba Branch",
                      status: "Active",
                      rate: "7.00%",
                      amount: "NGN79,000",
                      date: "Aug 18, 2023",
                    },
                    {
                      branch: "Ajah Branch",
                      status: "Active",
                      rate: "6.75%",
                      amount: "NGN46,000",
                      date: "Sept 09, 2024",
                    },
                    {
                      branch: "Ikoyi Branch",
                      status: "Active",
                      rate: "8.25%",
                      amount: "NGN61,000",
                      date: "July 27, 2023",
                    },
                    {
                      branch: "Festac Branch",
                      status: "Active",
                      rate: "7.50%",
                      amount: "NGN73,000",
                      date: "April 05, 2024",
                    },
                    {
                      branch: "Gbagada Branch",
                      status: "Active",
                      rate: "6.25%",
                      amount: "NGN52,000",
                      date: "Oct 14, 2023",
                    },
                    {
                      branch: "Apapa Branch",
                      status: "Active",
                      rate: "7.10%",
                      amount: "NGN84,000",
                      date: "March 22, 2024",
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-[#EAECF0] last:border-b-0 hover:bg-[#F9FAFB] transition-colors duration-150 cursor-pointer">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="w-4 h-4 rounded border-[#D0D5DD] cursor-pointer hover:border-[#7F56D9] transition-colors duration-200" />
                      </td>
                      <td className="px-6 py-4 text-sm font-normal leading-[1.43] text-[#475467]">
                        {row.branch}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium leading-[1.43] rounded-2xl ${
                            row.status === "Active"
                              ? "bg-[#ECFDF3] text-[#027A48]"
                              : "bg-[rgba(255,147,38,0.1)] text-[#FF9326]"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            row.status === "Active" ? "bg-[#12B76A]" : "bg-[#FF9326]"
                          }`} />
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-normal leading-[1.43] text-[#475467]">
                        {row.rate}
                      </td>
                      <td className="px-6 py-4 text-sm font-normal leading-[1.43] text-[#475467]">
                        {row.amount}
                      </td>
                      <td className="px-6 py-4 text-sm font-normal leading-[1.43] text-[#475467]">
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
    </div>
  );
}
