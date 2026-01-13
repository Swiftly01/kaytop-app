"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Calendar, Filter, Pencil, Trash2 } from "lucide-react";
import { LoanService } from "@/app/services/loanService";
import { DashboardService } from "@/app/services/dashboardService";




function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "ACTIVE"
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
const [loans, setLoans] = useState<any[]>([]);
const [loading, setLoading] = useState(false);
const [loanDetails, setLoanDetails] = useState<any | null>(null);
const [loadingDetails, setLoadingDetails] = useState(false);
const [kpi, setKpi] = useState<null | {
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
}>(null);
const [loadingKpi, setLoadingKpi] = useState(false);

useEffect(() => {
  setLoadingKpi(true);
  DashboardService.getDashboardKpi({ timeFilter: "last_7_days" })
    .then((data) => {
      setKpi({
        totalLoans: data.totalLoans,
        activeLoans: data.activeLoans,
        overdueLoans: data.overdueLoans,
      });
    })
    .finally(() => setLoadingKpi(false));
}, []);


useEffect(() => {
  setLoading(true);
  LoanService.getBranchLoans({ page: 1, limit: 20 })
    .then((res) => setLoans(res.data))
    .finally(() => setLoading(false));
}, []);


useEffect(() => {
  if (!selectedLoan) return;

  setLoadingDetails(true);
  LoanService.getLoanDetails({ loanId: selectedLoan.loanId!, page: 1, limit: 20 })
    .then((res) => setLoanDetails(res.data))
    .finally(() => setLoadingDetails(false));
}, [selectedLoan]);


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
    {loadingKpi ? (
      <div className="col-span-3 p-6 text-center text-slate-500">Loading KPIs...</div>
    ) : (
      [
        { title: "Total Loans", value: kpi?.totalLoans ?? 0 },
        { title: "Active Loans", value: kpi?.activeLoans ?? 0 },
        { title: "Missed Loans", value: kpi?.overdueLoans ?? 0 },
      ].map((s) => (
        <div key={s.title} className="bg-white p-4 rounded-lg border relative">
          <button className="absolute top-3 right-3 text-slate-400">
            <MoreVertical size={16} />
          </button>
          <p className="text-sm text-slate-500">{s.title}</p>
          <h2 className="text-2xl font-semibold mt-2">{s.value}</h2>
          <p className="text-xs text-emerald-600 mt-1">↑ 100% vs last period</p>
          <div className="mt-4 h-6 w-20 bg-emerald-100 rounded-full" />
        </div>
      ))
    )}
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
            {loading ? (
          <tr>
            <td colSpan={8} className="p-6 text-center text-slate-500">
              Loading loans...
            </td>
          </tr>
        ) : loans.length === 0 ? (
          <tr>
            <td colSpan={8} className="p-6 text-center text-slate-500">
              No loans found
            </td>
          </tr>
        ) : (
            loans.map((loan) => (
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
                {loan.loanId}
                </td>

                <td className="p-4 font-medium">{loan.customerName}</td>
                <td className="p-4">
                  <StatusBadge status={loan.status.toUpperCase()} />
                </td>
                <td className="p-4">{`NGN${loan.amount}`}</td>
                <td className="p-4">{loan.interestRate}%</td>
                <td className="p-4">{loan.dueDate}</td>
                <td className="p-4 flex gap-3 justify-end">
                  <Trash2 size={16} className="text-slate-400 cursor-pointer" />
                  <Pencil size={16} className="text-slate-400 cursor-pointer" />
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

    {selectedLoan && (
  <div className="fixed inset-0 z-50 flex">
    <div className="flex-1 bg-black/40" onClick={() => setSelectedLoan(null)} />
    <div className="w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Loan Details</h2>
        <button
          onClick={() => setSelectedLoan(null)}
          className="text-slate-400 hover:text-slate-600 text-xl"
        >
          ×
        </button>
      </div>

      {loadingDetails ? (
        <p className="text-center text-slate-500">Loading details...</p>
      ) : loanDetails ? (
        <>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-slate-400">Loan ID</p>
              <p className="font-medium">{loanDetails.loanDetails.id}</p>
            </div>
            <div>
              <p className="text-slate-400">Borrower</p>
              <p className="font-medium">{loanDetails.customerDetails.firstName} {loanDetails.customerDetails.lastName}</p>
            </div>
            <div>
              <p className="text-slate-400">Amount</p>
              <p className="font-medium">NGN{loanDetails.loanDetails.amount}</p>
            </div>
            <div>
              <p className="text-slate-400">Interest Rate</p>
              <p className="font-medium">{loanDetails.loanDetails.interestRate}%</p>
            </div>
            <div>
              <p className="text-slate-400">Loan Status</p>
              <StatusBadge status={loanDetails.loanDetails.status.toUpperCase()} />
            </div>
          </div>

          <div className="my-6 border-t" />

          <h3 className="text-sm font-semibold mb-4">Repayment history</h3>
          {loanDetails.repaymentHistory.length === 0 ? (
            <p className="text-slate-500 text-sm">No repayments yet.</p>
          ) : (
            <div className="space-y-3">
              {loanDetails.repaymentHistory.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{p.description}</p>
                    <p className="text-xs text-slate-400">{p.date}</p>
                  </div>
                  <span className="text-emerald-600 text-xs font-medium">{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-slate-500">No details found</p>
      )}
    </div>
  </div>
)}


    </div>
  );
}
