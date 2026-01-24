import { useUrlParam } from "@/app/hooks/useUrlParam";
import { ReportService } from "@/app/services/reportService";
import { PaginationKey } from "@/app/types/dashboard";
import { SubmitHqReportFormData } from "@/app/types/report";
import { handleAxiosError } from "@/lib/errorHandler";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { UseFormReset, UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";

export function useSubmitReportToHq(
  setError: UseFormSetError<SubmitHqReportFormData>,
  reset: UseFormReset<SubmitHqReportFormData>,
  closeModal: () => void,
  setIsOpen: (open: boolean) => void,
) {
  
  const { mutate: submitReport, isPending } = useMutation({
    mutationFn: ReportService.submitReportToHq,
    onSuccess: () => {
      reset();
      toast.success("Report Sumitted to HQ successfully");
      closeModal();
      setIsOpen(false); 
    },
    onError: (error: AxiosError) => handleAxiosError(error, setError),
  });

  return { submitReport, isPending };
}
