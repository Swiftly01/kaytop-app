import Pagination from "@/app/_components/ui/Pagination";
import TableState from "@/app/_components/ui/table/TableState";
import { ApiResponseError } from "@/app/types/auth";
import { Meta } from "@/app/types/dashboard";
import { ReportListItem, ReportStatus } from "@/app/types/report";
import { AxiosError } from "axios";
import { FileText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";



interface ReportsTableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  reports: ReportListItem[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
  onRowClick: (reportId: number) => void;
}


const statusConfig: Record<ReportStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: "Draft", color: "bg-gray-200 text-secondary-foreground", icon: FileText },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700", icon: Clock },
  forwarded: { label: "Forwarded", color: "bg-purple-100 text-purple-700", icon: AlertCircle },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle },
  declined: { label: "Declined", color: "bg-destructive/10 text-destructive", icon: XCircle },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
};

export default function ReportsTable({ reports, isLoading, onRowClick, meta, onPageChange, error}: ReportsTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">Loading reports...</p>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="p-8 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">No reports found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first report using the button above
        </p>
      </div>
    );
  }

  return (
      <div className="overflow-x-auto">
    <table className="table table-md text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-4 w-12 text-center">#</th>
          <th className="p-4">Title</th>
          <th className="p-4">Type</th>
          <th className="p-4">Status</th>
          <th className="p-4">Report Date</th>
          <th className="p-4">Submitted</th>
        </tr>
      </thead>
      <tbody>
         <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && !reports?.length}
            colSpan={6}
            emptyMessage="No reports found"
          />
        {reports?.map((report, index) => {
            const status = statusConfig[report.status];
            const StatusIcon = status.icon;

            const rowNumber =
                meta ? (meta.page - 1) * meta.limit + index + 1 : index + 1;


          return (
            <tr
              key={report.id}
              className="border-t hover:bg-gray-50 text-nowrap cursor-pointer"
              onClick={() => onRowClick(report.id)}
            >
              <td className="p-4 text-center text-muted-foreground">
                 {rowNumber}
                </td>
              <td className="p-4">
                <div>
                  <p className="font-medium text-foreground">{report.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {report.description}
                  </p>
                </div>
              </td>
              <td className="p-4">
                <span className="text-sm capitalize">{report.type}</span>
              </td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </td>
              <td className="p-4">
                <span className="text-sm">
                  {new Date(report.reportDate).toLocaleDateString()}
                </span>
              </td>
              <td className="p-4">
                <span className="text-sm text-muted-foreground">
                  {report.submittedAt
                    ? new Date(report.submittedAt).toLocaleDateString()
                    : "—"}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    <div className="mt-4 mb-2">
    {meta && onPageChange && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={onPageChange}
            />
          )}
          </div>
          </div>
  );
}
