import { apiBaseUrl } from "@/lib/config";
import axios from "axios";
import { ApiResponse, LoginData, LoginResponse } from "../types/auth";

export class AuthService {
  static async login(data: LoginData): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      `${apiBaseUrl}/auth/login`,
      data
    );
    console.log(response);
    return response.data;
  }
}
