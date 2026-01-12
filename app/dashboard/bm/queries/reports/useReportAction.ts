import { useUrlParam } from "@/app/hooks/useUrlParam";
import { ReportService } from "@/app/services/reportService";
import { PaginationKey } from "@/app/types/dashboard";
import { ApproveFormData } from "@/app/types/report";
import { handleAxiosError } from "@/lib/errorHandler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { UseFormReset, UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";

type Action = "approve" | "decline";

export function useReportAction(
  action: Action,
  setError: UseFormSetError<ApproveFormData>,
  reset: UseFormReset<ApproveFormData>,
  onSuccessClose?: () => void
) {
   const queryClient = useQueryClient();

  const reportId = useUrlParam<number>(PaginationKey.report_id, (value) =>
    Number(value ?? 0)
  );

  const { mutate: reportAction, isPending } = useMutation({
    mutationFn: (data: ApproveFormData) => {
      return action === "approve"
        ? ReportService.approveReport({ data, reportId })
        : ReportService.declineReport({ data, reportId });
    },
    onError: (error: AxiosError) => {
      handleAxiosError(error, setError);
    },
    onSuccess: () => {
      reset();
      toast.success(
        action === "approve"
          ? `You have successfully approved report ${reportId}`
          : `You have successfully declined report ${reportId}`
      );
       queryClient.invalidateQueries({
        queryKey: ["report-by-id", reportId],
      });
      onSuccessClose?.();
    },
  });

  return { reportAction, isPending };
}
