import { AuthService } from "@/app/services/authService";
import { ChangePasswordData } from "@/app/types/auth";
import { handleAxiosError } from "@/lib/errorHandler";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { UseFormReset, UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";

export function useChangePassword(
  setError: UseFormSetError<ChangePasswordData>,
  reset: UseFormReset<ChangePasswordData>
) {
  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: AuthService.changePassword,
    onError: (error: AxiosError) => {
      handleAxiosError(error, setError);
    },
    onSuccess: () => {
      reset();
      toast.success("You have successfully changed your password");
    },
  });

  return { changePassword, isPending };
}
