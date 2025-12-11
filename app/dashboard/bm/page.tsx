import Chart from "@/app/_components/ui/Chart";
import FilterButton from "@/app/_components/ui/FilterButton";
import Metric from "@/app/_components/ui/Metric";
import Table from "@/app/_components/ui/Table";
import { MetricProps } from "@/app/types/dashboard";
import { data as dashboardData } from "@/lib/utils";
import { JSX } from "react";

const metricData: MetricProps[] = dashboardData;

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <div className="leading-4 text-neutral-700">
          <h1 className="text-2xl font-medium">Overview</h1>
          <p className="text-md">Igando Branch</p>
        </div>
        <div className="flex flex-wrap items-center justify-between mt-10 gap-y-2">
          <div className="flex flex-wrap items-center gap-1 px-1 py-1 bg-white rounded-sm w-fit">
            <FilterButton active={true}>12 months</FilterButton>
            <FilterButton>30 days</FilterButton>
            <FilterButton>7 days</FilterButton>
            <FilterButton>24 hours</FilterButton>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterButton className="flex gap-1 px-1 py-1 bg-white rounded-sm">
              <img src="/calendar.svg" alt="calendar" />
              <span> Select dates</span>
            </FilterButton>
            <FilterButton className="flex gap-1 px-1 py-1 bg-white rounded-sm">
              <img src="/filter.svg" alt="calendar" />
              <span>Filter</span>
            </FilterButton>
          </div>
        </div>
        <Metric item={metricData} />

        <div className="grid grid-cols-2 px-4 py-5 bg-white rounded-md">
          <div className="flex flex-col items-start px-4">
            <p className="text-sm text-gray-500">Active Loan</p>
            <h1 className="text-xl font-semibold">₦50,350.00</h1>
            <p className="text-sm text-green-500">+40% this month</p>
          </div>
          <div className="flex flex-col items-start px-4 border-l">
            <p className="text-sm text-gray-500">Missed Payment</p>
            <h1 className="text-xl font-semibold">₦50,350.00</h1>
            <p className="text-sm text-green-500">+40% this month</p>
          </div>
        </div>

        <div className="flex flex-col p-5 my-5 bg-white h-[40vh]">
          <Chart />
        </div>
        <div>
          <div className="my-5 text-gray-500 tabs tabs-border custom-tabs">
            <input
              type="radio"
              name="my_tabs_2"
              className="tab"
              aria-label="Disbursements"
              defaultChecked
            />
            <div className="p-10 bg-white tab-content">
              <Table />
            </div>

            <input
              type="radio"
              name="my_tabs_2"
              className="tab"
              aria-label="Re-collections"
            />
            <div className="p-10 bg-white tab-content">Tab content 2</div>

            <input
              type="radio"
              name="my_tabs_2"
              className="tab"
              aria-label="Savings"
            />
            <div className="p-10 bg-white tab-content">Tab content 3</div>
            <input
              type="radio"
              name="my_tabs_2"
              className="tab"
              aria-label="Missed payments"
            />
            <div className="p-10 bg-white tab-content">Tab content 4</div>
          </div>
        </div>
      </div>
    </div>
  );
}
