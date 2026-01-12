"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useCustomerFlow } from "./AddCustomerFlow/AddCustomerFlowProvider";
import CreateLoanModal from "./loans/CreateLoanModal";

type Payment = {
  name: string;
  due: string;
  amount: string;
  avatar?: string;
};

const barData = [
  { name: "Jan", a: 120, b: 60, c: 40 },
  { name: "Feb", a: 140, b: 80, c: 50 },
  { name: "Mar", a: 160, b: 70, c: 60 },
  { name: "Apr", a: 170, b: 85, c: 55 },
  { name: "May", a: 180, b: 95, c: 70 },
  { name: "Jun", a: 190, b: 110, c: 80 },
  { name: "Jul", a: 200, b: 120, c: 90 },
  { name: "Aug", a: 210, b: 130, c: 95 },
  { name: "Sep", a: 220, b: 125, c: 100 },
  { name: "Oct", a: 230, b: 140, c: 110 },
  { name: "Nov", a: 240, b: 150, c: 120 },
  { name: "Dec", a: 250, b: 160, c: 130 },
];

const donutData = [
  { name: "Active loans", value: 60 },
  { name: "Missed payments", value: 25 },
  { name: "New users", value: 15 },
];

const DONUT_COLORS = ["#6B21A8", "#C4B5FD", "#EDE9FE"];

const payments: Payment[] = [
  {
    name: "Chibuike Anosi",
    due: "06/06/2024",
    amount: "₦64,240.60",
    avatar: "/avatar1.jpg",
  },
  {
    name: "Olajide Samson",
    due: "06/12/2024",
    amount: "₦64,240.60",
    avatar: "/avatar2.jpg",
  },
  {
    name: "Blessing Hassan",
    due: "06/11/2024",
    amount: "₦64,240.60",
    avatar: "/avatar3.jpg",
  },
];

export default function AgentDashboardPage() {
   const { start } = useCustomerFlow();
   const [isLoanModalOpen, setLoanModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Header row: Title + controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Dashboard
          </h1>
        </div>        
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 justify-between">
          <div className="hidden sm:flex gap-2">
            {["12 months", "30 days", "7 days", "24 hours"].map((t) => (
              <button
                key={t}
                className="px-3 py-1.5 rounded-md border text-sm text-slate-700 bg-white hover:bg-slate-50"
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-md border text-sm bg-white hover:bg-slate-50">
              Select dates
            </button>
            <button className="px-3 py-1.5 rounded-md border text-sm bg-white hover:bg-slate-50">
              Filters
            </button>
          </div>
        </div>

      {/* Activity area: Bar chart + donut on right */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="text-slate-800 font-medium mb-4">Activity</h2>
        <hr  className="pb-6"/>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Bar chart container */}
          <div className="flex-1 min-h-60">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -16, bottom: 10 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  {/* stacked bars with purple shades */}
                  <Bar dataKey="c" stackId="a" fill="#C4B5FD" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="b" stackId="a" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="a" stackId="a" fill="#5B21B6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut chart */}
          <div className="w-full lg:w-64 shrink-0 bg-white ">
            <div className="h-[260px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius="70%"
                    outerRadius="90%"
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                    cornerRadius={8}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

           <div className="px-3 pb-3">
              {/* legend */}
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-[#5B21B6]" /> Active loans
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-[#C4B5FD]" /> Missed payments
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-[#EDE9FE]" /> New users
                </li>
              </ul>
            </div>
        </div>
      </section>

      {/* Stat cards + Upcoming payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left & center: 3 cards (spans 2 columns on lg) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Purple card */}
          <div className="bg-linear-to-br from-[#5B21B6] to-[#7C3AED] text-white rounded-xl p-4 shadow-md flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center">📦</div>
              <div>
                <p className="text-sm opacity-90">Today's Collections</p>
                <p className="text-xl font-semibold mt-1">₦64,240.60</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-white rounded-full" />
            </div>
          </div>

          {/* Green card */}
          <div className="bg-linear-to-br from-[#059669] to-[#10B981] text-white rounded-xl p-4 shadow-md flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center">💼</div>
              <div>
                <p className="text-sm opacity-90">Active Loans</p>
                <p className="text-xl font-semibold mt-1">12</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-white rounded-full" />
            </div>
          </div>

          {/* Blue card */}
          <div className="bg-linear-to-br from-[#60A5FA] to-[#BFDBFE] text-slate-900 rounded-xl p-4 shadow-md flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-white/40 flex items-center justify-center">👥</div>
              <div>
                <p className="text-sm opacity-90">Total Customers</p>
                <p className="text-xl font-semibold mt-1">24</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-white/40 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-white rounded-full" />
            </div>
          </div>

          {/* Quick actions row under cards (full width of the 3 cards when on small) */}
          <div className="sm:col-span-3 flex flex-col sm:flex-row gap-4 mt-2">
            <button onClick={start} className="flex-1 bg-white p-4 rounded-xl shadow border text-left">
              <p className="font-semibold">Add new customer</p>
              <p className="text-sm text-slate-500">Add yourself or import from CSV</p>
            </button>

            <button  onClick={() => setLoanModalOpen(true)} className="flex-1 bg-white p-4 rounded-xl shadow border text-left">
              <p className="font-semibold">New loan application</p>
              <p className="text-sm text-slate-500">Dive into the editor and start creating</p>
            </button>
          </div>
        </div>

        {/* Right column: Upcoming Payments */}
        <aside className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Upcoming Payments</h3>
            <button className="text-sm text-slate-500">•••</button>
          </div>

          <div className="space-y-4">
            {payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatar ?? "/avatar-placeholder.png"}
                    alt={p.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    <p className="text-sm text-slate-500">Due {p.due}</p>
                  </div>
                </div>
                <div className="text-green-600 font-semibold">{p.amount}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-indigo-600 hover:underline cursor-pointer">
            Show more
          </div>
        </aside>
      </div>

            {/*  Loan Modal */}
      <CreateLoanModal
        open={isLoanModalOpen}
        onClose={() => setLoanModalOpen(false)}
      />

      {/* Responsive adjustments note: the layout is fully responsive via grid/flex */}

    </div>
  );
}

