"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/app/_components/ui/Button";
import RecordRepaymentModal from "./RecordRepaymentModal";
import AddSavingsModal from "./AddSavingsModal";


interface ActiveLoanCardProps {
  onRecordRepayment: () => void;
  onAddSavings: () => void;
}

// Sample small Badge component
function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";
  if (status === "Paid") return <span className={base + " text-emerald-700 bg-emerald-100"}>Paid</span>;
  if (status === "Missed") return <span className={base + " text-red-700 bg-red-100"}>Missed</span>;
  if (status === "Upcoming") return <span className={base + " text-slate-700 bg-slate-100"}>Upcoming</span>;
  return <span className={base + " text-gray-700 bg-gray-100"}>{status}</span>;
}

// KPI cards
function KpiCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm text-slate-500">Loan Repayment</h4>
          <div className="mt-2 text-2xl font-semibold">₦40,206.20</div>
          <div className="text-xs text-slate-400">Next Payment - Jan 15, 2025</div>
        </div>
        <div className="w-24 h-24 flex items-center justify-center rounded-full bg-violet-50">
          {/* Placeholder for donut */}
          <div className="w-12 h-12 rounded-full bg-violet-300" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm text-slate-500">Savings Account</h4>
          <div className="mt-2 text-2xl font-semibold">₦6,421.10</div>
          <div className="text-xs text-slate-400">Current balance</div>
        </div>
        <div className="w-24 h-24 flex items-center justify-center rounded-full bg-slate-50">
          <div className="w-12 h-12 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
}

// ActiveLoan card
function ActiveLoanCard({ onRecordRepayment, onAddSavings }: ActiveLoanCardProps)  {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Active Loan</h3>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm text-slate-600">
        <div>
          <div className="text-xs text-slate-400">Loan ID</div>
          <div className="font-medium">46729233</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Amount</div>
          <div className="font-medium">₦50,000</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Outstanding</div>
          <div className="font-medium">₦35,000</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Monthly Payment</div>
          <div className="font-medium">₦35,000</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Interest Rate</div>
          <div className="font-medium">20%</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Period</div>
          <div className="font-medium">23rd Nov, 2025</div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="text-xs text-slate-500 mb-2">Repayment Progress (60% Paid)</div>
        <div className="w-full bg-slate-100 h-2 rounded-full">
          <div className="h-2 rounded-full bg-violet-500" style={{ width: "60%" }} />
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button onClick={onRecordRepayment} className="bg-violet-600 text-white">Record Repayment</Button>
        <Button onClick={onAddSavings} className="bg-white border border-slate-200">Add Savings</Button>
        <Link href="/loans/schedule" className="self-center text-sm text-violet-600 hover:underline">View Payment Schedule</Link>
      </div>
    </div>
  );
}

// Payment schedule table
function PaymentSchedule() {
  const rows = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    name: `Payment ${i + 1}`,
    amount: '₦35,000',
    status: i === 4 ? 'Missed' : i < 4 ? 'Paid' : 'Upcoming',
    date: ['Wednesday 1:00pm','Wednesday 7:20am','Wednesday 2:45am','Tuesday 6:10pm','Tuesday 7:52am','Tuesday 12:15pm','Tuesday 5:40am','Sunday 8:10pm','Sunday 7:05pm','Sunday 12:52pm'][i]
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h4 className="text-base font-medium mb-4">Payment Schedule</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 text-xs uppercase">
            <tr>
              <th className="py-3">Amount</th>
              <th className="py-3">Status</th>
              <th className="py-3">Date</th>
              <th className="py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-4">{r.name}<div className="text-xs text-slate-400">{r.amount}</div></td>
                <td className="py-4"><StatusBadge status={r.status} /></td>
                <td className="py-4 text-slate-600">{r.date}</td>
                <td className="py-4 text-center"><input type="checkbox" className="h-4 w-4 accent-[#7f56d9]" defaultChecked={r.status === 'Paid'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
   const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Customer Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-3">
            <KpiCards />
            <div className="mt-6">
             <ActiveLoanCard
                onRecordRepayment={() => setIsRepaymentModalOpen(true)}
                onAddSavings={() => setIsSavingsModalOpen(true)}
              />
            </div>
            </div>
            <div className="lg:col-span-2">
            <PaymentSchedule />
            </div>

        </div>
      </main>

       <RecordRepaymentModal
        isOpen={isRepaymentModalOpen}
        onClose={() => setIsRepaymentModalOpen(false)}
      />
      <AddSavingsModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
      />
    </div>
  );
}