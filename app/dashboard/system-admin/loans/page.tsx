"use client";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="h-full px-5 pt-4 mx-auto" style={{ maxWidth: "1091px" }}>
        <div className="flex items-center justify-between text-[#021C3E]">
          <div>
            <h1 className="text-2xl font-bold leading-[1.33]">Loans</h1>
            <p className="text-base font-medium leading-4 opacity-50">Manage all loans</p>
          </div>
          <button className="px-4 py-[10px] text-sm font-semibold leading-[1.43] text-white bg-[#7F56D9] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#6941C6] transition-all duration-200">
            + New Loan
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-4">
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Total Loans</p>
            <p className="mt-2 text-3xl font-bold text-[#021C3E]">1,234</p>
            <p className="mt-2 text-sm text-[#5CC47C]">+40% this month</p>
          </div>
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Active Loans</p>
            <p className="mt-2 text-3xl font-bold text-[#021C3E]">892</p>
            <p className="mt-2 text-sm text-[#5CC47C]">72% active</p>
          </div>
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Total Amount</p>
            <p className="mt-2 text-3xl font-bold text-[#021C3E]">₦45.2M</p>
            <p className="mt-2 text-sm text-[#5CC47C]">+6% this month</p>
          </div>
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Missed Payments</p>
            <p className="mt-2 text-3xl font-bold text-[#021C3E]">34</p>
            <p className="mt-2 text-sm text-[#E43535]">2.8% default rate</p>
          </div>
        </div>

        {/* Loans Table */}
        <div className="mt-8 mb-10 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">All Loans</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search loans..."
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
                      LOAN ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      CUSTOMER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      AMOUNT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      INTEREST RATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      DURATION
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
                    { id: "LN-2024-001", customer: "Olivia Martin", amount: "NGN87,000", rate: "7.25%", duration: "12 months", status: "Active" },
                    { id: "LN-2024-002", customer: "Phoenix Baker", amount: "NGN55,000", rate: "6.50%", duration: "6 months", status: "Active" },
                    { id: "LN-2024-003", customer: "Lana Steiner", amount: "NGN92,000", rate: "8.00%", duration: "18 months", status: "Pending" },
                    { id: "LN-2024-004", customer: "Demi Wilkinson", amount: "NGN68,000", rate: "7.75%", duration: "12 months", status: "Active" },
                    { id: "LN-2024-005", customer: "Candice Wu", amount: "NGN79,000", rate: "7.00%", duration: "9 months", status: "Active" },
                    { id: "LN-2024-006", customer: "Natali Craig", amount: "NGN46,000", rate: "6.75%", duration: "6 months", status: "Active" },
                    { id: "LN-2024-007", customer: "Drew Cano", amount: "NGN61,000", rate: "8.25%", duration: "12 months", status: "Active" },
                    { id: "LN-2024-008", customer: "Orlando Diggs", amount: "NGN73,000", rate: "7.50%", duration: "15 months", status: "Active" },
                  ].map((loan, idx) => (
                    <tr key={idx} className="border-b border-[#EAECF0] last:border-b-0 hover:bg-[#F9FAFB] transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-[#021C3E]">{loan.id}</td>
                      <td className="px-6 py-4 text-sm text-[#475467]">{loan.customer}</td>
                      <td className="px-6 py-4 text-sm text-[#475467]">{loan.amount}</td>
                      <td className="px-6 py-4 text-sm text-[#475467]">{loan.rate}</td>
                      <td className="px-6 py-4 text-sm text-[#475467]">{loan.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium leading-[1.43] rounded-2xl ${
                          loan.status === "Active" ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[rgba(255,147,38,0.1)] text-[#FF9326]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            loan.status === "Active" ? "bg-[#12B76A]" : "bg-[#FF9326]"
                          }`} />
                          {loan.status}
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
