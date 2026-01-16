export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export enum Purpose {
  Password_reset = "password_reset",
  Email_verification = "email_verification",
}

export interface OtpData {
  email: string;
  code?: string;
  // purpose: Purpose.Password_reset;
  purpose: Purpose;
}

export interface VerifyOtpResponse {
  message: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
  otp: string | null;
}

export interface ResetPasswordResponse {
  message: string;
}

export type ApiErrorMessage = string | string[];

export interface ApiErrorResponse {
  statusCode: number;
  message: ApiErrorMessage;
  error: string;
}

export interface LoginResponse {
  access_token: string;
  role: string;
  isVerified: boolean;
}

//Generic response type
export interface ApiResponse<T> {
  data: T;
}

export interface BackendValidationErrors {
  [field: string]: string[] | string;
}

export interface ValidationErrorResponse {
  message?: string;
  errors?: BackendValidationErrors;
}

export interface ApiResponseError {
  message?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface NestValidationErrorResponse {
  statusCode: number;
  message: string[];
  error: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  dob?: string;
  email: string;
  mobileNumber: string;
  password: string;
  branch: string;
  state: string;
}

export interface SignupResponse {
  message: string;
}

