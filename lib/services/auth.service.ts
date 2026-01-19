// services/auth.service.ts
import apiClient from "../apiClient";
import { API_ENDPOINTS } from "../api/config";

export const AuthService = {
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
    state: string;
    branch: string;
  }) => apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, data),

  login: (data: {
    email: string;
    password: string;
  }) => apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data),

  forgotPassword: (email: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
};
