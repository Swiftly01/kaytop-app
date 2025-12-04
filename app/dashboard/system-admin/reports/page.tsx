"use client";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="h-full px-5 pt-4 mx-auto" style={{ maxWidth: "1091px" }}>
        <div className="text-[#021C3E]">
          <h1 className="text-2xl font-bold leading-[1.33]">Reports</h1>
          <p className="text-base font-medium leading-4 opacity-50">View system reports and analytics</p>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-3">
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)] hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">Loan Performance</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm text-[#475467] mb-4">View detailed loan performance metrics and trends</p>
            <button className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium transition-colors duration-200">
              View Report →
            </button>
          </div>

          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)] hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">Branch Performance</h3>
              <span className="text-2xl">🏢</span>
            </div>
            <p className="text-sm text-[#475467] mb-4">Compare performance across all branches</p>
            <button className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium transition-colors duration-200">
              View Report →
            </button>
          </div>

          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)] hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">Customer Analytics</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-sm text-[#475467] mb-4">Analyze customer behavior and demographics</p>
            <button className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium transition-colors duration-200">
              View Report →
            </button>
          </div>

          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)] hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">Credit Officer Report</h3>
              <span className="text-2xl">👨‍💼</span>
            </div>
            <p className="text-sm text-[#475467] mb-4">Track credit officer performance and efficiency</p>
            <button className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium transition-colors duration-200">
              View Report →
            </button>
          </div>

          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)] hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">Financial Summary</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-sm text-[#475467] mb-4">Overall financial health and revenue reports</p>
            <button className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium transition-colors duration-200">
              View Report →
            </button>
          </div>

          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)] hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">Risk Assessment</h3>
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-sm text-[#475467] mb-4">Identify and analyze potential risks</p>
            <button className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium transition-colors duration-200">
              View Report →
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="mt-8 mb-10 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-[#021C3E]">Recent Reports</h3>
            <div className="space-y-4">
              {[
                { name: "Monthly Performance Report - November 2024", date: "Dec 01, 2024", type: "Performance" },
                { name: "Q4 Financial Summary", date: "Nov 28, 2024", type: "Financial" },
                { name: "Branch Comparison Report", date: "Nov 25, 2024", type: "Branch" },
                { name: "Customer Growth Analysis", date: "Nov 20, 2024", type: "Customer" },
              ].map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-[#EAECF0] rounded-lg hover:bg-[#F9FAFB] transition-colors duration-150">
                  <div>
                    <p className="text-sm font-medium text-[#021C3E]">{report.name}</p>
                    <p className="text-xs text-[#475467] mt-1">{report.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-medium text-[#7F56D9] bg-[#F4EBFF] rounded-full">
                      {report.type}
                    </span>
                    <button className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium transition-colors duration-200">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
