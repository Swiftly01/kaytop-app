"use client";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="h-full px-5 pt-4 mx-auto" style={{ maxWidth: "1091px" }}>
        <div className="flex items-center justify-between text-[#021C3E]">
          <div>
            <h1 className="text-2xl font-bold leading-[1.33]">Credit Officers</h1>
            <p className="text-base font-medium leading-4 opacity-50">Manage credit officers</p>
          </div>
          <button className="px-4 py-[10px] text-sm font-semibold leading-[1.43] text-white bg-[#7F56D9] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#6941C6] transition-all duration-200">
            + Add Officer
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-4">
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Total Officers</p>
            <p className="mt-2 text-3xl font-bold text-[#021C3E]">128</p>
            <p className="mt-2 text-sm text-[#5CC47C]">+6% this month</p>
          </div>
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Active Officers</p>
            <p className="mt-2 text-3xl font-bold text-[#021C3E]">115</p>
            <p className="mt-2 text-sm text-[#5CC47C]">90% active</p>
          </div>
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Avg. Loans/Officer</p>
            <p className="mt-2 text-3xl font-bold text-[#021C3E]">9.6</p>
            <p className="mt-2 text-sm text-[#5CC47C]">+15% efficiency</p>
          </div>
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Top Performer</p>
            <p className="mt-2 text-xl font-bold text-[#021C3E]">Sarah Williams</p>
            <p className="mt-2 text-sm text-[#5CC47C]">45 loans processed</p>
          </div>
        </div>

        {/* Officers Table */}
        <div className="mt-8 mb-10 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">All Credit Officers</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search officers..."
                  className="px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]"
                />
                <button className="px-4 py-2 text-sm font-semibold text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-all duration-200">
                  Filter
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      OFFICER NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      EMAIL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      BRANCH
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      LOANS MANAGED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      PERFORMANCE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {[
                    { name: "Sarah Williams", email: "sarah@kaytop.com", branch: "Victoria Island", loans: 45, performance: "Excellent", status: "Active" },
                    { name: "John Doe", email: "john@kaytop.com", branch: "Ikeja", loans: 38, performance: "Good", status: "Active" },
                    { name: "Jane Smith", email: "jane@kaytop.com", branch: "Lekki", loans: 42, performance: "Excellent", status: "Active" },
                    { name: "Mike Johnson", email: "mike@kaytop.com", branch: "Surulere", loans: 35, performance: "Good", status: "Active" },
                    { name: "David Brown", email: "david@kaytop.com", branch: "Yaba", loans: 28, performance: "Average", status: "Active" },
                    { name: "Emma Davis", email: "emma@kaytop.com", branch: "Osun", loans: 32, performance: "Good", status: "Active" },
                    { name: "Chris Wilson", email: "chris@kaytop.com", branch: "Ibadan", loans: 40, performance: "Excellent", status: "Active" },
                    { name: "Lisa Anderson", email: "lisa@kaytop.com", branch: "Abuja", loans: 48, performance: "Excellent", status: "Active" },
                  ].map((officer, idx) => (
                    <tr key={idx} className="border-b border-[#EAECF0] last:border-b-0 hover:bg-[#F9FAFB] transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-[#021C3E]">{officer.name}</td>
                      <td className="px-6 py-4 text-sm text-[#475467]">{officer.email}</td>
                      <td className="px-6 py-4 text-sm text-[#475467]">{officer.branch}</td>
                      <td className="px-6 py-4 text-sm text-[#475467]">{officer.loans}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium leading-[1.43] rounded-2xl ${
                          officer.performance === "Excellent" ? "bg-[#ECFDF3] text-[#027A48]" :
                          officer.performance === "Good" ? "bg-[#EFF8FF] text-[#175CD3]" :
                          "bg-[#FEF3F2] text-[#B42318]"
                        }`}>
                          {officer.performance}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium leading-[1.43] rounded-2xl bg-[#ECFDF3] text-[#027A48]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
                          {officer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium transition-colors duration-200">
                          View Details
                        </button>
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
