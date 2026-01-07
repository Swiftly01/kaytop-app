import { CreditService } from "@/app/services/creditService";
import { CreditOfficerErrorResponse, CreditOfficerProfileResponse } from "@/app/types/creditOfficer";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";

export function useGetCreditOfficerById() {
  const { officerId } = useParams();

  const { isLoading, error, data } = useQuery<
    CreditOfficerProfileResponse,
    AxiosError<CreditOfficerErrorResponse>
  >({
    queryKey: ["officerId", officerId],
    queryFn: ({ queryKey }) => {
      const [, officerId] = queryKey as [string, number];
      return CreditService.getStaffById( Number(officerId));
    },
    enabled: !!officerId,
  });

  return { isLoading, error, data };
}
