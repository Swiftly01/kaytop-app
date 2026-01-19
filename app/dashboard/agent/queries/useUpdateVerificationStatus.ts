import { UserService } from "@/app/services/userService";
import { ApiResponseError } from "@/app/types/auth";
import { CustomerDataResponse } from "@/app/types/customer";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useUpdateVerificationStatus(userId: number) {
  return useMutation<
    { message: string },
    AxiosError<ApiResponseError>,
    "verified" | "rejected" | "pending"
  >({
    mutationFn: (status) =>
      UserService.updateVerificationStatus(userId, status),
  });
}
