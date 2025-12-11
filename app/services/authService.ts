import { apiBaseUrl } from "@/lib/config";
import axios from "axios";
import {
  ForgotPasswordData,
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  OtpData,
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
    const response = await axios.post<VerifyOtpResponse>(`${apiBaseUrl}/otp/send`, data);
   // console.log(response);
    return response.data;
  }
}
