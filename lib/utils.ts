import { StatusBadge } from "@/app/dashboard/agent/loans/page";
import { CreditOfficerProfile, Summary } from "@/app/types/creditOfficer";
import { CustomerData } from "@/app/types/customer";
import { DashboardKpi, MetricProps, SummaryProps } from "@/app/types/dashboard";
import {
  ActiveLoanData,
  LoanDetailsApiResponse,
  SavingsProgressResponse,
} from "@/app/types/loan";
import {
  ReportById,
  ReportByIdResponse,
  ReportStatus,
  ReportType,
} from "@/app/types/report";
import { MenuItem, Routes } from "@/app/types/routes";
import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

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
  User: {
    Auth: {
      LOGIN: "/auth/user/login",
      VERIFY_OTP: "/auth/user/verify-otp",
      FORGOT_PASSWORD: "/auth/user/forgot-password",
      RESET_PASSWORD: "/auth/user/reset-password",
    },
  }
};

export function formatDate(date?: string | Date | null) {
  return date ? dayjs(date).format("YYYY-MM-DD") : "-";
}

export const formatCurrency = (value?: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value ?? 0);
};

export function isActiveRoute(pathname: string, item: MenuItem) {
  return item.exact
    ? pathname === item.link
    : pathname.startsWith(`${item.link}`);
}

export function getLinkClass(isActive: boolean) {
  return isActive ? "text-white before:w-full" : "";
}

interface DashboardMetrics {
  totalCreditOfficers: number;
  loansProcessedThisPeriod: number;
  loanValueThisPeriod: number;
  activeLoans: number;
}

interface DashboardMetricsInput {
  data?: DashboardMetrics;
}

interface DashboardReportMetrics {
  data?: DashboardKpi;
}

interface BranchLoanMetrics extends DashboardMetrics {
  totalLoans: number;
  overdueLoans: number;
}

interface BranchLoanMetricsInput {
  data?: BranchLoanMetrics;
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
        value: data?.totalCreditOfficers.toString(),
        border: true,
      },
      {
        title: "Loans Processed",
        value: data?.loansProcessedThisPeriod.toString(),
        border: true,
      },
      {
        title: "Loan Amount",
        value: formatCurrency(data?.loanValueThisPeriod),
        border: true,
      },
    ],

    secondary: [
      {
        title: "Active Loan",
        value: data?.activeLoans.toString(),
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

export function getCreditOfficerMetrics({
  data,
}: DashboardMetricsInput): MetricProps[] {
  return [
    {
      title: "Total Credit Officers",
      value: data?.totalCreditOfficers.toString(),
      border: false,
    },
  ];
}

export function getCreditOfficerIdMetrics(data: Summary): MetricProps[] {
  return [
    {
      title: "Completed Loans",
      value: data.completedLoans.toString(),
      border: false,
    },
    {
      title: "Active Loans",
      value: data.activeLoans.toString(),
      border: true,
    },
    {
      title: "Loans Processed",
      value: formatCurrency(data.totalAmountDisbursed),
      border: true,
    },
    {
      title: "Loan Repaid",
      value: formatCurrency(data.totalAmountRepaid),
      border: true,
    },
  ];
}

export function getCreditOfficerProfileSummary(
  data: CreditOfficerProfile
): SummaryProps[] {
  return [
    { label: "Customer Name", value: `${data.firstName} ${data.lastName}` },
    { label: "CO ID", value: data.id.toString() },
    { label: "Date Joined", value: formatDate(data.createdAt) },
    { label: "Email Address", value: data.email },
    { label: "Phone Number", value: data?.mobileNumber },
    { label: "Gender", value: "N/A" },
  ];
}

export function getBranchCustomerProfileSummary(
  data: CustomerData
): SummaryProps[] {
  if (!data) return [];
  return [
    { label: "Customer Name", value: `${data.firstName} ${data.lastName}` },
    { label: "User ID", value: data.id.toString() },
    { label: "Date Joined", value: formatDate(data.createdAt) },
    { label: "Email Address", value: data.email },
    { label: "Phone Number", value: data.mobileNumber },
    { label: "Address", value: data.address ?? "N/A" },
  ];
}

export function getActiveLoanSummary(data: ActiveLoanData): SummaryProps[] {
  if (!data) return [];
  return [
    { label: "Loan Id", value: `LoanID  ${data.id}` },
    { label: "Loan Amount", value: formatCurrency(Number(data.amount)) },
    {
      label: "Outstanding",
      value: formatCurrency(Number(data.totalRepayable)),
    },
    { label: "Amount Paid", value: formatCurrency(Number(data.amountPaid)) },
    { label: "Intrest Rate", value: data.interestRate },
    { label: "Disbursement Date", value: formatDate(data.disbursementDate) },
    { label: "Duedate", value: formatDate(data.dueDate) },
  ];
}

export function getBranchLoanMetrics({
  data,
}: BranchLoanMetricsInput): MetricProps[] {
  return [
    {
      title: "Total Loans",
      value: data?.totalLoans.toString(),
      border: false,
    },
    {
      title: "Active Loans",
      value: data?.activeLoans.toString(),
      border: true,
    },

    {
      title: "Completed  Loans",
      value: data?.loansProcessedThisPeriod.toString(),
      border: true,
    },
  ];
}

export function getUserBranchLoanMetrics({
  data,
}: BranchLoanMetricsInput): MetricProps[] {
  return [
    {
      title: "Total Loans",
      value: data?.totalLoans.toString(),
      border: false,
    },
    {
      title: "Active Loans",
      value: data?.activeLoans.toString(),
      border: true,
    },
    {
      title: "Missed Loans",
      value: data?.overdueLoans.toString(),
      border: true,
    }
  ];
}

export function getCustomerMetrics({
  data,
}: DashboardMetricsInput): MetricProps[] {
  return [
    {
      title: "Total Customers",
      value: "N/A",
      border: false,
    },
    {
      title: "Active Loans",
      value: data?.activeLoans.toString(),
      border: true,
    },
  ];
}

export function getReportMetrics({
  data,
}: DashboardReportMetrics): MetricProps[] {
  
  return [
    {
      title: "Total Reports",
      value: data?.reportStats.totalReports.toString(),
      border: false,
    },
    {
      title: "Total Approved",
      value: data?.reportStats.totalApproved.toString(),
      border: true,
    },
     {
      title: "Total Pending",
      value: data?.reportStats.totalPending.toString(),
      border: true,
    },
     {
      title: "Total Declined",
      value: data?.reportStats.totalDeclined.toString(),
      border: true,
    },
  ];
}

export function mapSavingsProgressData(
  data: SavingsProgressResponse
): SummaryProps[] {
  return [
    { label: "Current Balance", value: data.currentBalance },
    { label: "Remaining Amount", value: data.remainingAmount },
    { label: "Total Deposited", value: data.totalDeposited },
    { label: "Total Withdrawn", value: data.totalWithdrawn },
  ];
}

export function mapLoanRepaymentProgessData(
  data: ActiveLoanData
): SummaryProps[] {
  return [
    { label: "Total Repayable", value: Number(data.totalRepayable) },
    { label: "Amount Paid", value: Number(data.amountPaid) },
  ];
}

export function mapLoanDetailsData(
  data: LoanDetailsApiResponse
): SummaryProps[] {
  return [
    { label: "Loan Id", value: data.loanDetails.id },
    { label: " CO In-charge", value: data.createdBy.name },
    { label: "Branch", value: data.createdBy.branch },
  ];
}

export function mapUserLoanDetailsData(
  data: LoanDetailsApiResponse
): SummaryProps[] {
  return [
    { label: "Loan Id", value: data.loanDetails.id },
    { label: "Borrower", value: (data.customerDetails.firstName + " " + data.customerDetails.lastName) },
  ];
}

export function mapOtherLoanDetailsData(
  data: LoanDetailsApiResponse
): SummaryProps[] {
  return [
    {
      label: "Amount borrowed",
      value: formatCurrency(Number(data.loanDetails.amount)),
    },
    { label: "Date disbursed", value: formatDate(data.loanDetails.createdAt) },
  ];
}

export function mapLoanIntrestData(
  data: LoanDetailsApiResponse
): SummaryProps[] {
  return [
    { label: "Intrest Rate", value: `${data.loanDetails.interestRate}%` },
     { label: "Loan status", value:  data.loanDetails.status.toUpperCase() },
  ];
}

export function mapReportDetails(data: ReportById): SummaryProps[] {
  return [
    { label: "Report Id", value: `ReportId ${data.id}` },
    { label: "Credit Officer", value: data.submittedBy.role.replace("_", " ") },
    { label: "Branch", value: data.branch },
  ];
}

export function mapReportLoanDetails(data: ReportById): SummaryProps[] {
  return [
    {
      label: "Loans Disbursed",
      value: formatCurrency(Number(data.totalLoansDisbursed)),
    },
    {
      label: " Loans Recollections",
      value: formatCurrency(Number(data.totalRecollections)),
    },
    {
      label: "Savings Collected",
      value: formatCurrency(Number(data.totalSavingsProcessed)),
    },
    {
      label: "Repayments Collected",
      value: formatCurrency(Number(data.totalRecollections)),
    },
    {
      label: "Date Sent",
      value: formatDate(data.reportDate),
    },
    {
      label: "Start Date",
      value: data.startDate,
    },
    {
      label: "Description",
      value: data.description,
    },
    {
      label: "Title",
      value: data.title,
    },
    {
      label: "Branch",
      value: data.branch,
    },
  ];
}

//Type predicate
export function isReportStatus(value: string): value is ReportStatus {
  return Object.values(ReportStatus).includes(value as ReportStatus);
}

export function isReportType(value: string | null): value is ReportType {
  return (
    typeof value === "string" &&
    REPORT_TYPE_OPTIONS.some((option) => option.value === value)
  );
}

export const REPORT_TYPE_OPTIONS: { value: ReportType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
];

// const status = getEnumParam(
//   searchParams.get("status"),
//   Object.values(ReportStatus),
//   ReportStatus.PENDING
// );

// export function getEnumParam<T extends string>(
//   value: string | null,
//   allowed: readonly T[],
//   fallback: T
// ): T {
//   return value && allowed.includes(value as T) ? (value as T) : fallback;
// }

// export const data: MetricProps[] = [
//   {
//     title: "All Customers",
//     value: "42,094",
//     change: "+6% this month",
//     changeColor: "green",
//     border: false,
//   },
//   {
//     title: "All CO's",
//     value: "15,350",
//     change: "+6% this month",
//     changeColor: "green",
//     border: true,
//   },
//   {
//     title: "Loans Processed",
//     value: "28,350",
//     change: "-26% this month",
//     changeColor: "red",
//     border: true,
//   },
//   {
//     title: "Loan Amount",
//     value: "₦50,350.00",
//     change: "+40% this month",
//     changeColor: "green",
//     border: true,
//   },
// ];
