import FilterButton from "@/app/_components/ui/FilterButton";
import { JSX } from "react";

export default function page(): JSX.Element {
  return (
    <div className="drawer-content">
      <div className="container h-full px-5 pt-4 mx-auto max-w-7xl">
        <div className="leading-4 text-neutral-700">
          <h1 className="text-2xl font-medium">Overview</h1>
          <p className="text-md opacity-50">Osun state</p>
        </div>
        <div className="flex items-center justify-between mt-10">
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
      </div>
    </div>
  );
}
