import { MetricProps, Routes } from "@/app/types/dashboard";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export const ROUTES: Routes = {
  Bm :{
    DASHBOARD: "/dashboard/bm",
    CREDIT: "/dashboard/bm/credit",
    CUSTOMERS: "/dashboard/bm/customers",
    LOAN: "/dashboard/bm/loans",
    REPORT: "/dashboard/bm/reports",
    SETTING: "/dashboard/bm/settings"

  }
  
}

export const customer: MetricProps[] = [
  {
    title: "Total Customers",
    value: "42,094",
    change: "+6% this month",
    changeColor: "green",
    border: false,
  },
  {
    title: "Active Loans",
    value: "15,350",
    change: "+6% this month",
    changeColor: "green",
    border: true,
  },
]

export const creditOficcer: MetricProps[] = [
  {
    title: "Total Credit Officers",
    value: "42,094",
    change: "+6% this month",
    changeColor: "green",
    border: false,
  },
];

export const data: MetricProps[] = [
  {
    title: "All Customers",
    value: "42,094",
    change: "+6% this month",
    changeColor: "green",
    border: false,
  },
  {
    title: "All CO's",
    value: "15,350",
    change: "+6% this month",
    changeColor: "green",
    border: true,
  },
  {
    title: "Loans Processed",
    value: "28,350",
    change: "-26% this month",
    changeColor: "red",
    border: true,
  },
  {
    title: "Loan Amount",
    value: "₦50,350.00",
    change: "+40% this month",
    changeColor: "green",
    border: true,
  },
];
