import { ApiResponseError } from "@/app/types/auth";
import { Meta } from "@/app/types/dashboard";
import { Report } from "@/app/types/report";
import { formatDate } from "@/lib/utils";
import { AxiosError } from "axios";
import Pagination from "../Pagination";
import TableState from "./TableState";

interface LoanTableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: Report[]
  meta?: Meta;
  onPageChange?: (page: number) => void;
  onView: (reportId: number) => void;
  
  
  
}

export default function ReportsTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
  onView,
}: LoanTableProps) {
  
  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>#</th>
            <th>Report Id</th>
            <th>Credit Officer</th>
            <th>Email</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={7}
            emptyMessage="No Report records available yet!!"
          />

          {item?.map((report, index) => {
            return (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>ID {report.id}</td>
                <td>{report.submittedBy.role}</td>
                <td>{report.submittedBy.email}</td>
                <td>{formatDate(report.submittedAt)}</td>
                <td>{report.status}</td>
                <td>
                  <label
                    onClick={() => onView(report.id)}
                    htmlFor="my-drawer-5"
                    className="underline cursor-pointer drawer-button text-md decoration-brand-purple text-brand-purple"
                  >
                    <img
                      className="w-4 cursor-pointer"
                      src="/view.svg"
                      alt="view icon"
                    />
                  </label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {meta && onPageChange && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
