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
  purpose: Purpose.Password_reset;
}

export interface VerifyOtpResponse {
  message: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
  otp: string | null;
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
}

//Generic response type
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface BackendValidationErrors {
  [field: string]: string[] | string;
}

export interface ValidationErrorResponse {
  message?: string;
  errors?: BackendValidationErrors;
}
