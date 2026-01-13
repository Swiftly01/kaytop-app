import { ApiResponseError } from "@/app/types/auth";
import { Meta } from "@/app/types/dashboard";
import { AxiosError } from "axios";
import Pagination from "../Pagination";
import TableState from "./TableState";
import {
  CustomerDetails,
  LoanDetails,
  RepaymentHistory,
} from "@/app/types/loan";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: RepaymentHistory[];
  customerDetails?: CustomerDetails;
  loanDetails?: LoanDetails;
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function LoanRepaymentTable({
  isLoading,
  error,
  item,
  customerDetails,
  loanDetails,
  meta,
  onPageChange,
}: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={5}
            emptyMessage="No Loan data available yet!!"
          />

          {item?.map((repayment, index) => {
            return (
              <tr key={repayment.id}>
                <td>{index + 1}</td>
                <td>
                  {customerDetails?.firstName} {customerDetails?.lastName}
                </td>
                <td>{formatCurrency(Number(repayment.amount))}</td>
                <td>{loanDetails?.status}</td>
                <td>{formatDate(repayment.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {meta && onPageChange && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
