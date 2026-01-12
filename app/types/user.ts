/* ===================== REQUEST TYPES ===================== */

export interface UpdateOwnProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
}

export interface VerificationStatusRequest {
  verificationStatus: "verified" | "pending" | "rejected";
}

/* ===================== ADMIN REQUESTS ===================== */

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  profilePicture?: File;
}

export interface GuarantorDetailsRequest {
  guarantorName: string;
  guarantorRelationship: string;
  guarantorPhone: string;
  guarantorPicture?: File;
}

export interface IdVerificationRequest {
  idType: string;
  idNumber: string;
  idPicture?: File;
}

/* ===================== GENERIC RESPONSES ===================== */

export interface ApiMessageResponse {
  message: string;
}
