"use client";

import { useState } from "react";
import { MoreVertical, Calendar, Filter, Pencil, Trash2 } from "lucide-react";


const stats = [
  { title: "Total Loans", value: "2,000" },
  { title: "Active Loans", value: "2,000" },
  { title: "Missed Loans", value: "2,000" },
];

const loans = [
  {
    id: "ID: 43756",
    name: "Ademola Jumoke",
    status: "Active",
    amount: "NGN87,000",
    interest: "7.25%",
    date: "June 03, 2024",
  },
  {
    id: "ID: 43178",
    name: "Adegboyega Precious",
    status: "Active",
    amount: "NGN55,000",
    interest: "6.50%",
    date: "Dec 24, 2023",
  },
  {
    id: "ID: 70668",
    name: "Nneka Chukwu",
    status: "Scheduled",
    amount: "NGN92,000",
    interest: "8.00%",
    date: "Nov 11, 2024",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Active"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-orange-100 text-orange-700";

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles}`}>
      ● {status}
    </span>
  );
}

export default function LoansPage() {
    const [selectedLoan, setSelectedLoan] = useState<any | null>(null);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Loans</h1>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-sm">
            <Calendar size={16} /> Select dates
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-sm">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Time Filters */}
      <div className="flex gap-2 mb-6">
        {["12 months", "30 days", "7 days", "24 hours"].map((t) => (
          <button
            key={t}
            className="px-4 py-2 text-sm border rounded-lg bg-white hover:bg-slate-100"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.title}
            className="bg-white p-4 rounded-lg border relative"
          >
            <button className="absolute top-3 right-3 text-slate-400">
              <MoreVertical size={16} />
            </button>

            <p className="text-sm text-slate-500">{s.title}</p>
            <h2 className="text-2xl font-semibold mt-2">{s.value}</h2>
            <p className="text-xs text-emerald-600 mt-1">
              ↑ 100% vs last month
            </p>

            {/* Sparkline placeholder */}
            <div className="mt-4 h-6 w-20 bg-emerald-100 rounded-full" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">
                <input type="checkbox" />
              </th>
              <th className="text-left p-4">Loan ID</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Interest</th>
              <th className="text-left p-4">Next Repayment</th>
              <th className="p-4"></th>
            </tr>
          </thead>

          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} className="border-t">
                <td className="p-4">
                   <input
                    type="checkbox"
                    onChange={() => setSelectedLoan(loan)}
                    />
                </td>
                <td
                className="p-4 text-slate-500 cursor-pointer"
                onClick={() => setSelectedLoan(loan)}
                >
                {loan.id}
                </td>

                <td className="p-4 font-medium">{loan.name}</td>
                <td className="p-4">
                  <StatusBadge status={loan.status} />
                </td>
                <td className="p-4">{loan.amount}</td>
                <td className="p-4">{loan.interest}</td>
                <td className="p-4">{loan.date}</td>
                <td className="p-4 flex gap-3 justify-end">
                  <Trash2 size={16} className="text-slate-400 cursor-pointer" />
                  <Pencil size={16} className="text-slate-400 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLoan && (
  <div className="fixed inset-0 z-50 flex">
    {/* Backdrop */}
    <div
      className="flex-1 bg-black/40"
      onClick={() => setSelectedLoan(null)}
    />

    {/* Side panel */}
    <div className="w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Loan Details</h2>
        <button
          onClick={() => setSelectedLoan(null)}
          className="text-slate-400 hover:text-slate-600 text-xl"
        >
          ×
        </button>
      </div>

      {/* Loan Info */}
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-slate-400">Loan ID</p>
          <p className="font-medium">{selectedLoan.id}</p>
        </div>

        <div>
          <p className="text-slate-400">Borrower</p>
          <p className="font-medium">{selectedLoan.name}</p>
        </div>

        <div>
          <p className="text-slate-400">Amount</p>
          <p className="font-medium">{selectedLoan.amount}</p>
        </div>

        <div>
          <p className="text-slate-400">Interest Rate</p>
          <p className="font-medium">{selectedLoan.interest}</p>
        </div>

        <div>
          <p className="text-slate-400">Loan Status</p>
          <StatusBadge status={selectedLoan.status} />
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 border-t" />

      {/* Repayment History */}
      <h3 className="text-sm font-semibold mb-4">Repayment history</h3>

      <div className="space-y-3">
        {["Payment 1", "Payment 2", "Payment 3"].map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-sm"
          >
            <div>
              <p className="font-medium">{p}</p>
              <p className="text-xs text-slate-400">
                Wednesday 1:20pm
              </p>
            </div>

            <span className="text-emerald-600 text-xs font-medium">
              Paid
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

    </div>
  );
}
