import { UserService } from "@/app/services/userService";
import { ApiResponseError } from "@/app/types/auth";
import { CustomerDataResponse } from "@/app/types/customer";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useUpdateIdVerification(userId: number) {
  return useMutation<
    CustomerDataResponse,
    AxiosError<ApiResponseError>,
    FormData
  >({
    mutationFn: (formData) =>
      UserService.updateIdVerification(userId, formData),
  });
}

