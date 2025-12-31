import DashboardClient from "@/app/_components/ui/DashboardClient";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

export default async function Page() {
 
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-[70vh]">
              <Spinner />
            </div>
          }
        >
          <DashboardClient />
        </Suspense>
      </div>
    </div>
  );
}
