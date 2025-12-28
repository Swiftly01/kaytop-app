import { Meta } from "./dashboard";

export interface CustomerMetrics {
  activeLoans: number;
}

export interface CustomerData {
  accountStatus: string;
  address: string;
  branch: string;
  createdAt: string;
  createdAtBy?: string | null;
  dob: string;
  email: string;
  firstName: string;
  guarantorAddress: string;
  guarantorEmail: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorPicture: string;
  id: number;
  idNumber: string;
  idPicture: string;
  idType: string;
  isVerified: boolean;
  lastName: string;
  mobileNumber: string;
  profilePicture: string;
  role: string;
  state: string;
  updatedAt?: string | null;
  verificationStatus: string;
  verifiedAt: string;
}

export interface CustomerDataResponse {
  data: CustomerData;
}

export interface CustomerListResponse {
  data: CustomerData[];
  meta?: Meta;
}

export interface Transactions {
  amount: string;
  createdAt: string;
  description: string;
  id: number;
  isApproved: boolean;
  loanId?: string | null;
  requiresManagerAuth: boolean;
  savingsId: number;
  type: string;
}

export interface CustomerSavingsData {
  balance: string;
  createdAt: string;
  id: number;
  transactions: Transactions[];
}

export interface CustomerSavingsResponse {
  data: CustomerSavingsData;
  meta?: Meta;
}