import { ReportService } from "@/app/services/reportService";
import { GenerateReportFormData, GenerateReportPostFormData, GenerateReportResponse } from "@/app/types/report";
import { handleAxiosError } from "@/lib/errorHandler";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { UseFormReset, UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";

export function useGenerateReport(
  setError: UseFormSetError<GenerateReportFormData>,
  reset: UseFormReset<GenerateReportFormData>,
  closeModal: () => void
) {
  const [reportData, setReportData] = useState<GenerateReportResponse | null>(null);

  const { mutate: generateReport, isPending } = useMutation({
    mutationFn: (payload: GenerateReportPostFormData) =>
      ReportService.generateReport(payload),
    onSuccess: (response: GenerateReportResponse, variables: GenerateReportPostFormData) => {
      
      reset();
      
      // Store response to display in drawer
      setReportData(response);
      toast.success("Report generated successfully");
      closeModal();
    },
    onError: (error: AxiosError) => handleAxiosError(error, setError),
  });

  return { generateReport, isPending, reportData };
}
