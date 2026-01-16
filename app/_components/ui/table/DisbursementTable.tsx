import { ApiResponseError } from "@/app/types/auth";
import { LoanDisbursedItem, Meta } from "@/app/types/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AxiosError } from "axios";
import { JSX } from "react";
import Badge from "../Badge";
import Pagination from "../Pagination";
import TableState from "./TableState";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: LoanDisbursedItem[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function DisbursementTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
}: TableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>#</th>
            <th>Loan ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Intrest</th>
            <th>Date Disbursed</th>
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={7}
            emptyMessage="No loan disbursed available yet!!"
          />
          {item?.map((loan, index) => {
            return (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>ID: Loan{index + 1}</td>
                <td>{loan.name}</td>
                <td>
                  <Badge badge={loan.status} />
                </td>
                <td>{formatCurrency(loan.amount)}</td>
                <td>{formatCurrency(loan.interest)}</td>
                <td>{formatDate(loan.dateDisbursed)}</td>
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
