import Metric from "@/app/_components/ui/Metric";
import Table from "@/app/_components/ui/Table";
import { MetricProps } from "@/app/types/dashboard";
import { data as dashboardData } from "@/lib/utils";
import Link from "next/link";
import { JSX } from "react";

const metricData: MetricProps[] = dashboardData;

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <div className="leading-4 text-neutral-700 mt-5">
          <Link href="/" className="relative inline-block group">
            <img src="/back.svg" alt="Back" className="relative z-10" />
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-brand-purple transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <h1 className="text-2xl font-medium">Credit Officer</h1>
        </div>

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
