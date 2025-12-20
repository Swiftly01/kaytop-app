import FilterButton from "@/app/_components/ui/FilterButton";
import Metric from "@/app/_components/ui/Metric";
import Table from "@/app/_components/ui/table/DisbursementTable";
import React from "react";
import { customer as customerData } from "@/lib/utils";
import { MetricProps } from "@/app/types/dashboard";

const metricData: MetricProps[] = customerData;

export default function page() {
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
        <Metric item={metricData} cols={2} />

        <div>
          <p className="pb-5 text-md">Customers</p>
          <div className="p-10 bg-white">
            <Table />
          </div>
        </div>
      </div>
    </div>
  );
}
