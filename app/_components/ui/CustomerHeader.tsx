import { useDashboardDateFilter } from "@/app/hooks/useDashboardDateFilter";
import DashboardFilter from "./DashboardFilter";
import DateRangePicker from "./Date";
import FilterButton from "./FilterButton";

interface CustomerHeaderProps {
  title?: string;
  isLoading: boolean;
  data?: {
    branch: string;
  };
}

export function CustomerHeader({ title = "Customers", data, isLoading }: CustomerHeaderProps) {
  const {
    open,
    setOpen,
    range,
    setRange,
    applyDateFilter,
    resetDateFilter,
  } = useDashboardDateFilter();

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between mt-8 gap-y-2">
        <div className="flex flex-wrap items-center gap-1 px-1 py-1 bg-white rounded-sm w-fit">
          <DashboardFilter isLoading={isLoading} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker
            open={open}
            setOpen={setOpen}
            range={range}
            setRange={setRange}
          />

          <FilterButton
            disabled={isLoading}
            onClick={applyDateFilter}
            className="flex gap-1 px-2 py-1 bg-white rounded-sm"
          >
            <img src="/filter.svg" alt="calendar" />
            <span>Filter</span>
          </FilterButton>

          <FilterButton
            disabled={isLoading}
            onClick={resetDateFilter}
            className="flex gap-1 px-2 py-1 bg-white rounded-sm"
          >
            Reset
          </FilterButton>
        </div>
      </div>
    </>
  );
}
