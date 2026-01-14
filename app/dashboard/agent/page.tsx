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
import { CustomerHeader } from "@/app/_components/ui/CustomerHeader";
import { useDashboardQuery } from "../bm/queries/kpi/useDashboardQuery";
import { PenLine, UserRoundPlus } from "lucide-react";
import { ActivityChart } from "./dashboard/ActivityChart";
import { KpiCards } from "./dashboard/KpiCards";
import { UpcomingPayments, UpcomingPaymentUI } from "./dashboard/UpcomingPayments";
import { useLoanRecollections } from "./queries/useLoanRecollections";

type Payment = {
  name: string;
  due: string;
  amount: string;
  avatar?: string;
};



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
   const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardQuery();

  const {
    data: recollectionsResponse,
    isLoading: isRecollectionsLoading,
  } = useLoanRecollections(1, 5);

const rawData = Array.isArray(recollectionsResponse)
  ? recollectionsResponse
  : recollectionsResponse?.data;

const recollections: UpcomingPaymentUI[] =
  rawData?.map((item) => ({
    name: item.name,
    amount: `₦${Number(item.amountToBePaid).toLocaleString()}`,
    due: new Date(item.dateToBePaid).toLocaleDateString(),
    avatar: "/avatar-placeholder.png",
  })) ?? [];




  /* ---------------------- ERROR STATE ---------------------- */

  if (dashboardError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load dashboard data
      </div>
    );
  }
   




  return (
    <div className="space-y-6 pb-12">
      {/* Header row: Title + controls */}
       <CustomerHeader title="Dashboard" data={dashboardData} isLoading={isDashboardLoading} />


      {/* Activity area: Bar chart + donut on right */}
       <ActivityChart data={dashboardData} isLoading={isDashboardLoading} />
      

      {/* Stat cards + Upcoming payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left & center: 3 cards (spans 2 columns on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <KpiCards data={dashboardData} isLoading={isDashboardLoading} />
          
          {/* Quick actions row under cards (full width of the 3 cards when on small) */}
          <div className="sm:col-span-3 flex flex-col sm:flex-row gap-4 mt-2">
            <button onClick={start} className="flex-1 bg-white p-4 rounded-xl shadow border text-left cursor-pointer">
              <div className="flex items-center gap-4">
              <div className="rounded-full w-10 h-10 bg-[#f4ebff] flex items-center justify-center">
                <UserRoundPlus className="text-[#7f56d9]" />
              </div>
              <div>
              <p className="font-semibold">Add new customer</p>
              <p className="text-sm text-slate-500">Add yourself or import from CSV</p>
              </div>
              </div>
            </button>

            <button  onClick={() => setLoanModalOpen(true)} className="flex-1 cursor-pointer bg-white p-4 rounded-xl shadow border text-left">
              <div className="flex items-center gap-4">
              <div className="rounded-full w-10 h-10 bg-[#f4ebff] flex items-center justify-center">
                  <PenLine className="text-[#7f56d9]" />
                </div>
             <div>
              <p className="font-semibold">New loan application</p>
              <p className="text-sm text-slate-500">Dive into the editor and start creating</p>
              </div>
              </div>
            </button>
          </div>
        </div>

        {/* Right column: Upcoming Payments */}
        <UpcomingPayments
          payments={recollections}
          isLoading={isRecollectionsLoading}
        />;
        
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

