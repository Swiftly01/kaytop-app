import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import axios from "axios";
import {
  ChangePasswordData,
  ForgotPasswordData,
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  OtpData,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupData,
  SignupResponse,
  VerifyOtpResponse,
} from "../types/auth";

export class AuthService {
  static async login(data: LoginData): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      `${apiBaseUrl}/auth/login`,
      data
    );
    // console.log(response);
    return response.data;
  }

  static async forgotPassword(
    data: ForgotPasswordData
  ): Promise<ForgotPasswordResponse> {
    const response = await axios.post<ForgotPasswordResponse>(
      `${apiBaseUrl}/auth/forgot-password`,
      data
    );
    // console.log(response);
    return response.data;
  }

  static async verifyOtp(data: OtpData): Promise<VerifyOtpResponse> {
    const response = await axios.post<VerifyOtpResponse>(
      `${apiBaseUrl}/otp/verify`,
      data
    );
    // console.log(response);
    return response.data;
  }

  static async sendOtp(data: OtpData): Promise<VerifyOtpResponse> {
    const response = await axios.post<VerifyOtpResponse>(
      `${apiBaseUrl}/otp/send`,
      data
    );
    // console.log(response);
    return response.data;
  }

  static async resetPassword(
    data: ResetPasswordData
  ): Promise<ResetPasswordResponse> {
    const response = await axios.post<ResetPasswordResponse>(
      `${apiBaseUrl}/auth/reset-password`,
      data
    );
    // console.log(response);
    return response.data;
  }

  static async changePassword(data: ChangePasswordData) {
    const response = await apiClient.post(
      `${apiBaseUrl}/auth/change-password`,
      data
    );
    console.log(response);
    return response.data;
  }

  static async signup(data: SignupData): Promise<SignupResponse> {
    const response = await axios.post<SignupResponse>(
      `${apiBaseUrl}/auth/signup`,
      data
    );
    return response.data;
  }

}
