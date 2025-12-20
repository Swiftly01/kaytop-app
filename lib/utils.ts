import { MetricProps } from "@/app/types/dashboard";
import { Routes } from "@/app/types/routes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ROUTES: Routes = {
  Bm: {
    Auth: {
      LOGIN: "/auth/bm/login",
      VERIFY_OTP: "/auth/bm/verify-otp",
      FORGOT_PASSWORD: "/auth/bm/forgot-password",
      RESET_PASSWORD: "/auth/bm/reset-password",
    },
    DASHBOARD: "/dashboard/bm",
    CREDIT: "/dashboard/bm/credit",
    CUSTOMERS: "/dashboard/bm/customer",
    LOAN: "/dashboard/bm/loan",
    REPORT: "/dashboard/bm/report",
    SETTING: "/dashboard/bm/setting",
  },
};

export function formatDate(date?: string | Date | null) {
  return date ? dayjs(date).format("YYYY-MM-DD") : "-";
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value ?? 0);
};

interface DashboardMetricsInput {
  data: {
    totalCreditOfficers: number;
    loansProcessedThisPeriod: number;
    loanValueThisPeriod: number;
    activeLoans: number;
  };
}

export function getDashboardMetrics({ data }: DashboardMetricsInput): {
  primary: MetricProps[];
  secondary: MetricProps[];
} {
  return {
    primary: [
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
    ],

    secondary: [
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
    ],
  };
}

export const reports: MetricProps[] = [
  {
    title: "Total Reports",
    value: "42,094",
    change: "+6% this month",
    changeColor: "green",
    border: false,
  },
  {
    title: "Missed Reports",
    value: "15,350",
    change: "+6% this month",
    changeColor: "green",
    border: true,
  },
];

export const loans: MetricProps[] = [
  {
    title: "Total Loans",
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

  {
    title: "Completed  Loans",
    value: "15,350",
    change: "+6% this month",
    changeColor: "green",
    border: true,
  },
];

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
];

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
