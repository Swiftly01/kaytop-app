import { useModal } from "@/app/hooks/useModal";
import { GenerateReportResponse } from "@/app/types/report";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import Button from "./Button";
import Error from "./Error";
import GlobalModal from "./GlobalModal";
import { Label } from "./label";
import { useSubmitReportToHq } from "@/app/dashboard/bm/queries/reports/useSubmitReportToHq";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";
import Spinner from "./Spinner";

interface ReportDrawerProps {
  reportData: GenerateReportResponse | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ReportDrawer({
  reportData,
  isOpen,
  setIsOpen,
}: ReportDrawerProps) {
  useEffect(() => {
    if (reportData) {
      setTimeout(() => setIsOpen(true), 0);
    }
  }, [reportData]);

  const data = reportData?.data;

  const isDaily = data?.type === "daily";
  const isWeekly = data?.type === "weekly";
  const isMonthly = data?.type === "monthly";

  const {
    open: openModal,
    close: closeModal,
    isOpen: isRemarkModalOpen,
  } = useModal();

  const schema = z.object({
    remarks: z.string().min(1, "Remark is required"),
  });

  type RemarkData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const { submitReport, isPending: isSubmitting } = useSubmitReportToHq(
    setError,
    reset,
    closeModal,
    setIsOpen,
  );

  const onSubmit = (formData: RemarkData) => {
    if (!reportData?.data.id) return;

    const payload = {
      reportId: reportData.data.id,
      data: formData,
    };

    submitReport(payload);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => !isSubmitting && setIsOpen(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 md:w-120 bg-white z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 overflow-auto h-full">
          <h1 className="font-semibold text-center text-md text-neutral-700 mb-4">
            Generated Report
          </h1>

          {data ? (
            <div className="space-y-4">
              {/* Always shown */}
              <div>
                <p className="text-md text-slate-400">Branch</p>
                <h1 className="font-medium text-neutral-800">{data.branch}</h1>
              </div>

              <div>
                <p className="text-md text-slate-400">Title</p>
                <h1 className="font-medium text-neutral-800">{data.title}</h1>
              </div>

              <div>
                <p className="text-md text-slate-400">Description</p>
                <h1 className="font-medium text-neutral-800">
                  {data.description}
                </h1>
              </div>

              <div>
                <p className="text-md text-slate-400">Type</p>
                <h1 className="font-medium text-neutral-800">{data.type}</h1>
              </div>

              <div>
                <p className="text-md text-slate-400">Report Date</p>
                <h1 className="font-medium text-neutral-800">
                  {formatDate(data.reportDate)}
                </h1>
              </div>

              {/* Conditionally shown for daily reports */}
              {isDaily && (
                <>
                  <div>
                    <p className="text-md text-slate-400">
                      Total Loans Processed
                    </p>
                    <h1 className="font-medium text-neutral-800">
                      {data.totalLoansProcessed}
                    </h1>
                  </div>

                  <div>
                    <p className="text-md text-slate-400">
                      Total Loans Disbursed
                    </p>
                    <h1 className="font-medium text-neutral-800">
                      {data.totalLoansDisbursed}
                    </h1>
                  </div>

                  <div>
                    <p className="text-md text-slate-400">
                      Total Recollections
                    </p>
                    <h1 className="font-medium text-neutral-800">
                      {data.totalRecollections}
                    </h1>
                  </div>

                  <div>
                    <p className="text-md text-slate-400">
                      Total Savings Processed
                    </p>
                    <h1 className="font-medium text-neutral-800">
                      {data.totalSavingsProcessed}
                    </h1>
                  </div>
                </>
              )}

              {/* Conditionally show weekly/monthly summary */}
              {(isWeekly || isMonthly) && (
                <>
                  <div>
                    <p className="text-md text-slate-400">Branch Total Loans</p>
                    <h1 className="font-medium text-neutral-800">
                      {data.branchTotalLoans}
                    </h1>
                  </div>

                  <div>
                    <p className="text-md text-slate-400">
                      Branch Total Savings
                    </p>
                    <h1 className="font-medium text-neutral-800">
                      {data.branchTotalSavings}
                    </h1>
                  </div>
                </>
              )}

              {/* Submitted By Info */}
              <div>
                <p className="text-md text-slate-400">Submitted By</p>
                <h1 className="font-medium text-neutral-800">
                  {data.submittedBy.firstName} {data.submittedBy.lastName} (
                  {data.submittedBy.role})
                </h1>
              </div>

              {/* Workflow History */}
              {data.workflowHistory.length > 0 && (
                <div>
                  <p className="text-md text-slate-400">Workflow History</p>
                  <ul className="list-disc pl-5">
                    {data.workflowHistory.map((action) => (
                      <li key={action.timestamp}>
                        <strong>{action.action}</strong>: {action.comment} (
                        {action.userName})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={openModal} variant="primary" fullWidth={true}>
                Submit Report to HQ
              </Button>
            </div>
          ) : (
            <p>No report generated yet</p>
          )}
        </div>

        <GlobalModal
          title="Submit Report to HQ"
          open={isRemarkModalOpen}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  disabled={isSubmitting}
                  placeholder="Enter your remrks"
                  {...register("remarks")}
                />
                {errors.remarks && <Error error={errors.remarks.message} />}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                fullWidth={true}
                type="button"
                variant="danger"
                onClick={closeModal}
              >
                Close
              </Button>

              <Button
                fullWidth={true}
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "Submit"}
              </Button>
            </div>
          </form>
        </GlobalModal>
      </div>
    </>
  );
}
