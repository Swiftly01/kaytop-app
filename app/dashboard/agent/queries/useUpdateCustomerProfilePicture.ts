import { UserService } from "@/app/services/userService";
import { ApiResponseError } from "@/app/types/auth";
import { CustomerDataResponse } from "@/app/types/customer";
import { UploadAvatarResponse } from "@/app/types/settings";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";


export function useUpdateCustomerProfilePicture(userId: number) {
  return useMutation<
    UploadAvatarResponse,
    AxiosError<ApiResponseError>,
    FormData
  >({
    mutationFn: (formData) =>
      UserService.updateCustomerProfilePicture(userId, formData),
  });
}
