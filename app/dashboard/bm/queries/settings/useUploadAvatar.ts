import { SettingsService } from "@/app/services/settingsService";
import { AvatarFormData } from "@/app/types/settings";
import { handleAxiosError } from "@/lib/errorHandler";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { UseFormReset, UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";

export function useUploadAvatar(
  setError: UseFormSetError<AvatarFormData>,
  reset: UseFormReset<AvatarFormData>
) {
  const router = useRouter();
  const { mutate: uploadAvatar, isPending } = useMutation({
    mutationFn: SettingsService.uploadAvatar,
    onError: (error: AxiosError) => {
      handleAxiosError(error, setError);
    },
    onSuccess: () => {
      router.refresh();
      reset();
      toast.success("Profile picture updated successfully");
    },
  });

  return { uploadAvatar, isPending };
}
