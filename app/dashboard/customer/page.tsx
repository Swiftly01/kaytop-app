import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import CustomerDashboardClient from "./CustomerDashboardClient";



export default function DashboardPage() {
 

  return (
     <Suspense
          fallback={
            <div className="flex items-center justify-center h-[70vh]">
              <Spinner />
            </div>
          }
        >
          <CustomerDashboardClient />
        </Suspense>
  );
}
