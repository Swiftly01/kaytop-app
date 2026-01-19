import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { CustomerData } from "../types/customer";
import { ProfileResponse, UpdateProfileData, UploadAvatarResponse } from "../types/settings";
import { AxiosError } from "axios";

export class SettingsService {
   static async updateProfile(data: UpdateProfileData): Promise<CustomerData> {
    const response = await apiClient.patch(`${apiBaseUrl}/users/me`, data);
    //console.log(response);
    return response.data;
  }

  static async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.patch(
      `${apiBaseUrl}/users/me/profile-picture`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  static async getMyProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/users/profile`);
      return response.data;
    } catch (error) {
      throw error as AxiosError;
    }
  }


 
}
