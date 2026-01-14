import apiServer from "@/lib/apiServer";
import { ProfileResponse } from "../types/settings";
import { AxiosError } from "axios";

export class UserProfileService {
  static async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiServer.get(`/auth/profile`);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching profile", err.response?.data);
      throw err;
    }
  }
}