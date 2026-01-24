import { useState } from "react";
import { X, Loader2, CheckCircle, XCircle, FileText, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/Select";
import { CreateReportPayload, Report, ReportType } from "@/app/types/report";
import Button from "@/app/_components/ui/Button";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateReportPayload) => Promise<Report>;
  onSubmit: (reportId: number, remarks?: string) => Promise<void>;
}

type Step = "details" | "summary" | "remarks" | "success" | "error";

const reportTypes: { value: ReportType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
];

export default function CreateReportModal({
  isOpen,
  onClose,
  onCreate,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<Step>("details");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdReport, setCreatedReport] = useState<Report | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ReportType>("daily");
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [remarks, setRemarks] = useState("");

  function handleClose() {
    setStep("details");
    setTitle("");
    setDescription("");
    setType("daily");
    setReportDate(new Date().toISOString().split("T")[0]);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setRemarks("");
    setCreatedReport(null);
    setErrorMessage("");
    setIsLoading(false);
    onClose();
  }

  function handleContinueToSummary() {
    if (!title.trim() || !description.trim()) return;
    setStep("summary");
  }

  async function handleCreateReport() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const report = await onCreate({
        title,
        description,
        type,
        reportDate,
        startDate,
        endDate,
      });
      setCreatedReport(report);
      setStep("remarks");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create report");
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitReport() {
    if (!createdReport) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      await onSubmit(createdReport.id, remarks?.trim() || undefined);
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit report");
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }

  const isDetailsValid = title.trim() && description.trim() && startDate && endDate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-lg relative p-6 animate-in fade-in slide-in-from-bottom-3 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        {step !== "success" && step !== "error" && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              {step === "details" && "Create New Report"}
              {step === "summary" && "Review Report"}
              {step === "remarks" && "Final Remarks"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "details" && "Fill in the report details below"}
              {step === "summary" && "Review your report before creating"}
              {step === "remarks" && "Add any final remarks (optional)"}
            </p>
          </div>
        )}

        {/* STEP 1 – DETAILS */}
        {step === "details" && (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Report Title *
              </label>
              <Input
                placeholder="e.g. Daily Report - Lagos Island"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Description *
              </label>
              <textarea
                placeholder="Brief description of the report..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border items-center p-2 border-gray-300"
              />
            </div>

            {/* Report Type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Report Type
              </label>
              <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Report Date */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Report Date
              </label>
              <Input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleClose} className="flex-1 bg-gray-300">
                Cancel
              </Button>
              <Button
                onClick={handleContinueToSummary}
                disabled={!isDetailsValid}
                className="flex-1 items-center bg-violet-600 text-white"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 – SUMMARY */}
        {step === "summary" && (
          <div className="space-y-4">
            <div className="bg-[#f4ebff] rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {description}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <DetailRow label="Report Type" value={type.charAt(0).toUpperCase() + type.slice(1)} />
                <DetailRow label="Report Date" value={new Date(reportDate).toLocaleDateString()} />
                <DetailRow
                  label="Period"
                  value={`${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Clicking "Create Report" will generate the report with auto-calculated
              metrics from your branch data.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setStep("details")}
                className="flex-1 bg-gray-200"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateReport}
                disabled={isLoading}
                className="flex-1 items-center bg-violet-600 text-white"
              >
                {isLoading ? (
                  <>
                  <div className="flex items-center gap-3 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                    </div>
                  </>
                ) : (
                  "Create Report"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 – REMARKS */}
        {step === "remarks" && createdReport && (
          <div className="space-y-4">
            {/* Report Summary Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Report Created Successfully</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-foreground font-medium">Loans Disbursed:</span>{" "}
                  ₦{Number(createdReport.totalLoansDisbursed).toLocaleString()}
                </p>
                <p className="text-muted-foreground">
                  <span className="text-foreground font-medium">Loans Processed:</span>{" "}
                  {createdReport.totalLoansProcessed}
                </p>
                <p className="text-muted-foreground">
                  <span className="text-foreground font-medium">Savings Processed:</span>{" "}
                  ₦{Number(createdReport.totalSavingsProcessed).toLocaleString()}
                </p>
                <p className="text-muted-foreground">
                  <span className="text-foreground font-medium">Recollections:</span>{" "}
                  ₦{Number(createdReport.totalRecollections).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Remarks Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Final Remarks (Optional)
              </label>
              <textarea
                placeholder="Add any additional comments for the branch manager..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full rounded-md border items-center p-2 border-gray-300"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleClose} className="flex-1 bg-gray-200">
                Save as Draft
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={isLoading}
                className="flex-1 items-center bg-violet-600 text-white"
              >
                {isLoading ? (
                  <>
                  <div className="flex items-center gap-3 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                    </div>
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {step === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Report Submitted!
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Your report has been submitted successfully and sent to the branch
              manager for review.
            </p>
            <Button onClick={handleClose}  className="flex-1 mt-6 items-center bg-violet-600 text-white">
              Done
            </Button>
          </div>
        )}

        {/* ERROR STATE */}
        {step === "error" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Something Went Wrong
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {errorMessage}
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={handleClose} className="flex-1 bg-gray-200">
                Cancel
              </Button>
              <Button onClick={() => setStep("details")} className="flex-1 items-center bg-violet-600 text-white">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
