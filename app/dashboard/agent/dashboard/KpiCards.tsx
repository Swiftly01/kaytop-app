import { DashboardKpi } from "@/app/types/dashboard";
import { Package, Briefcase, Users } from "lucide-react";

interface KpiCardsProps {
  data?: DashboardKpi;
  isLoading?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value).replace("NGN", "₦");
}

export function KpiCards({ data, isLoading }: KpiCardsProps) {
  const todaysCollections = data?.totalRepaidValue ?? 0;
  const activeLoans = data?.activeLoans ?? 0;
  const totalCustomers = data?.totalSavingsAccounts ?? 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Purple card - Today's Collections */}
      <div className="bg-linear-to-br from-[#5B21B6] to-[#7C3AED] text-white rounded-xl p-4 shadow-md flex flex-col justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm opacity-90">Today's Collections</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(todaysCollections)}</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="w-3/4 h-full bg-white rounded-full" />
        </div>
      </div>

      {/* Green card - Active Loans */}
      <div className="bg-linear-to-br from-[#059669] to-[#10B981] text-white rounded-xl p-4 shadow-md flex flex-col justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm opacity-90">Active Loans</p>
            <p className="text-xl font-semibold mt-1">{activeLoans}</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="w-2/3 h-full bg-white rounded-full" />
        </div>
      </div>

      {/* Blue card - Total Customers */}
      <div className="bg-linear-to-br from-[#60A5FA] to-[#BFDBFE] text-slate-900 rounded-xl p-4 shadow-md flex flex-col justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-white/40 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm opacity-90">Total Customers</p>
            <p className="text-xl font-semibold mt-1">{totalCustomers}</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/40 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-white rounded-full" />
        </div>
      </div>
    </div>
  );
}
