import { Meta } from "./dashboard";

export interface BaseLoanData {
  amount: string;
  amountPaid: string;
  createdAt: string;
  customerBranch: string;
  customerName: string;
  daysOverdue: number;
  id: number;
  loanId: number;
  remainingBalance: string;
  dailyRepayment: string;
  disbursementDate: string;
  dueDate: string;
  interestRate: string;
  status: string;
  totalRepayable: string;
}

export interface LoanDetails extends BaseLoanData {
  loanAmount: string;
  term: number;
}

export interface BranchLoanApiResponse {
  loans: BaseLoanData[];
  page: number;
  total: number;
  totalPages: number;
}

export interface BranchLoanResponse {
  data: BaseLoanData[];
  meta?: Meta;
}

export interface ActiveLoanData {
  amount: string;
  amountPaid: string;
  createdAt: string;
  dailyRepayment: string;
  daysOverdue: number;
  disbursementDate: string;
  disbursementProof: string;
  disbursementProofPublicId: string;
  dueDate: string;
  id: number;
  interestRate: string;
  remainingBalance: string;
  repayments: string[];
  status: string;
  term: number;
  totalRepayable: string;
}

export interface Items {
  day: number;
  dueAmount: number;
  dueDate: string;
  paidAmount: number;
  remainingBalance: number;
  shortfall: number;
  status: string;
}

export interface Schedule {
  items: Items[];
  pagination?: Meta;
}

export interface Summary {
  averageDailyPayment: number;
  completionPercentage: number;
  daysOverdue: number;
  daysPaid: number;
  daysPartial: number;
  daysPending: number;
  daysUpcoming: number;
  overdueAmount: number;
  remainingBalance: string;
  totalDue: number;
  totalPaid: number;
}

export interface PaymentSchedule {
  loanDetails: LoanDetails;
  loanId: number;
  schedule: Schedule;
  summary: Summary;
  userId: number;
  userName: string;
}

export interface SavingsProgressResponse {
  currentBalance: number;
  daysSinceStart: number;
  isTargetAchieved: boolean;
  progressPercentage: number;
  remainingAmount: number;
  targetAmount: number;
  targetDescription: string;
  totalDeposited: number;
  totalWithdrawn: number;
}

interface CreatedBy {
  branch: string;
  id: number;
  name: string;
  role: string;
}

export interface CustomerDetails {
  branch: string;
  email: string;
  firstName: string;
  id: number;
  lastName: string;
  phone: string;
}

interface DisbursedBy {
  id: number;
  name: string;
  role: string;
}

interface DailyPaymentStatus {
  expectedDaily: string;
  actualAverageDaily: number;
  efficiency: number;
}

interface FinancialSummary {
  amountPaid: number;
  dailyPaymentStatus: DailyPaymentStatus;
  percentagePaid: number;
  principalAmount: string;
  remainingBalance: number;
  totalInterest: number;
  totalRepayable: number;
}

interface NextPayment {
  amountDue: string;
  dueDate: string;
  status: string;
}

interface RecordedBy {
  id: number;
  name: string;
}

export interface RepaymentHistory {
  amount: string;
  createdAt: string;
  id: number;
  installmentNumber: number;
  isLate: boolean;
  paymentDate: string;
  proof: string;
  proofPublicId: string;
  recordedBy: RecordedBy;
}
export interface LoanDetailsApiResponse {
  createdBy: CreatedBy;
  customerDetails: CustomerDetails;
  disbursedBy: DisbursedBy;
  financialSummary: FinancialSummary;
  loanDetails: LoanDetails;
  nextPayment: NextPayment;
  overdueInfo?: string | null;
  repaymentHistory: RepaymentHistory[];
}

export interface LoanDetailsResponse {
  data: LoanDetailsApiResponse;
  meta?: Meta

}

/* ===================== LOAN SUMMARY ===================== */

export interface LoanSummaryResponse {
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  overdueLoans: number;
  totalOutstanding: number;
}

/* ===================== DISBURSEMENT SUMMARY ===================== */

export interface DisbursementSummaryResponse {
  totalDisbursed: number;
  totalLoansDisbursed: number;
  averageLoanAmount: number;
}
