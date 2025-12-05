"use client";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="h-full px-5 pt-4 mx-auto" style={{ maxWidth: "1091px" }}>
        <div className="flex items-center justify-between text-[#021C3E]">
          <div>
            <h1 className="text-2xl font-bold leading-[1.33]">Branches</h1>
            <p className="text-base font-medium leading-4 opacity-50">Manage all branches</p>
          </div>
          <button className="px-4 py-[10px] text-sm font-semibold leading-[1.43] text-white bg-[#7F56D9] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#6941C6] transition-all duration-200">
            + Add Branch
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-3">
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Total Branches</p>
            <p className="mt-2 text-3xl font-bold text-[#021C3E]">45</p>
            <p className="mt-2 text-sm text-[#5CC47C]">+3 this month</p>
          </div>
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Active Branches</p>
            <p className="mt-2 text-3xl font-bold text-[#021C3E]">42</p>
            <p className="mt-2 text-sm text-[#5CC47C]">93% active</p>
          </div>
          <div className="p-6 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
            <p className="text-sm font-semibold text-[#8B8F96] opacity-90">Total Staff</p>
            <p className="mt-2 text-3xl font-bold text-[#021C3E]">1,247</p>
            <p className="mt-2 text-sm text-[#5CC47C]">+12% this month</p>
          </div>
        </div>

        {/* Branches Table */}
        <div className="mt-8 mb-10 bg-white border border-[#EAECF0] rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">All Branches</h3>
              <input
                type="text"
                placeholder="Search branches..."
                className="px-4 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:border-[#7F56D9]"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      BRANCH NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      LOCATION
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      MANAGER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium leading-[1.43] tracking-[0.006em] text-[#475467]">
                      STAFF COUNT
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
                    { name: "Ikeja Branch", location: "Lagos", manager: "John Doe", staff: 28, status: "Active" },
                    { name: "Lekki Branch", location: "Lagos", manager: "Jane Smith", staff: 32, status: "Active" },
                    { name: "Surulere Branch", location: "Lagos", manager: "Mike Johnson", staff: 25, status: "Active" },
                    { name: "Victoria Island", location: "Lagos", manager: "Sarah Williams", staff: 35, status: "Active" },
                    { name: "Yaba Branch", location: "Lagos", manager: "David Brown", staff: 22, status: "Active" },
                    { name: "Osun Branch", location: "Osun", manager: "Emma Davis", staff: 18, status: "Active" },
                    { name: "Ibadan Branch", location: "Oyo", manager: "Chris Wilson", staff: 30, status: "Active" },
                    { name: "Abuja Branch", location: "FCT", manager: "Lisa Anderson", staff: 40, status: "Active" },
                  ].map((branch, idx) => (
                    <tr key={idx} className="border-b border-[#EAECF0] last:border-b-0 hover:bg-[#F9FAFB] transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-[#021C3E]">{branch.name}</td>
                      <td className="px-6 py-4 text-sm text-[#475467]">{branch.location}</td>
                      <td className="px-6 py-4 text-sm text-[#475467]">{branch.manager}</td>
                      <td className="px-6 py-4 text-sm text-[#475467]">{branch.staff}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium leading-[1.43] rounded-2xl bg-[#ECFDF3] text-[#027A48]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
                          {branch.status}
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
