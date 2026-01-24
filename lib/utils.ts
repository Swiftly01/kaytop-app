import { CreditOfficerProfile, Summary } from "@/app/types/creditOfficer";
import { CustomerData } from "@/app/types/customer";
import { DashboardKpi, MetricProps, SummaryProps } from "@/app/types/dashboard";
import {
  ActiveLoanData,
  LoanDetailsApiResponse,
  SavingsProgressResponse,
} from "@/app/types/loan";
import { ReportStatus } from "@/app/types/report";
import { MenuItem, Routes } from "@/app/types/routes";
import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { User } from "./api/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ROUTES: Routes = {
  Auth: {
    LOGIN: "/auth/login",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_OTP: "/auth/verify-otp",
    RESET_PASSWORD: "/auth/reset-password",
  },
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
      FORGOT_PASSWORD: "/auth/user/forgot-password",
      VERIFY_OTP: "/auth/user/verify-otp",
      RESET_PASSWORD: "/auth/user/reset-password",
    },
  },
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
  // Report statistics
  totalReports?: number;
  pendingReports?: number;
  approvedReports?: number;
  missedReports?: number;
  totalReportsGrowth?: number;
  pendingReportsGrowth?: number;
  approvedReportsGrowth?: number;
  missedReportsGrowth?: number;
}

interface DashboardMetricsInput {
  data?: DashboardMetrics;
}

interface BranchLoanMetrics extends DashboardMetrics {
  totalLoans: number;
}

interface BranchLoanMetricsInput {
  data?: BranchLoanMetrics;
}


interface DashboardReportMetrics {
  data?: DashboardKpi;
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
        title: "Total Reports",
        value: data?.totalReports?.toString() || "N/A",
        change: data?.totalReportsGrowth ? `${data.totalReportsGrowth >= 0 ? '+' : ''}${data.totalReportsGrowth}% this month` : undefined,
        changeColor: data?.totalReportsGrowth && data.totalReportsGrowth >= 0 ? "green" : "red",
        border: true,
      },
      {
        title: "Pending Reports",
        value: data?.pendingReports?.toString() || "N/A",
        change: data?.pendingReportsGrowth ? `${data.pendingReportsGrowth >= 0 ? '+' : ''}${data.pendingReportsGrowth}% this month` : undefined,
        changeColor: data?.pendingReportsGrowth && data.pendingReportsGrowth >= 0 ? "green" : "red",
        border: true,
      },
      {
        title: "Missed Reports",
        value: data?.missedReports?.toString() || "N/A",
        change: data?.missedReportsGrowth ? `${data.missedReportsGrowth >= 0 ? '+' : ''}${data.missedReportsGrowth}% this month` : undefined,
        changeColor: data?.missedReportsGrowth && data.missedReportsGrowth >= 0 ? "red" : "green", // Inverted: less missed reports is good
        border: true,
      },
    ],
  };
}

export function getCreditOfficerMetrics({
  data,
}: DashboardMetricsInput): MetricProps[] {
  // Based on Postman investigation: Both System Admin and HQ Manager 
  // get totalCreditOfficers as a number from /dashboard/kpi endpoint
  const creditOfficerCount = data?.totalCreditOfficers || 0;
  
  return [
    {
      title: "Total Credit Officers",
      value: creditOfficerCount.toString(),
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



export function getBmReportMetrics({
  data,
}: DashboardReportMetrics): MetricProps[] {
  return [
    {
      title: "Total Reports",
      value: data?.reportStats?.totalReports?.toString(),
      border: false,
    },
    {
      title: "Total Approved",
      value: data?.reportStats?.totalApproved?.toString(),
      border: true,
    },
    {
      title: "Total Declined",
      value: data?.reportStats?.totalDeclined?.toString(),
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

export function mapOtherLoanDetailsData(
  data: LoanDetailsApiResponse
): SummaryProps[] {
  return [
    { label: "Amount borrowed", value: formatCurrency(Number(data.loanDetails.amount)) },
    { label: "Date disbursed", value:formatDate(data.loanDetails.createdAt) },
  ];
}

export function mapLoanIntrestData(
  data: LoanDetailsApiResponse
): SummaryProps[] {
  return [
    { label: "Intrest Rate", value: data.loanDetails.interestRate },
    { label: "Loan status", value:data.loanDetails.status },
  ];
}



// Helper function to generate report metrics from real data
export function getReportMetrics(reportStats?: {
  totalReports: number;
  missedReports: number;
  totalReportsGrowth: number;
  missedReportsGrowth: number;
}): MetricProps[] {
  return [
    {
      title: "Total Reports",
      value: reportStats?.totalReports?.toString() || "0",
      change: reportStats?.totalReportsGrowth ? `${reportStats.totalReportsGrowth >= 0 ? '+' : ''}${reportStats.totalReportsGrowth}% this month` : undefined,
      changeColor: reportStats?.totalReportsGrowth && reportStats.totalReportsGrowth >= 0 ? "green" : "red",
      border: false,
    },
    {
      title: "Missed Reports",
      value: reportStats?.missedReports?.toString() || "0",
      change: reportStats?.missedReportsGrowth ? `${reportStats.missedReportsGrowth >= 0 ? '+' : ''}${reportStats.missedReportsGrowth}% this month` : undefined,
      changeColor: reportStats?.missedReportsGrowth && reportStats.missedReportsGrowth >= 0 ? "red" : "green", // Inverted: less missed reports is good
      border: true,
    },
  ];
}

// Deprecated: Use getReportMetrics() with real data instead
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
// Report type validation and options
export const REPORT_TYPE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
] as const;

export function isReportType(value: string | null): value is "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "custom" {
  return value !== null && ["daily", "weekly", "monthly", "quarterly", "annual", "custom"].includes(value);
}

export function isReportStatus(value: string | null): value is ReportStatus {
  return value !== null && ["pending", "approved", "declined", "draft", "submitted", "forwarded"].includes(value);
}
// Report mapping functions
interface ReportData {
  id?: string | number;
  title?: string;
  description?: string;
  branch?: string;
  state?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
  reportDate?: string;
  submittedAt?: string;
  submittedBy?: User;
  [key: string]: unknown;
}

interface LoanReportData {
  totalLoans?: number;
  totalAmount?: string | number;
  activeLoans?: number;
  completedLoans?: number;
  overdueLoans?: number;
  averageAmount?: string | number;
  remarks?: string;
  declineReason?: string;
  totalSavingsProcessed?: number;
  totalRecollections?: number;
  totalLoansDisbursed?: number;
  [key: string]: unknown;
}

export function mapReportDetails(data: ReportData): SummaryProps[] {
  if (!data) return [];
  return [
    { label: "Report ID", value: data.id?.toString() || "N/A" },
    { label: "Title", value: data.title || "N/A" },
    { label: "Description", value: data.description || "N/A" },
    { label: "Branch", value: data.branch || "N/A" },
    { label: "State", value: data.state || "N/A" },
    { label: "Type", value: data.type || "N/A" },
    { label: "Status", value: data.status || "N/A" },
    { label: "Start Date", value: data.startDate ? formatDate(data.startDate) : "N/A" },
    { label: "End Date", value: data.endDate ? formatDate(data.endDate) : "N/A" },
    { label: "Report Date", value: data.reportDate ? formatDate(data.reportDate) : "N/A" },
    { label: "Submitted At", value: data.submittedAt ? formatDate(data.submittedAt) : "N/A" },
    { label: "Submitted By", value: data.submittedBy ? `${data.submittedBy.firstName} ${data.submittedBy.lastName}` : "N/A" },
  ];
}

export function mapReportLoanDetails(data: LoanReportData): SummaryProps[] {
  if (!data) return [];
  return [
    { label: "Total Loans Processed", value: data.totalLoansProcessed?.toString() || "0" },
    { label: "Total Loans Disbursed", value: data.totalLoansDisbursed || "₦0.00" },
    { label: "Total Recollections", value: data.totalRecollections || "₦0.00" },
    { label: "Total Savings Processed", value: data.totalSavingsProcessed || "₦0.00" },
    { label: "Remarks", value: data.remarks || "No remarks" },
    { label: "Decline Reason", value: data.declineReason || "N/A" },
  ];
}