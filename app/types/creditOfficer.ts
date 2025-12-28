import { BadgeStatus } from "../_components/ui/Badge";
import { Meta } from "./dashboard";

export interface BaseCreditOfficer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  branch: string;
  createdAt: string;
}

export interface CreditOfficerData extends BaseCreditOfficer {
  createdBy: CreatedByData;
}

interface DateRange {
  start: string;
  end: string;
}

export interface Summary {
  activeLoans: number;
  averageLoanSize: number;
  completedLoans: number;
  officerId: number;
  repaymentRate: number;
  totalAmountDisbursed: number;
  totalAmountRepaid: number;
  totalLoansDisbursed: number;
  totalOutstandingBalance: number;
}

type LoanStatus = BadgeStatus;

export interface Loan {
  amountPaid: string;
  customerName: string;
  disbursementDate: string;
  id: number;
  interestAmount: number;
  interestRate: string;
  principal: string;
  remainingBalance: string;
  status: LoanStatus;
  totalRepayable: string;
}

export interface CreditOfficerLoanDisbursedData {
  dateRange: DateRange;
  loans: Loan[];
  summary: Summary;
}

export interface CreatedByData {
  email: string;
  firstName: string;
  id: number;
  lastName: string;
}

export interface CreditOfficerErrorResponse {
  message?: string;
}

export interface CreditOfficerListResponse {
  data: CreditOfficerData[];
  meta?: Meta;
}

export interface CreditOfficerLoanDisbursedResponse {
  data: CreditOfficerLoanDisbursedData;
  meta?: Meta;
}

interface LoanDetails {
  loanAmount: string;
  loanStatus: string;
  remainingBalance: string;
}

export interface Collections {
  amount: string;
  collectionType: string;
  customerId: number;
  customerName: "Emerald Greg";
  id: number;
  loanDetails?: LoanDetails;
  paymentDate: string;
}

export interface CreditOfficerLoanCollectionData {
  collections: Collections[];
  meta?: Meta;
}

export interface CreditOfficerLoanCollectionResponse {
  data: CreditOfficerLoanCollectionData;
  meta?: Meta;
}

export interface CreditOfficerProfile extends BaseCreditOfficer {
  accountStatus: string;
  address: string;
  dob: string | null;
  mobileNumber: string;
  state: string;

  profilePicture: string | null;

  guarantorAddress: string | null;
  guarantorEmail: string | null;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorPicture: string | null;

  idNumber: number | null;
  idPicture: number | null;
  idType: string | null;

  isVerified: boolean;
  verificationStatus: string;
  verifiedAt: string | null;
  verifiedBy: string | null;

  updatedAt: string | null;
}

export interface CreditOfficerProfileResponse {
  data: CreditOfficerProfile;
}
