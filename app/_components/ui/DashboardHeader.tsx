"use client";
import { useDashboardDateFilter } from "@/app/hooks/useDashboardDateFilter";
import DashboardFilter from "./DashboardFilter";
import Date from "./Date";
import FilterButton from "./FilterButton";

interface DashboardHeaderProps {
  isLoading: boolean;
  data?: {
    branch: string;
  };
}

export default function DashboardHeader({ data, isLoading }: DashboardHeaderProps) {
  const { open, setOpen, range, setRange, applyDateFilter, resetDateFilter } =
    useDashboardDateFilter();

  return (
    <>
      <div className="leading-4 text-neutral-700">
        <h1 className="text-2xl font-medium">Overview</h1>
        <p className="text-md">{data?.branch} Branch</p>
      </div>
      <div className="flex flex-wrap items-center justify-between mt-10 gap-y-2">
        <div className="flex flex-wrap items-center gap-1 px-1 py-1 bg-white rounded-sm w-fit">
          <DashboardFilter isLoading={isLoading} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Date
            open={open}
            setOpen={setOpen}
            range={range}
            setRange={setRange}
          />
          <FilterButton
            disabled={isLoading}
            onClick={applyDateFilter}
            className="flex gap-1 px-1 py-1 bg-white rounded-sm"
          >
            <img src="/filter.svg" alt="calendar" />
            <span>Filter</span> 
          </FilterButton>
          <FilterButton
            disabled={isLoading}
            onClick={resetDateFilter}
            className="flex gap-1 px-1 py-1 bg-white rounded-sm"
          >
            <span>Reset</span>
          </FilterButton>
        </div>
      </div>
    </>
  );
}
