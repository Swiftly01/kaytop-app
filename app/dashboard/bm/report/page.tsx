import ReportClient from "@/app/_components/ui/ReportClient";
import SpinnerLg from "@/app/_components/ui/SpinnerLg";
import { JSX, Suspense } from "react";

export const metadata = {
  title: "Report"
}

export default function page(): JSX.Element {
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
          <ReportClient/>
        </Suspense>

      
      </div>
    </div>
  );
}
