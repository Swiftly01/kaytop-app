"use client";
import { useDashboardQuery } from "@/app/dashboard/bm/queries/kpi/useDashboardQuery";
import { useLoanDisbursedQuery } from "@/app/dashboard/bm/queries/loan/useLoanDisbursedQuery";
import { useDashboardDateFilter } from "@/app/hooks/useDashboardDateFilter";
import { MetricProps } from "@/app/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import Chart from "./Chart";
import DashboardFilter from "./DashboardFilter";
import Date from "./Date";
import FilterButton from "./FilterButton";
import Metric from "./Metric";
import SpinnerLg from "./SpinnerLg";
import Table from "./Table";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function DashboardClient() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const searhParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { isLoading, error, data } = useDashboardQuery();
  const {
    isLoading: isLoadingLoan,
    error: loanError,
    data: loan,
  } = useLoanDisbursedQuery();

  const { open, setOpen, range, setRange, applyDateFilter, resetDateFilter } =
    useDashboardDateFilter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <SpinnerLg />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-2xl text-center text-neutral-700">
        {error.response?.data?.message || "Failed to load KPI"}
      </div>
    );
  }

  if (!data) return null;

  const metricData: MetricProps[] = [
    {
      title: "All Customers",
      value: "N/A",
      // change: "+6% this month",
      // changeColor: "green",
      border: false,
    },
    {
      title: "All CO's",
      value: data.totalCreditOfficers.toString(),
      border: true,
    },
    {
      title: "Loans Processed",
      value: data.loansProcessedThisPeriod.toString(),
      border: true,
    },
    {
      title: "Loan Amount",
      value: formatCurrency(data.loanValueThisPeriod),
      border: true,
    },
  ];

  const metricData2: MetricProps[] = [
    {
      title: "Active Loan",
      value: data.activeLoans.toString(),
      border: false,
    },
    {
      title: "Missed Payment",
      value: "N/A",
      border: false,
    },
  ];

  function handlePageChange(page: number) {
    setCurrentPage(page);

    const params = new URLSearchParams(searhParams.toString());
    params.set("page", page.toString());

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <div className="leading-4 text-neutral-700">
        <h1 className="text-2xl font-medium">Overview</h1>
        <p className="text-md">{data.branch} Branch</p>
      </div>
      <div className="flex flex-wrap items-center justify-between mt-10 gap-y-2">
        <div className="flex flex-wrap items-center gap-1 px-1 py-1 bg-white rounded-sm w-fit">
          <DashboardFilter />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Date
            open={open}
            setOpen={setOpen}
            range={range}
            setRange={setRange}
          />
          <FilterButton
            onClick={applyDateFilter}
            className="flex gap-1 px-1 py-1 bg-white rounded-sm"
          >
            <img src="/filter.svg" alt="calendar" />
            <span>Filter</span>
          </FilterButton>
          <FilterButton
            onClick={resetDateFilter}
            className="flex gap-1 px-1 py-1 bg-white rounded-sm"
          >
            <span>Reset</span>
          </FilterButton>
        </div>
      </div>
      <Metric item={metricData} />

      <Metric item={metricData2} cols={2} />

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
            <Table item={loan?.data} meta={loan?.meta} onPageChange={handlePageChange} />
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
    </>
  );
}
