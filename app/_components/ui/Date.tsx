"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  range: DateRange | undefined;
  setRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export default function DateRangePicker({
  open,
  setOpen,
  range,
  setRange,
}: DateProps) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="justify-between w-64 font-semibold bg-white text-md text-neutral-700 hover:bg-brand-purple hover:text-white">
          {range?.from && range?.to
            ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
            : "Select date range"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={(range) => {
            setRange(range);
            if (range?.from && range?.to) setOpen(false);
          }}
          classNames={{
            day_today: "bg-transparent text-neutral-700",
            day_selected: "bg-brand-purple text-white",
            day_range_start: "bg-brand-purple text-white rounded-l-md",
            day_range_end: "bg-brand-purple text-white rounded-r-md",
            day_range_middle: "bg-brand-purple/20 text-neutral-900",
          }}

          // classNames={{
          //    today: "bg-transparent text-neutral-700",
          //   day_selected:
          //     "bg-brand-purple text-white hover:bg-brand-purple",
          //   day_range_start:
          //     "bg-brand-purple text-white rounded-l-md",
          //   day_range_end:
          //     "bg-brand-purple text-white rounded-r-md",
          //   day_range_middle:
          //     "bg-brand-purple/20 text-neutral-900",
          // }}
        />
      </PopoverContent>
    </Popover>
  );
}
