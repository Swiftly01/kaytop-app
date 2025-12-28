import BreadCrumb from "@/app/_components/ui/BreadCrumb";
import CreditOfficerClient from "@/app/_components/ui/CreditOfficerClient";
import Metric from "@/app/_components/ui/Metric";
import SpinnerLg from "@/app/_components/ui/SpinnerLg";
import Table from "@/app/_components/ui/table/DisbursementTable";
import { MetricProps } from "@/app/types/dashboard";
import { data as dashboardData, ROUTES } from "@/lib/utils";
import { JSX, Suspense } from "react";

const metricData: MetricProps[] = dashboardData;

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
          <CreditOfficerClient />
        </Suspense>
      </div>
    </div>
  );
}
