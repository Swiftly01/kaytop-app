"use client";
import React, { JSX } from "react";
import FilterButton from "./FilterButton";
import { usePathname, useSearchParams, useRouter } from "next/navigation";



interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterProps<T extends string> {
  isLoading: boolean;
  filterField: string;
  options: FilterOption<T>[];
}

export default function Filter<T extends string>({
  isLoading,
  filterField,
  options,
}: FilterProps<T>): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentFilter =  (searchParams.get(filterField) as T | null) ?? options[0]?.value;


  function handleClick(value: T) {
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
