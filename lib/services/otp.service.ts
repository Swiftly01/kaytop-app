// services/otp.service.ts

import { API_ENDPOINTS } from "../api/config";
import apiClient from "../apiClient";


export type OtpPurpose = "password_reset" | "email_verification";

export const OtpService = {
  send: (data: {
    email: string;
    purpose: OtpPurpose;
  }) => apiClient.post(API_ENDPOINTS.OTP.SEND, data),

  verify: (data: {
    email: string;
    code: string;
    purpose: OtpPurpose;
  }) => apiClient.post(API_ENDPOINTS.OTP.VERIFY, data),
};
