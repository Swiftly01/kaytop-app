import { profileService } from "@/app/services/profileService";
import { SettingsService } from "@/app/services/settingsService";
import { ApiResponseError } from "@/app/types/auth";
import { ProfileResponse } from "@/app/types/settings";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
// import { profileService } from "@/app/services/profileService";

export function useMyProfile() {
  const { isLoading, error, data } = useQuery<
    ProfileResponse,
    AxiosError<ApiResponseError>
  >({
    queryKey: ["my-profile"],
    queryFn: () => SettingsService.getMyProfile(),
  });

  return { isLoading, error, data };
}
