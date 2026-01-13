import { AxiosError } from "axios";
import { ApiResponseError } from "./auth";

export interface MetricProps {
  title: string;
  value?: string;
  change?: string;
  changeColor?: "green" | "red";
  border: boolean;
  sparkline?: number[]; 
}

export interface SummaryProps {
  label: string;
  value?: string | number;
  [key: string]: string | number | undefined;
}

export interface ReportStats {
  totalApproved: number;
  totalDeclined: number;
  totalPending: number;
  totalReports: number;
}

export interface DashboardKpi {
  branch: string;
  timeFilter: string;

  dateRange: {
    start: string;
    end: string;
  };

  // Loans
  totalLoans: number;
  activeLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  overdueLoans: number;
  loansProcessedThisPeriod: number;
  loanValueThisPeriod: number;
  totalDisbursedValue: number;
  totalRepaidValue: number;
  approvalRate: number;
  averageApprovalRate: number;
  averageLoanSize: number;
  defaultRate: number;
  repaymentRate: number;

  // Credit Officers
  totalCreditOfficers: number;
  totalLoansByOfficers: number;
  officerPerformance: unknown[];

  // Savings
  totalSavingsAccounts: number;
  activeSavingsAccounts: number;
  newSavingsAccountsThisPeriod: number;
  totalSavingsBalance: number;
  averageSavingsBalance: number;
  savingsDepositedThisPeriod: number;
  totalWithdrawalsThisPeriod: number;
  totalDepositsThisPeriod: number;
  netSavingsFlow: number;
  savingsActivityRate: number;
  totalSavingsByOfficers: number;

  // Rankings
  topPerformers: unknown[];

  reportStats: ReportStats;
}

type Status = "active" | "scheduled";

export interface LoanDisbursedItem {
  amount: number;
  dateDisbursed: string;
  interest: number;
  name: string;
  status: Status;
}

export interface LoanRecollectionItem {
  amountToBePaid: number;
  dateToBePaid: string;
  name: string;
  status: Status;
}

export interface Meta {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface LoanDisbursedResponse {
  data: LoanDisbursedItem[];
  meta?: Meta;
}

export interface LoanRecollectionResponse {
  data: LoanRecollectionItem[];
  meta?: Meta;
}

export interface LoanDisbursedVolumeResponse {
  date: string;
  loanCount: number;
  totalAmount: number;
}

interface Transaction {
  id: number;
  amount: string;
  type: string;
  createdAt: string;
  // add other fields if transactions have more
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
  state: string;
  branch: string;
  dob: string;
  accountStatus: string;
  verificationStatus: string;
  verifiedAt: string | null;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string | null;
  createdAtBy: string | null;
  profilePicture: string;
  idNumber: string;
  idType: string;
  idPicture: string;
  guarantorName: string;
  guarantorAddress: string;
  guarantorEmail: string;
  guarantorPhone: string;
  guarantorPicture: string;
}

export interface Savings {
  id: number;
  balance: number;
  createdAt: string;
  transactions: Transaction[];
  user: User;
}

export interface MissedPayment {
  amountOwedToday: number;
  interest: string;
  missedDays: number;
  name: string;
  status: Status;
}

export interface SavingsApiResponse {
  data: Savings[];
  meta?: Meta;
}

export interface MissedPaymentResponse {
  data: MissedPayment[];
  meta?: Meta;
}

export interface DashboardKpiResponse {
  message?: string;
}

export enum PaginationKey {
  loan_page = "loanPage",
  recollection_page = "recollectionPage",
  savings_page = "savingsPage",
  missed_payment_page = "missedPaymentPage",
  credit_officers_page = "creditOfficersPage",
  credit_officer_loan_disbursed_Page = "creditOfficerLoanDisbursedPage",
  credit_officer_loan_collection_page = "creditOfficerLoanCollectionPage",
  branch_customer_page = "customerPage",
  branch_customer_savings_page = "branchCustomerSavingsPage",
  branch_loan_page = "branchLoanPage",
  active_loan_id = "loanId",
  payment_schedule_page = "paymentSchedulePage",
  customer_id = "customerId",
  loan_page_id = "loanPageId",
  loan_page_repayment = "loanPageRepayment",
  active_loan_page = "activeLoanPage",
  completed_loan_page = "completeLoanPage",
  report_page = "ReportPage",
  report_type = "reportType",
  report_id = "reportId",
  customer_savings_transactions_page = "customerSavingsTransactionsPage",
}

export interface TableStateProps {
  isLoading: boolean;
  error?: AxiosError<ApiResponseError> | null;
  isEmpty: boolean;
  colSpan: number;
  emptyMessage?: string;
}
