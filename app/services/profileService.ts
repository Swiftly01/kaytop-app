import apiServer from "@/lib/apiServer";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import { ProfileResponse } from "../types/settings";

export class profileService {
  static async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiServer.get(`${apiBaseUrl}/auth/profile`);
      
      // Handle multiple response formats
      let profileData = response.data;
      
      // If response is wrapped in a success/data structure
      if (profileData && typeof profileData === 'object' && 'success' in profileData && profileData.success && 'data' in profileData) {
        profileData = profileData.data;
      }
      
      // If response has nested data.data structure
      if (profileData && typeof profileData === 'object' && 'data' in profileData && profileData.data && typeof profileData.data === 'object' && 'id' in profileData.data) {
        profileData = profileData.data;
      }
      
      // Validate we have profile data with an id
      if (!profileData || typeof profileData !== 'object' || !('id' in profileData)) {
        console.error('❌ Invalid profile response format. Response structure:', {
          hasData: !!profileData,
          hasId: profileData && 'id' in profileData,
          responseKeys: profileData ? Object.keys(profileData) : [],
          responseType: typeof profileData,
          response: profileData
        });
        throw new Error('Invalid profile response format');
      }
      
      return profileData;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching profile", err.response?.data);
      throw err;
    }
  }


 
}
