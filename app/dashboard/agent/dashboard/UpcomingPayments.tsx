import { LoanRecollectionItem, LoanRecollectionResponse } from "@/app/types/dashboard";
import { format } from "date-fns";


export interface UpcomingPaymentUI {
  name: string;
  amount: string;
  due: string;
  avatar?: string;
}

interface UpcomingPaymentsProps {
  payments: UpcomingPaymentUI[];
  isLoading?: boolean;
}



export function UpcomingPayments({
  payments,
  isLoading,
}: UpcomingPaymentsProps) {
  if (isLoading) {
    return (
      <aside className="bg-card rounded-2xl p-5 shadow-sm border border-border">
        <div className="h-6 bg-muted rounded w-40 mb-4 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

   if (!payments.length) {
    return (
      <aside className="bg-card rounded-2xl p-5 shadow-sm border border-border">
        <p className="text-sm text-muted-foreground">
          No upcoming payments
        </p>
      </aside>
    );
  }

  return (
    <aside className="bg-card rounded-2xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-foreground">
          Upcoming Payments
        </h3>
        <button className="text-sm text-muted-foreground hover:text-foreground">
          •••
        </button>
      </div>

      <div className="space-y-4">
        {payments.map((payment, index) => (
          <div
            key={`${payment.name}-${index}`}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-medium">
                {payment.name.charAt(0)}
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  {payment.name}
                </p>
                <p className="text-sm text-slate-500">
                 Due {payment.due}
                </p>
              </div>
            </div>

            <div className="font-semibold text-green-600">
               {payment.amount}
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 text-sm text-indigo-600 hover:underline cursor-pointer">
        Show more
      </button>
    </aside>
  );
}
