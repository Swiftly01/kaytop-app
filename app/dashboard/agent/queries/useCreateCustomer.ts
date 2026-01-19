import { UserService } from "@/app/services/userService";
import { ApiResponseError } from "@/app/types/auth";
import { CustomerDataResponse } from "@/app/types/customer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation<
    CustomerDataResponse,
    AxiosError<ApiResponseError>,
    FormData
  >({
    mutationFn: (formData) => UserService.createCustomer(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

