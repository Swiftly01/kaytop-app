import { SettingsService } from "@/app/services/settingsService";
import { UpdateProfileData } from "@/app/types/settings";
import { handleAxiosError } from "@/lib/errorHandler";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { UseFormReset, UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";

export function useUpdateProfile(
  setError: UseFormSetError<UpdateProfileData>,
  reset: UseFormReset<UpdateProfileData>
) {
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: SettingsService.updateProfile,
    onError: (error: AxiosError) => {
      handleAxiosError(error, setError);
    },
    onSuccess: (_response, variables) => {
      reset(variables);
      toast.success("You have successfully update your profile");
    },
  });

  return { updateProfile, isPending };
}
