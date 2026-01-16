"use client";
import React, { JSX } from "react";
import FilterButton from "./FilterButton";
import { usePathname, useSearchParams, useRouter } from "next/navigation";



interface FilterOption {
  value: string;
  label: string;
}

interface FilterProps {
  isLoading: boolean;
  filterField: string;
  options: FilterOption[];
}

export default function Filter({
  isLoading,
  filterField,
  options,
}: FilterProps): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentFilter = searchParams.get(filterField) ?? options.at(0)?.value;

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(filterField, value);
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <>
      {options.map((option) => (
        <FilterButton
          key={option.value}
          onClick={() => handleClick(option.value)}
          active={option.value === currentFilter ? true : undefined}
          disabled={option.value === currentFilter || isLoading}
        >
          {option.label}
        </FilterButton>
      ))}
    </>
  );
}
