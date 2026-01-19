import { ApiResponseError } from "@/app/types/auth";
import { Meta } from "@/app/types/dashboard";
import { Items } from "@/app/types/loan";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AxiosError } from "axios";
import Pagination from "../Pagination";
import TableState from "./TableState";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: Items[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
  renderExtraColumn?: (item: Items) => React.ReactNode;
}

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";
  if (status === "Paid") return <span className={base + " text-emerald-700 bg-emerald-100"}>Paid</span>;
  if (status === "Missed") return <span className={base + " text-red-700 bg-red-100"}>Missed</span>;
  if (status === "Upcoming") return <span className={base + " text-slate-700 bg-slate-100"}>Upcoming</span>;
  return <span className={base + " text-gray-700 bg-gray-100"}>{status}</span>;
}

function mapScheduleStatus(status: string) {
  if (status === "PAID") return "Paid";
  if (status === "MISSED") return "Missed";
  return "Upcoming";
}

export default function PaymentScheduleTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
  renderExtraColumn,
}: TableProps) {
 

  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>Day</th>
            <th>Amount Paid</th>
            <th>Amount Due</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Date</th>
            {renderExtraColumn && <th></th>}
            
            
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={renderExtraColumn ? 7 : 6}
            emptyMessage="No payment schedule data available yet!!"
          />

          {item?.map((schedule, index) => {
            return (
              <tr key={index}>
                <td>
                 Day {schedule.day}
                </td>
                <td>{formatCurrency(schedule.paidAmount)}</td>
                <td>{formatCurrency(schedule.dueAmount)}</td>
                <td>{formatCurrency(schedule.remainingBalance)}</td>
                 <td><StatusBadge status={mapScheduleStatus(schedule.status)} /></td>
                <td>{formatDate(schedule.dueDate)}</td>
                {renderExtraColumn && <td>{renderExtraColumn(schedule)}</td>}
               
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
