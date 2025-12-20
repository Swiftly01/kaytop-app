export interface MetricProps {
  title: string;
  value: string;
  change?: string;
  changeColor?: "green" | "red";
  border: boolean;
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
}

export interface LoanDisbursedItem {
  amount: number;
  dateDisbursed: string;
  interest: number;
  name: string;
  status: string;
}

export interface Meta {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface LoanDisbursedResponse {
  data: LoanDisbursedItem[];
  meta: Meta;
}
