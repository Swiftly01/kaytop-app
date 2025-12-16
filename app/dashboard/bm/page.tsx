import DashboardClient from "@/app/_components/ui/DashboardClient";
import SpinnerLg from "@/app/_components/ui/SpinnerLg";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-[70vh]">
              <SpinnerLg />
            </div>
          }
        >
          <DashboardClient />
        </Suspense>
      </div>
    </div>
  );
}
