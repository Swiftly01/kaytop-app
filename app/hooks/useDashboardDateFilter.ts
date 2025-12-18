import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { DateRange } from "react-day-picker";

export function useDashboardDateFilter() {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function applyDateFilter() {
    if (!range?.from || !range?.to) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", range.from.toISOString().split("T")[0]);
    params.set("endDate", range.to.toISOString().split("T")[0]);

    router.push(`${pathname}?${params.toString()}`);
  }


  function resetDateFilter(){
      setRange(undefined);
      router.push(`${pathname}`);
  }

  return { open, setOpen, range, setRange, applyDateFilter, resetDateFilter };
}
