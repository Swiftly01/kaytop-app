import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "../services/userService";




export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: { firstName: string; lastName: string };
    }) => UserService.updateCustomer(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["branch-customers"],
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => UserService.deleteCustomer(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["branch-customers"],
      });
    },
  });
}
