import { X, FileText, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ReportStatus, Report } from "@/app/types/report";
import Button from "@/app/_components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  isLoading?: boolean;
}

const statusConfig: Record<ReportStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
 "": {label: "Default", color: "bg-gray-200 text-secondary-foreground", icon: FileText },
  draft: { label: "Draft", color: "bg-gray-200 text-secondary-foreground", icon: FileText },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700", icon: Clock },
  forwarded: { label: "Forwarded", color: "bg-purple-100 text-purple-700", icon: AlertCircle },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle },
  declined: { label: "Declined", color: "bg-destructive/10 text-destructive", icon: XCircle },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Calendar },
};

export default function ViewReportModal({ isOpen, onClose, report, isLoading }: Props) {
  if (!isOpen) return null;

  const status = report ? statusConfig[report.status] : null;
  const StatusIcon = status?.icon || FileText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg relative p-6 animate-in fade-in slide-in-from-bottom-3 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">Loading report...</p>
          </div>
        ) : report ? (
          <>
            {/* Header */}
            <div className="mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{report.title}</h2>
              <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status?.label}
                </span>
                </div>        
              </div>
            </div>

            {/* Report Details */}
            <div className="space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  icon={<Calendar className="w-4 h-4 text-primary" />}
                  label="Report Period"
                  value={`${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}`}
                />
                <InfoCard
                  icon={<Calendar className="w-4 h-4 text-primary" />}
                  label="Report Date"
                  value={new Date(report.reportDate).toLocaleDateString()}
                />
                <InfoCard
                  icon={<FileText className="w-4 h-4 text-primary" />}
                  label="Report Type"
                  value={report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                />
                <InfoCard
                  icon={<Clock className="w-4 h-4 text-primary" />}
                  label="Submitted At"
                  value={new Date(report.submittedAt).toLocaleString()}
                />
              </div>

              {/* Metrics */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Report Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard
                    label="Loans Disbursed"
                    value={`₦${Number(report.totalLoansDisbursed).toLocaleString()}`}
                  />
                  <MetricCard
                    label="Loans Processed"
                    value={report.totalLoansProcessed.toString()}
                  />
                  <MetricCard
                    label="Savings Processed"
                    value={`₦${Number(report.totalSavingsProcessed).toLocaleString()}`}
                  />
                  <MetricCard
                    label="Recollections"
                    value={`₦${Number(report.totalRecollections).toLocaleString()}`}
                  />
                </div>
              </div>

              {/* Submitted By */}
              {report.submittedBy && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Submitted By</h3>
                  <div className="flex items-center gap-3 bg-[#f4ebff] rounded-lg p-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {report.submittedBy.profilePicture ? (
                        <img
                          src={report.submittedBy.profilePicture}
                          alt={report.submittedBy.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {report.submittedBy.firstName} {report.submittedBy.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {report.submittedBy.email} • {report.submittedBy.branch}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {report.remarks && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Remarks</h3>
                  <p className="text-sm text-muted-foreground bg-[#f4ebff] rounded-lg p-3">
                    {report.remarks}
                  </p>
                </div>
              )}

              {/* Decline Reason */}
              {report.declineReason && (
                <div>
                  <h3 className="text-sm font-medium text-destructive mb-2">Decline Reason</h3>
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                    {report.declineReason}
                  </p>
                </div>
              )}

              {/* Workflow History */}
              {report.workflowHistory && report.workflowHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Workflow History</h3>
                  <div className="space-y-2">
                    {report.workflowHistory.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm border-l-2 border-border pl-3 py-1"
                      >
                        <div className="flex-1">
                          <p className="text-foreground font-medium">{item.action}</p>
                          <p className="text-xs text-muted-foreground">
                            by {item.userName} • {new Date(item.timestamp).toLocaleString()}
                          </p>
                          {item.comment && (
                            <p className="text-xs text-muted-foreground mt-1">{item.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border">
              <Button onClick={onClose} className="w-full flex-1 items-center bg-violet-600 text-white">
                Close
              </Button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Report not found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f4ebff] rounded-lg p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}
