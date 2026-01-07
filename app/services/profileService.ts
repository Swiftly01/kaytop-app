import apiServer from "@/lib/apiServer";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import { ProfileResponse } from "../types/settings";

export class profileService {
  static async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiServer.get(`${apiBaseUrl}/auth/profile`);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching profile", err.response?.data);
      throw err;
    }
  }


 
}
