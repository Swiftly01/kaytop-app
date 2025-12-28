import { Meta } from "./dashboard";

export interface CustomerMetrics {
  activeLoans: number;
}

export interface CustomerData {
  branch: string;
  email: string;
  firstName: string;
  id: number;
  lastName: string;
  mobileNumber: string;
  profilePicture?: string | null;
  state: string;
}

export interface CustomerListResponse{
  data: CustomerData[];
  meta?: Meta
}
