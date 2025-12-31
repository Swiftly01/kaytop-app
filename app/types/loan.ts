import { Meta } from "./dashboard";

interface Borrower {
  name: string;
  email: string;
  phone: string;
}

export interface BaseLoan {
  dailyRepayment: string;
  disbursementDate: string;
  dueDate: string;
  interestRate: string;
  status: string;
  totalRepayable: string;
}

export interface LoanData extends BaseLoan {
  amount: string;
  borrower: Borrower;
  disbursedBy: string;
}

export interface LoanDetails extends BaseLoan {
  loanAmount: string;
  term: number;
}

export interface BranchLoanResponse {
  data: LoanData[];
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

export interface Schedule {
  day: number;
  dueAmount: number;
  dueDate: string;
  paidAmount: number;
  remainingBalance: number;
  shortfall: number;
  status: string;
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
  schedule: Schedule[];
  summary: Summary;
  userId: number;
  userName: string;
}

export interface PaymentScheduleResponse {
  data: PaymentSchedule;
  meta?: Meta;
}
