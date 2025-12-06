import BreadCrumb from "@/app/_components/ui/BreadCrumb";
import Metric from "@/app/_components/ui/Metric";
import Table from "@/app/_components/ui/Table";
import { MetricProps } from "@/app/types/dashboard";
import { data as dashboardData, ROUTES } from "@/lib/utils";
import Link from "next/link";
import { JSX } from "react";

const metricData: MetricProps[] = dashboardData;

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <BreadCrumb title="Credit Officer" link={ROUTES.Bm.CREDIT}/>
       

        <Metric item={metricData} />
        <Metric item={metricData} />

        <div>
          <div className="my-5 text-gray-500 tabs tabs-border custom-tabs">
            <input
              type="radio"
              name="my_tabs_2"
              className="tab"
              aria-label="Collections"
              defaultChecked
            />
            <div className="p-10 bg-white tab-content">
              <Table />
            </div>

            <input
              type="radio"
              name="my_tabs_2"
              className="tab"
              aria-label="Loans disbursed"
            />
            <div className="p-10 bg-white tab-content">Tab content 2</div>
          </div>
        </div>
      </div>
    </div>
  );
}
